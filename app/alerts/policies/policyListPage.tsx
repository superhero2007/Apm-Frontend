import * as React from "react";
import * as _ from "lodash";
import {LoadableComponent} from "./../../widgets/loadableComponent";
import {PolicyListTable} from "./policyListTable";
import {Link} from "react-router";
import {PermissionManager, Permission} from "../../roles";
export interface IAlertPolicyListItem
{
	name:   string;
	id:     string;
	openIncidents:  number;
	openViolations: number;
}

interface IState
{
	items:IAlertPolicyListItem[];
}

export class PolicyListPage extends LoadableComponent<{},IState>
{
	protected initialState():{items: IAlertPolicyListItem[]}
	{
		return {items: []};
	}

	protected getStateFromPostResponse(reponseData:IAlertPolicyListItem[]):IState
	{
		return {items: reponseData};
	}

	protected getPostUrl():string
	{
		return "/alert/policy/list";
	}

	protected renderContent(data:IState):any
	{
		let addBtn;
		if(PermissionManager.permissionAvailable(Permission.ALERT_POLICY_EDIT))
		{
			addBtn = <Link to="/addpolicy" className="btn btn-default">Add Alert Policy</Link>;
		}

		var content;
		if (_.isEmpty(data.items)) {
			content = <h3>No Alert Policies defined</h3>
		}
		else {
			content = <PolicyListTable items={data.items}/>;
		}

		return (
			<div className="container">
				{content}
				{addBtn}
			</div>
		);
	}
}