import * as React from "react";
import * as _ from "lodash";
import {LoadableComponent} from "./../../../widgets/loadableComponent";
import {AlertUtils} from "../../AlertUtils";
import {policyDetail_extractPolicyId} from "./policyDetailPage";
import {DSTable} from "./../../../widgets/dsTable";
import {Link} from "react-router";
import "./violations.css";
import {accountStatus} from "../../../accountStatus";
import {NeedPro} from "../../../widgets/needPro";
import {ThresholdComparison} from "./conditionsPage";
import {AmplitudeAnalytics} from "../../../analytics";

export interface IViolation
{
	id: string;
	appName: string;
	severity: string;
	conditionName: string;
	incidentId: string;
	beginTime: number;
	endTime: number;
	conditionThreshold: string;
	comparisonType: string;
	targetName: string;
	targetType: string;
}


export class ViolationPresenter
{
	static NOAPP = "<noapp>";
	static conditionTargetTypeToLabel(violation: IViolation)
	{
		switch (violation.targetType)
		{
			case "APP":
				return "App";
			case "EXT_SVC":
				return "External Service";
			case "TXN":
				return "Transaction";
			case "SERVER":
				return "Server";

		}
		return violation.targetType;
	}

	static appLabel(violation: IViolation)
	{
		if(violation.appName === ViolationPresenter.NOAPP)
			return "-";

		return violation.appName;
	}
}

interface IState
{
	items: IViolation[];
}

export class ViolationUtils
{
	static conditionDisplayStr(v: IViolation)
	{
		return v.conditionName + ` ${ThresholdComparison.comparisonEnumToDisplayStr(v.comparisonType)} ` + v.conditionThreshold;
	}
}

export class ViolationsListPage extends LoadableComponent<{}, IState>
{

	constructor(props, context)
	{
		super(props, context);
		AmplitudeAnalytics.track("ViolationsPage");
	}


	protected initialState(): { items: IViolation[] }
	{
		return {items: []};
	}

	protected getStateFromPostResponse(reponseData: IViolation[]): IState
	{
		return {items: reponseData};
	}

	protected getPostUrl(): string
	{
		return "/alert/violations/list/policy";
	}

	protected getPostData(): any
	{
		return policyDetail_extractPolicyId(this.props);
	}


	static violationRowClassName(it: IViolation): string
	{
		return this.violationRowClassPure(it) + " " + (AlertUtils.hasNotEnded(it.endTime) ? "open" : "closed");
	}

	static violationRowClassPure(it: IViolation)
	{
		return (it.severity == "Critical" ? "violation-danger" : "violation-warning");
	}

	protected renderContent(data: IState): any
	{
		if (!accountStatus.isPro)
			return <NeedPro pageName="Violations"/>;

		let policyId = policyDetail_extractPolicyId(this.props).policyId;
		let content;
		if (_.isEmpty(data.items))
		{
			content = <h3>No Violations!</h3>
		}
		else
		{
			content = <DSTable classes="violationsTable" noStripe={true} noBorder={true} noHover={true}
			                   columnNames={["Id", "Application", "Target Type", "Target", "Severity", "Condition", "Began At", "Ended At", "Incident"]}>
				{data.items.map(it => <tr key={it.id} className={ViolationsListPage.violationRowClassName(it)}>
					<td>{AlertUtils.humanize_ViolationId(it.id)}</td>
					<td>{ViolationPresenter.appLabel(it)}</td>
					<td>{ViolationPresenter.conditionTargetTypeToLabel(it)}</td>
					<td>{it.targetName}</td>
					<td>{it.severity}</td>
					<td>{ViolationUtils.conditionDisplayStr(it)}</td>
					<td>{AlertUtils.humanize_unixtime(it.beginTime)}</td>
					<td>{AlertUtils.humanize_unixtime(it.endTime)}</td>
					<td><Link to={`/policy/${policyId}/incident/${it.incidentId}`}>{AlertUtils.humanize_IncidentId(it.incidentId)}</Link></td>
				</tr>)}
			</DSTable>;
		}

		return (
			<div className="container-fluid">
				{content}
			</div>
		);
	}
}
