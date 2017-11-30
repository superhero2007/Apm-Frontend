import * as React from "react";
import * as _ from "lodash";
import {Link} from "react-router";
import {policyDetail_extractPolicyId} from "./policyDetailPage";
import {DSTable} from "./../../../widgets/dsTable";
import {PolicyURLGen} from "../policyLinkUtils";
import {getRouteParam} from "../../../utils";
import {RoutableLoadableComponent} from "../../../widgets/routableLoadableComponent";
import {AlertConditionProperties} from "./condition/metricTypes";
import {Alert, Row} from "react-bootstrap";
import * as classNames from "classnames";
import "./conditionsList.css";
import {Http} from "../../../http";
import {INotificationSettings, ISimpleEnableSettings} from "./notificationsPage";
import {Permission, PermissionManager} from "../../../roles";

export interface IAlertConditionTarget
{
	isAllHosts: boolean;
	hostsIds: string[];
	isAllApps:  boolean;
	appIds:     string[];
	extSvc: string;
	txnId:  number;
	txnName: string;
}
export interface IAlertCondition
{
	id                  :string;
	metricId            :string;
	warningThreshold    :number;
	criticalThreshold   :number;
	criticalDuration    :number;
	warningDuration     :number;
	target              :IAlertConditionTarget;
	enabled             :boolean;
	comparisonType      :string;
}

export class ThresholdComparison
{
	static comparisonEnumToDisplayStr(comparison: string)
	{
		switch (comparison)
		{
			case "GTE": return ">=";
			case "GT": return ">";
			case "LTE": return "<=";
			case "LT": return "<";
		}

		return null;
	}
	static displayStrToEnum(comparison: string)
	{
		switch (comparison)
		{
			case ">=": return "GTE";
			case ">": return "GT";
			case "<=": return "LTE";
			case "<": return "LT";
		}

		return null;
	}
}

interface IState
{
	conditions:IAlertCondition[];
	notifsEnabled: boolean;
}

export class ConditionsPage extends RoutableLoadableComponent<{},IState>
{
	protected initialState():IState
	{
		return {conditions: null, notifsEnabled: true};
	}

	protected getPostUrl():string
	{
		return null;
	}


	getPromiseToLoad():Promise<any>
	{
		const data = policyDetail_extractPolicyId(this.props);
		return Promise.all([Http.post("/alert/policy/conditions", data), Http.post("/alert/policy/notifications/list", data) ]);
	}

	protected getStateFromPostResponse(reponseData:any):IState
	{
		const notifSettings:INotificationSettings = reponseData[1];
		return {conditions: reponseData[0], notifsEnabled: ConditionsPage.hasAnyNotifsSet(notifSettings)};
	}

	private static hasAnyNotifsSet(settings:INotificationSettings)
	{
		const email = settings.email;
		if(email!=null && !_.isEmpty(email.userEmails))
			return true;

		if(this.checkSimpleSettingEnabled(settings.pagerDuty))
			return true;

		if(this.checkSimpleSettingEnabled(settings.slack))
			return true;

		if(this.checkSimpleSettingEnabled(settings.og))
			return true;

		if(this.checkSimpleSettingEnabled(settings.hipChat))
			return true;

		if(this.checkSimpleSettingEnabled(settings.victorOps))
			return true;

		if(this.checkSimpleSettingEnabled(settings.webhook))
			return true;

		if(this.checkSimpleSettingEnabled(settings.dataDog))
			return true;
		
		return false;
	}

	private static checkSimpleSettingEnabled(setting:ISimpleEnableSettings): boolean
	{
		return setting != null && setting.enabled;
	}

	private static getTargetName(it:IAlertCondition)
	{
		if(it.target.txnId !== 0)
			return it.target.txnName;

		if(it.target.extSvc)
			return it.target.extSvc;

		return "-";
	}

	private static getTargetCountDisplay(it:IAlertCondition):string
	{
		if(it.target.txnId !== 0)
			return "1 Txn";

		const hostCount = it.target.hostsIds? it.target.hostsIds.length : 0;
		const appCount = it.target.appIds? it.target.appIds.length : 0;

		if(it.target.isAllHosts)
		{

			let excludedHosts = 0;

			if(it.target.hostsIds)
				excludedHosts = hostCount;

			if(excludedHosts == 0)
				return "All hosts";
			else
				return `All hosts (excluding ${excludedHosts})`;
		}

		if(hostCount > 0)
		{
			if(hostCount ==1)
				return "1 Host";
			else
				return hostCount +" Hosts";
		}

		if (!it.target.isAllApps)
		{
			if (appCount  == 1)
				return "1 App";

			return appCount + " Apps";
		}

		if (appCount > 0)
			return `All Apps (excluding ${appCount})`;
		else
			return "All Apps";
	}

	private onRowClick(condition:IAlertCondition, event)
	{
		event.preventDefault();

		const policyId = getRouteParam(this.props, "policyId");
		const conditionId = condition.id;
		this.context.router.push(`/policy/${policyId}/condition/${conditionId}`);
	}

	private renderNotificationWarning(data:IState)
	{
		if(data.notifsEnabled === false)
		{
			return <Alert className="top2" bsStyle="warning">
				<b>No Notification Channels enabled.</b> Click 'Notification Settings' and enable a channel.
			</Alert>
		}

		return null;
	}

	protected renderContent(data:IState):any
	{
		const canEdit  = PermissionManager.permissionAvailable(Permission.ALERT_POLICY_EDIT);

		const style = {
			moveDown: {
				marginTop: "4em"
			}
		};

		let addBtn;

		if(canEdit)
		{
			addBtn= (<Link to={PolicyURLGen.createUrlForPolicyId(this.props, "addCondition")} className="btn btn-default">
				Add Alert Condition
			</Link>);
		}

		let content;
		if (_.isEmpty(data.conditions)) {

			if(!canEdit)
			{
				content =  <Row style={style.moveDown}>
					<h3>No Conditions defined</h3>
				</Row>;
			}
			else
			{
				content =<Row style={style.moveDown}>
					<Link to={PolicyURLGen.createUrlForPolicyId(this.props, "addCondition")}
					      className="btn btn-default btn-lg btn-success col-md-offset-5">Add Alert Condition
					</Link>
				</Row>
			}
		}
		else {
			let sortedConditions = _.sortBy(data.conditions, "metricId");
			content = <div>
				<DSTable classes="conditionsTable" columnNames={["Metric", "Comparison", "Warning Threshold", "Critical Threshold", "Targets", "Target Name", "Enabled"]}>
					{sortedConditions.map(it=> <tr key={it.id} onClick={this.onRowClick.bind(this, it)}
					                               className={classNames("aLink", {"disabled":!it.enabled})}>
						<td>{AlertConditionProperties.getMetricDefById(it.metricId).label()}</td>
						<td>{ThresholdComparison.comparisonEnumToDisplayStr(it.comparisonType)}</td>
						<td>{it.warningThreshold}</td>
						<td>{it.criticalThreshold}</td>
						<td>{ConditionsPage.getTargetCountDisplay(it)}</td>
						<td>{ConditionsPage.getTargetName(it)}</td>
						<td>{it.enabled? "Yes":"No"}</td>
					</tr>)}
				</DSTable>

				{addBtn}
				{this.renderNotificationWarning(data)}
			</div>;
		}

		return (<div className="container">
			{content}

		</div>);
	}

}