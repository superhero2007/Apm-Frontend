import * as React from "react";
import {LoadableComponent} from "../../widgets/loadableComponent";
import {ITraceDetail} from "./traceStructs";
import {TxnTraceView} from "./txnTraceView";
import {Http} from "../../http";

interface IProps
{
	traceId: string;
	app: string;
	txn: string;
	duration: number;
}
interface IState {
	trace:ITraceDetail;
}
export class TxnTracePage extends LoadableComponent<IProps,IState>
{
	protected initialState():IState
	{
		return {trace: null};
	}


	componentWillReceiveProps(nextProps:IProps)
	{
		if(nextProps.traceId)
		{
			this.reloadData(nextProps);
		}
	}

	protected getHttpRequests(props:IProps) :JQueryXHR[]
	{
		return [Http.post("/trace/detail", {traceObjId: props.traceId})];
	}

	protected getStateFromPostResponse(reponseData:any):IState
	{
		return {trace: reponseData[0]};
	}

	protected renderContent(data:IState)
	{
		return (
			<div>
				<TxnTraceView trace={data.trace} app={this.props.app} txn={this.props.txn} duration={this.props.duration}/>
			</div>
		);
	}

}