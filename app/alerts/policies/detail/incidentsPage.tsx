import * as React from "react";
import * as PropTypes from "prop-types";
import * as _ from "lodash";
import {LoadableComponent} from "./../../../widgets/loadableComponent";
import {DSTable} from "./../../../widgets/dsTable";
import {policyDetail_extractPolicyId} from "./policyDetailPage";
import {AlertUtils} from "../../AlertUtils";
import "./violations.css";
import {getRouteParam} from "../../../utils";
import {IncidentDetailPage} from "./incident/incidentDetailPage";
import {accountStatus} from "../../../accountStatus";
import {NeedPro} from "../../../widgets/needPro";
import {AmplitudeAnalytics} from "../../../analytics";

export interface IIncident
{
	id                  :string;
	beginTime           :number;
	endTime             :number;
	ackUser             :string;
	ackTime             :number;
}

interface IState
{
	incidents:IIncident[];
}

export class IncidentsPage extends LoadableComponent<{},IState>
{
	static contextTypes:any = {
		router: PropTypes.any.isRequired
	};

	context: any;

	constructor(props, context)
	{
		super(props, context);
		AmplitudeAnalytics.track("IncidentsPage");
	}

	protected initialState():IState
	{
		return {incidents: null};
	}

	protected getPostUrl():string
	{
		return "/alert/incidents/list/policy";
	}

	protected getPostData():any
	{
		return policyDetail_extractPolicyId(this.props);
	}

	protected getStateFromPostResponse(reponseData:any):IState
	{
		return {incidents: reponseData};
	}

	onIncidentRowClick(incident:IIncident, event)
	{
		event.preventDefault();

		var policyId = getRouteParam(this.props,"policyId");
		var incidentId = incident.id;
		this.context.router.push(`/policy/${policyId}/incident/${incidentId}`);
	}

	protected renderContent(data:IState):any
	{
		if(!accountStatus.isPro)
			return <NeedPro pageName="Incidents"/>;

		var content;
		if (_.isEmpty(data.incidents)) {
			content = <h3>No incidents!</h3>;
		}
		else
		{
			content =<DSTable columnNames={["Id","Began At","Ended At", "Ack By"]} classes="incidentsTable">
				{data.incidents.map(it=> <tr key={it.id} className={AlertUtils.hasNotEnded(it.endTime)?"open danger aLink":"aLink"} onClick={this.onIncidentRowClick.bind(this, it)}>
					<td>{AlertUtils.humanize_IncidentId(it.id)}</td>
					<td>{AlertUtils.humanize_unixtime(it.beginTime)}</td>
					<td>{AlertUtils.humanize_unixtime(it.endTime)}</td>
					<td>{IncidentDetailPage.incidentAckUser(it,"-")}</td>
				</tr>)}
			</DSTable>;
		}

		return (<div className="container">
			{content}
		</div>);
	}

}
