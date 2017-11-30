import * as React from "react";
import {LoadableComponent} from "../../widgets/loadableComponent";
import {ISlowQueryInfo} from "./slowQueriesListView";
import {MetricCategory} from "../../reducers/esReducer";
import {Row, Col} from "react-bootstrap";
import {responseTimeDisplay} from "../metricUtils";
import {AlertUtils} from "../../alerts/AlertUtils";
import {RowCol} from "../../widgets/rowCol";
import {Http} from "../../http";
import {StackTraceView} from "../../widgets/stackTraceView";
import {ITraceSampleInfo} from "../widgets/slowQueryTrace";


interface ISQLTraceDetail
{
	duration:number;
	sql:string;
	stackTrace:string[];
	txnName:string;
	host:string;
	timeStamp:number;

	durationStr:string;
	tsStr:string;
	traceStr:string;
}

interface IState
{
	traceDetail:ISQLTraceDetail;
}

interface IProps
{
	query:ISlowQueryInfo
	category:MetricCategory;
	sample:ITraceSampleInfo;
}

export class QueryView extends LoadableComponent<IProps, IState>
{

	protected initialState():IState
	{
		return {traceDetail: null};
	}

	protected getStateFromPostResponse(reponseData:any):IState
	{
		return {traceDetail: reponseData[0]};
	}

	protected getHttpRequests(props:IProps) :JQueryXHR[]
	{
		const data = {category: MetricCategory[props.category], appId: props.query.appId, s3Id: props.sample.s3Id};
		return [Http.post("/xapp/es/slowquery/detail", data)];
	}

	componentWillReceiveProps(nextProps)
	{
		this.reloadData(nextProps);
	}

	protected renderContent(data:IState):any
	{
		return (
			<div>
				<Row>
					<Col xs={2}>
						<b>Application:</b>
					</Col>
					<Col xs={2}>
						{this.props.query.appName}
					</Col>
					<Col xs={2}>
						<b>Transaction:</b>
					</Col>
					<Col xs={6}>
						{data.traceDetail.txnName}
					</Col>
				</Row>
				<Row>
					<Col xs={2}>
						<b>Host:</b>
					</Col>
					<Col xs={2}>
						{data.traceDetail.host}
					</Col>
					<Col xs={2}>
						<b>Duration:</b>
					</Col>
					<Col xs={2}>
						{responseTimeDisplay(data.traceDetail.duration)}
					</Col>
					<Col xs={2}>
						<b>Collected At:</b>
					</Col>
					<Col xs={2}>
						{AlertUtils.humanize_unixtime(data.traceDetail.timeStamp)}
					</Col>
				</Row>
				<hr/>
				<RowCol>
					<h4>Query:</h4>
				</RowCol>
				<RowCol className="top2 dsCodeBlock">
					{data.traceDetail.sql}
				</RowCol>
				<hr/>
				<RowCol>
					<h4>Stack Trace:</h4>
				</RowCol>
				<RowCol className="top2">
					<StackTraceView stack={data.traceDetail.stackTrace}/>
				</RowCol>
			</div>
		);
	}

}