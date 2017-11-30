import * as React from "react";
import {getRouteParam} from "../../../../utils";
import {IAlertCondition, ThresholdComparison} from "../conditionsPage";
import {AlertConditionProperties, MetricDefinition, MetricDefUtils, TargetType} from "./metricTypes";
import {Button, ButtonToolbar, Col, Grid, Panel, Row} from "react-bootstrap";
import {Http} from "../../../../http";
import {AppTargetSelectionPanel, ServerTargetSelectionPanel} from "./targetSelectionPanel";
import {PolicyURLGen} from "../../policyLinkUtils";
import {CancelButton} from "../../../../widgets/cancelButton";
import {AbstractEditConditionForMetricPage, IState} from "./abstractEditConditionPage";
import {ConfirmDlg} from "../../../../widgets/confirmDlg";
import * as Switch from 'antd/lib/switch';
import {RowCol} from "../../../../widgets/rowCol";
import {Permission, PermissionManager} from "../../../../roles";
import {NotAllowedDlg} from "../../../../widgets/notAllowed";
import {RoutableLoadableComponent} from "../../../../widgets/routableLoadableComponent";
import {ServerSeriesUtils} from "../../../../server/serverCommons";

export class EditConditionPage extends RoutableLoadableComponent<{}, {}>
{
	constructor(props, context)
	{
		super(props, context);
	}

	private conditionDetail:IAlertCondition;

	protected initialState(): {}
	{
		return {};
	}

	getPromiseToLoad():Promise<any>
	{
		const policyId = getRouteParam(this.props, "policyId");
		const conditionId = getRouteParam(this.props, "conditionId");
		const data = {policyId: policyId, conditionId: conditionId};

		return Promise.all([Http.post("/alert/policy/conditions/detail", data)]);
	}


	protected getStateFromPostResponse(responseData: any[]): {}
	{
		this.conditionDetail = responseData[0];
		return {};
	}

	protected renderContent(data: {}): any
	{
		const params = (this.props as any).params as any;
		return <EditConditionNew conditionDetail={this.conditionDetail} params={({conditionId: params.conditionId, policyId: params.policyId})}/>;
	}

}

interface IRouterParms
{
	conditionId: string;

	policyId: string;
}
class EditConditionNew extends AbstractEditConditionForMetricPage<{
	conditionDetail: IAlertCondition
	params: IRouterParms;
}>
{


	constructor(props, context)
	{
		super(props, context);
	}

	protected getConditionId()
	{
		return getRouteParam(this.props, "conditionId");
	}

	protected getCurrentMetric(): MetricDefinition
	{
		return AlertConditionProperties.getMetricDefById(this.props.conditionDetail.metricId);
	}

	getPromiseToLoad():Promise<any>
	{
		let targetUrl;
		if(this.getCurrentMetric().target === TargetType.SERVER)
		{
			targetUrl = "/servers/listSimple";
		}
		else
		{
			targetUrl = "/alert/targetApps";
		}
		return Promise.all([Http.post(targetUrl)]);
	}

	protected getStateFromPostResponse(reponseData:any):IState
	{
		const metricDefinition = this.getCurrentMetric();
		if(metricDefinition.target === TargetType.SERVER)
		{
			this.hostList = reponseData[0];
			ServerSeriesUtils.labelHosts(this.hostList);
		}
		else
		{
			this.appList = reponseData[0];
		}
		return Object.assign({}, this.initialState(),{enabled: this.props.conditionDetail.enabled});
	}

	private doSave()
	{
		if(!PermissionManager.permissionAvailable(Permission.ALERT_POLICY_EDIT))
		{
			(this.refs["nadlg"] as NotAllowedDlg).showDlg();
			return;
		}
		this.onSave("/alert/policy/conditions/edit");
	}



	private renderThresholdPanel(metric:MetricDefinition)
	{
		const Panel = MetricDefUtils.getThresholdConfigPanel(metric);

		return <Panel ref="thresholdPanel"  defaultWarningDuration={this.props.conditionDetail.warningDuration} defaultCriticalDuration={this.props.conditionDetail.criticalDuration}
		              defaultWarningValue={this.props.conditionDetail.warningThreshold} defaultCriticalValue={this.props.conditionDetail.criticalThreshold}
		              defaultComparison={ThresholdComparison.comparisonEnumToDisplayStr(this.props.conditionDetail.comparisonType)}/>
	}

	private onToggleEnable(toggleState)
	{
		const myState = this.getMyState();
		this.updateMyState(Object.assign({}, myState, {enabled: toggleState}));
	}

	onDeleteClick()
	{
		const ref: any = this.refs["deleteDlg"];

		ref.showDlg();
	}

	private rendertargetName()
	{
		const metricDefinition = this.getCurrentMetric();

		let name = null;

		if(metricDefinition.target === TargetType.EXT_SVC)
		{
			name = "External Service: " +this.props.conditionDetail.target.extSvc;
		}
		else if(metricDefinition.target === TargetType.TXN)
		{
			name = "Transaction Name: " +this.props.conditionDetail.target.txnName;
		}

		if(name)
		{
			return (
				<div>
					<RowCol>
						<h5>{name}</h5>
					</RowCol>
				</div>
			);
		}

		return null;
	}

	onConfirmDelete()
	{
		const policyId = getRouteParam(this.props, "policyId");
		const conditionId = this.getConditionId();

		let data = {policyId: policyId, conditionId: conditionId};

		Http.post("/alert/policy/conditions/delete", data).then(()=>
		{
			this.redirectToConditionList();
		});
	}

	protected renderContent(data:IState):any
	{
		const cancelUrl = PolicyURLGen.createUrlForPolicyId(this.props, "conditions");
		const metric = this.getCurrentMetric();

		let targetSelection = null;
		if(metric.target !== TargetType.TXN)
		{
			if(metric.target === TargetType.SERVER)
			{
				targetSelection = <ServerTargetSelectionPanel itemList={this.hostList} defaultIsAll={this.props.conditionDetail.target.isAllHosts} defaultSelectedItemsIds={this.props.conditionDetail.target.hostsIds}
				                                              ref={(p) => this.targetPanel = p}/>;
			}
			else
			{
				targetSelection = <AppTargetSelectionPanel itemList={this.appList} defaultIsAll={this.props.conditionDetail.target.isAllApps} defaultSelectedItemsIds={this.props.conditionDetail.target.appIds}
				                                           ref={(p) => this.targetPanel = p}/>;
			}
		}

		let Switch2 = Switch as any;
		return (
			<Grid>
				<Row>
					<Col xs={6}>
						<h4>{metric.label()}</h4>
					</Col>
					<Col xs={3}>
						<div className="pull-right">
							<Switch2 checked={data.enabled} onChange={this.onToggleEnable.bind(this)}
							         checkedChildren={"Enabled"} unCheckedChildren={"Disabled"} className={"showTagsSwitch"}
							/>
						</div>
					</Col>
					<Col xs={3}>
						<div className="pull-right">
							<Button bsStyle="danger" onClick={this.onDeleteClick.bind(this)}>Delete</Button>
						</div>
					</Col>

				</Row>
				{this.rendertargetName()}

				{this.renderThresholdPanel(metric)}
				{targetSelection}
				<ButtonToolbar>
					<CancelButton cancelUrl={cancelUrl}/>
					<Button bsStyle="success" onClick={this.doSave.bind(this)}>Save</Button>
				</ButtonToolbar>
				<ConfirmDlg ref="deleteDlg" onYes={this.onConfirmDelete.bind(this)}/>
				{this.renderErrMsg(data)}
				<NotAllowedDlg ref="nadlg"/>
			</Grid>);
	}

}