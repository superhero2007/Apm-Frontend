import * as React from "react";
import {connect} from "react-redux";
import {IStore} from "../../reduxSetup";
import {IDSTabView} from "../widgets/dsTabs";
import {IPinnedTxnComponentProps} from "./pinnedTxnList";
import {AbstractPinnedTxnDetailView} from "./abstractPinnedTxnDetailView";
import {ISeriesData} from "../views/metricDetailView";
import {ISortedListItem} from "../widgets/sortedMetricList";
import {LoadableComponent} from "../../widgets/loadableComponent";
import {ErrTraceViewer} from "../err/errTraceViewer";
import {IAppIdName} from "../err/errTrendsView";
import {Http} from "../../http";
import {QueryRequests} from "../queryRequests";
import {TxnErrView} from "../../apps/main/txn/err";
import {pinnedTxnConnector, pinnedTxnConnectorWithProps} from "../../reduxConnectors";

interface IStateET {
	data;
}

interface IPropsET1
{
	exceptionName: string;
	onClose: ()=>void;
}

type IPropsET = IPropsET1 & IPinnedTxnComponentProps

class PinnedTxnErrTracePage_connect extends LoadableComponent<IPropsET, IStateET>
{
	protected initialState():IStateET
	{
		return {data: null};
	}

	protected getHttpRequests(props:IPropsET) :JQueryXHR[]
	{
		const body = QueryRequests.postBody_Pinned_detailFilter(props.pinnedTxnRedr);
		body.metricName = props.exceptionName;
		body.parentName = props.pinnedTxnRedr.txn.txnName;

		return [Http.postJSON("/xapp/es/txn/err/trace/list", body)];
	}
	protected getStateFromPostResponse(reponseData:any):IStateET
	{
		return {data: reponseData[0]};
	}

	protected renderContent(data:IStateET):any
	{
		const tx = this.props.pinnedTxnRedr.txn;
		const appIdName: IAppIdName = {appId: tx.appId, appName: tx.appName};
		return <ErrTraceViewer app={appIdName} data={data.data} onClose={this.props.onClose}/>;
	}
}

interface IState
{
	errPct: ISeriesData;
	topXTimeline: ISeriesData[];
	errList: ISortedListItem[] ;
	selectedErr: ISortedListItem;
}

class PinnedErrView_connect extends AbstractPinnedTxnDetailView<IPinnedTxnComponentProps, IState> implements IDSTabView
{

	protected getMetricFetchURLs():string[]
	{
		return ["/xapp/es/err/pct","/xapp/es/txn/err/topx/timeline","/xapp/es/txn/err/list"];
	}

	protected initialState():IState
	{
		return {errPct: null, topXTimeline: [], errList: [], selectedErr: null};
	}

	protected getStateFromPostResponse(reponseData:any):IState
	{
		return {errPct: reponseData[0], topXTimeline: reponseData[1], errList: reponseData[2], selectedErr: null};
	}

	private onErrSelect(err:ISortedListItem)
	{
		this.update_myStateProps({selectedErr: err});
	}

	private onErrClose()
	{
		this.update_myStateProps({selectedErr: null});
	}

	protected renderContent(data:IState):any
	{
		if(data.selectedErr)
		{
			return <PinnedTxnErrTracePage exceptionName={data.selectedErr.realName} onClose={this.onErrClose.bind(this)}/>;
		}

		return <TxnErrView errPct={data.errPct} topXTimeline={data.topXTimeline} errList={data.errList} dispatch={this.props.dispatch} onErrSelect={this.onErrSelect.bind(this)}/>;
	}
}

export const PinnedErrView = connect((state)=> pinnedTxnConnector(state))(PinnedErrView_connect);
const PinnedTxnErrTracePage = connect((state, props: IPropsET1)=> pinnedTxnConnectorWithProps(state, props))(PinnedTxnErrTracePage_connect);