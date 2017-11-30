import * as React from "react";
import {LoadableComponent} from "../../widgets/loadableComponent";
import {Http} from "../../http";
import {IErrSample} from "./errTraceViewer";
import {Col, Row} from "react-bootstrap";
import {AlertUtils} from "../../alerts/AlertUtils";
import {RowCol} from "../../widgets/rowCol";
import * as _ from "lodash";
import {StackTraceView} from "../../widgets/stackTraceView";
interface IErrTrace
{
	timestamp: number; //in unix time (seconds)
	host: string;
	msg: string;
	stack: string[];
	txn: string[];
	customParams;
}

interface IProps{
	appId: string;
	appName: string;
	sample: IErrSample;
}

interface IState
{
	traceData;
}
export class ErrTrace extends LoadableComponent<IProps, IState>
{
	protected initialState():IState
	{
		return {traceData: null};
	}

	protected getStateFromPostResponse(reponseData:any):IState
	{
		return {traceData: reponseData[0]};
	}


	protected getHttpRequests(props:IProps) :JQueryXHR[]
	{
		const data = {appId: props.appId, s3Id: props.sample.s3ID, timestamp: props.sample.timestamp};

		return [Http.post("/err/trace/detail", data)];
	}

	componentWillReceiveProps(nextProps)
	{
		this.reloadData(nextProps);
	}

	protected renderContent(data:IState):any
	{
		let customParams;
		if(!_.isEmpty(data.traceData.customParams))
		{
			const params = _.map(data.traceData.customParams, (value,key) => <Row>

				<Col xs={2}>
					<b>{key}</b>
				</Col>
				<Col xs={6}>
					{value}
				</Col>
			</Row>);

			customParams = (
				<div>
					<hr/>
					<h4>Custom Params</h4>
					{params}
				</div>
			);
		}

		return (
			<div>
				<Row>
					<Col xs={2}>
						<b>Application:</b>
					</Col>
					<Col xs={2}>
						{this.props.appName}
					</Col>
					<Col xs={2}>
						<b>Transaction:</b>
					</Col>
					<Col xs={6}>
						{data.traceData.txn}
					</Col>
				</Row>

				<Row>
					<Col xs={2}>
						<b>Host:</b>
					</Col>
					<Col xs={2}>
						{data.traceData.host}
					</Col>
					<Col xs={2}>
						<b>Collected At:</b>
					</Col>
					<Col xs={2}>
						{AlertUtils.humanize_unixtime(data.traceData.timestamp)}
					</Col>
				</Row>
				{customParams}
				<hr/>
				<RowCol>
					<h4>Exception Msg:</h4>
				</RowCol>
				<RowCol className="top2 dsCodeBlock">
					{data.traceData.msg}
				</RowCol>
				<hr/>
				<RowCol>
					<h4>Stack Trace:</h4>
				</RowCol>
				<RowCol className="top2">
					<StackTraceView stack={data.traceData.stack}/>
				</RowCol>
			</div>
		);
	}

}