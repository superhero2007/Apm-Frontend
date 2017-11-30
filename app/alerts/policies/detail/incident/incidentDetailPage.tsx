import * as React from "react";
import * as _ from "lodash";
import {LoadableComponent} from "./../../../../widgets/loadableComponent";
import {DSTable} from "./../../../../widgets/dsTable";
import {AlertUtils} from "../../../AlertUtils";
import {IViolation, ViolationPresenter, ViolationsListPage, ViolationUtils} from "../violationsListPage";
import "../violations.css";
import {getRouteParam} from "../../../../utils";
import {Http} from "../../../../http";
import {Row, Col} from "react-bootstrap";
import {IIncident} from "../incidentsPage";
import {PromiseButton} from "./../../../../widgets/promseButton";
import {RowCol} from "./../../../../widgets/rowCol";
import {accountStatus} from "../../../../accountStatus";
import {NeedPro} from "../../../../widgets/needPro";
import {AmplitudeAnalytics} from "../../../../analytics";
import moment = require('moment');

declare var require:any;
require('moment-duration-format');

interface IIncidentDetail {
	violations:IViolation[];
	policyName: string;
	incident:   IIncident;
}
interface IState
{
	curIncident:   IIncident;
}

export class IncidentDetailPage extends LoadableComponent<{},IState>
{
	private incidentDetail: IIncidentDetail;

	constructor(props, context)
	{
		super(props, context);
		AmplitudeAnalytics.track("IncidentsDetail");
	}


	protected initialState():IState
	{
		return {curIncident: null};
	}

	protected getPostUrl():string
	{
		return "/alert/incident/detail";
	}


	protected getPostData():any
	{
		const incidentId = getRouteParam(this.props,"incidentId");
		return {incidentId: incidentId};
	}


	protected getStateFromPostResponse(reponseData:any):IState
	{
		this.incidentDetail = reponseData;
		return {curIncident: this.incidentDetail.incident};
	}

	private onDoAck()
	{
		return Http.post('/alert/incident/ack', this.getPostData());
	}

	private onAckDone(data)
	{
		this.update_myStateProps({curIncident: data});
	}

	public static incidentAckUser(inc:IIncident, noneUserName:string)
	{
		const userName = inc.ackUser? inc.ackUser.split(':')[0]:noneUserName;
		return userName;
	}

	protected renderIncidentDetail(data:IState, violationCount:number, appCount:number)
	{
		const inc = data.curIncident;

		let durationEnd;
		if(AlertUtils.hasNotEnded(inc.endTime))
			durationEnd = AlertUtils.currentUnixTime();
		else
			durationEnd = inc.endTime;

		const duartionInSecs = durationEnd - inc.beginTime;
		const d:any = moment.duration(duartionInSecs, 'seconds');
		const durationStr = d.format('d [day] h [hr] m [min]');


		const shouldAck = inc.ackUser == null && AlertUtils.hasNotEnded(inc.endTime);

		let ackDetail = null;
		if(shouldAck)
		{
			ackDetail = <Row className="top1">
					<Col xs={2}>
						<PromiseButton bsStyle="info" text="Acknowledge" promiseCreator={this.onDoAck.bind(this)} onPromiseDone={this.onAckDone.bind(this)}/>
					</Col>
				</Row>;
		}
		else {
			const userName = IncidentDetailPage.incidentAckUser(inc, "Noone");
			const ackTime = inc.ackTime > 0? AlertUtils.humanize_unixtime(inc.ackTime):null;

			let ackTimeUI = null;

			if(ackTime)
			{
				ackTimeUI = <div>
					<Col xs={2}>
						<b>Acknowledged At:</b>
					</Col>
					<Col xs={2}>
						{ackTime}
					</Col>
				</div>;
			}
			ackDetail  = <Row className="top1">
				<Col xs={2}>
					<b>Acknowledged By:</b>
				</Col>
				<Col xs={2}>
					{userName}
				</Col>

				{ackTimeUI}
				</Row>
		}

		const detail = (
			<div>
				<Row>
					<Col xs={2}>
						<b>Start Time:</b>
					</Col>
					<Col xs={2}>
						{AlertUtils.humanize_unixtime(inc.beginTime)}
					</Col>

					<Col xs={2}>
						<b>End Time:</b>
					</Col>
					<Col xs={2}>
						{AlertUtils.humanize_unixtime(inc.endTime)}
					</Col>
					<Col xs={2}>
						<b>Duration:</b>
					</Col>
					<Col xs={2}>
						{durationStr}
					</Col>
				</Row>

				<Row className="top1">
					<Col xs={2}>
						<b>Status:</b>
					</Col>
					<Col xs={2}>
						{AlertUtils.hasNotEnded(inc.endTime)?"In Progress": "Closed"}
					</Col>
					<Col xs={2}>
						<b>Policy:</b>
					</Col>
					<Col xs={2}>
						{this.incidentDetail.policyName}
					</Col>
				</Row>
				<Row className="top1">
					<Col xs={2}>
						<b>Violations:</b>
					</Col>
					<Col xs={2}>
						{violationCount}
					</Col>
					<Col xs={2}>
						<b>Applications involved:</b>
					</Col>
					<Col xs={2}>
						{appCount}
					</Col>
				</Row>
				{ackDetail}
			</div>
		);
		return detail;
	}

	private renderApplications(appNames: string[])
	{
		appNames = _.uniq(appNames);
		return (
			<DSTable columnNames={["Application Name"]} noStripe={true} noHead={true} noHover={true}>
				{appNames.map(app =>    <tr key={app}>
				                             <td>
					                             {app}
											</td>
				                        </tr>)}
			</DSTable>
		);
	}
	protected renderContent(data:IState):any
	{
		if(!accountStatus.isPro)
			return <NeedPro pageName="Incident details"/>;

		const violationCount = this.incidentDetail.violations.length;
		const appNames  = this.incidentDetail.violations.map(v => v.appName).filter(app => app !== ViolationPresenter.NOAPP);
		const appCount = _.uniq(appNames).length;


		let incidentId = getRouteParam(this.props,"incidentId");
		let content;
		if (_.isEmpty(this.incidentDetail.violations)) {
			content = <h3>No violations for this incident!</h3>;
		}
		else
		{
			content =<DSTable noHover={true} noBorder={true} noStripe={true} columnNames={["Violation Id", "Application","Target Type",  "Target Name", "Severity","Condition", "Began At","Ended At"]} classes="violationsTable">
				{this.incidentDetail.violations.map(it=> <tr key={it.id} className={ViolationsListPage.violationRowClassName(it)}>
					<td>{AlertUtils.humanize_ViolationId(it.id)}</td>
					<td>{ViolationPresenter.appLabel(it)}</td>
					<td>{ViolationPresenter.conditionTargetTypeToLabel(it)}</td>
					<td>{it.targetName}</td>
					<td>{it.severity}</td>
					<td>{ViolationUtils.conditionDisplayStr(it)}</td>
					<td>{AlertUtils.humanize_unixtime(it.beginTime)}</td>
					<td>{AlertUtils.humanize_unixtime(it.endTime)}</td>
				</tr>)}
			</DSTable>;
		}

		return (
				<div className="container-fluid">
					<h2>Incident {AlertUtils.humanize_IncidentId(incidentId)}</h2>
					<hr/>
					{this.renderIncidentDetail(data, violationCount, appCount)}
					<hr/>
					<RowCol>
						<h3>Applications involved</h3>
					</RowCol>
					<RowCol>
						{this.renderApplications(appNames as any)}
					</RowCol>
					<hr/>
					<RowCol>
						<h3>Violations</h3>
					</RowCol>
					<RowCol>
						{content}
					</RowCol>
				</div>
		);
	}

}
