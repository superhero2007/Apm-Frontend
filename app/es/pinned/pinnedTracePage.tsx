import * as React from "react";
import {IStore} from "../../reduxSetup";
import {connect} from "react-redux";
import {AbstractPinnedTxnDetailView} from "./abstractPinnedTxnDetailView";
import {IDSTabView} from "../widgets/dsTabs";
import {IPinnedTxnComponentProps} from "./pinnedTxnList";
import {QueryRequests} from "../queryRequests";
import {Http} from "../../http";
import {ISortedListItem} from "../widgets/sortedMetricList";
import {TxnTraceViewer} from "../../apps/main/txn/trace";
import {pinnedTxnConnector} from "../../reduxConnectors";


interface IState {
	traceList: ISortedListItem[];
}

class PinnedTraceView_connect extends AbstractPinnedTxnDetailView<IPinnedTxnComponentProps, IState> implements IDSTabView
{

	protected getMetricFetchURLs():string[]
	{
		return undefined;
	}

	protected getHttpRequests(props:IPinnedTxnComponentProps) :JQueryXHR[]
	{
		const body = QueryRequests.postBody_Pinned_detailFilter(props.pinnedTxnRedr);
		body.parentName = body.metricName;
		return [Http.postJSON("/xapp/es/txn/trace/list", body)];
	}

	protected initialState():IState
	{
		return {traceList: []};
	}
	protected getStateFromPostResponse(reponseData:any):IState
	{
		const list = reponseData[0];
		return {traceList: list};
	}

	protected renderContent(data:IState):any
	{
		const txn = this.props.pinnedTxnRedr.txn;
		return <TxnTraceViewer traceList={data.traceList} appName={txn.appName} txnName={txn.txnName} />
	}
}


export const PinnedTraceView = connect((state)=> pinnedTxnConnector(state))(PinnedTraceView_connect);