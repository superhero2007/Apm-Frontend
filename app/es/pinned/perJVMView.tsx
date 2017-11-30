import * as React from "react";
import {AbstractPinnedTxnDetailView} from "./abstractPinnedTxnDetailView";
import {IPinnedTxnComponentProps} from "./pinnedTxnList";
import {IStatsByMetric} from "../views/perAppMetricView";
import {connect} from "react-redux";
import {IDSTabView} from "../widgets/dsTabs";
import {IMetricStatsSummary, TxnPerJVM} from "../../apps/main/txn/perJvm";
import {pinnedTxnConnector} from "../../reduxConnectors";


interface IState
{
	perJVM: IStatsByMetric;
	summary: IMetricStatsSummary;
}

class PerJVMTxnView_connect extends AbstractPinnedTxnDetailView<IPinnedTxnComponentProps, IState> implements IDSTabView
{

	protected getMetricFetchURLs():string[]
	{
		return ["/xapp/es/txn/perjvm","/xapp/es/summary"];
	}

	protected initialState():IState
	{
		return {perJVM: null, summary: null};
	}

	protected getStateFromPostResponse(reponseData:any):IState
	{
		return {perJVM: reponseData[0], summary: reponseData[1]};
	}

	protected renderContent(data:IState):any
	{
		return <TxnPerJVM dispatch={this.props.dispatch} perJVM={data.perJVM} summary={data.summary}/>;
	}

}

export const PerJVMTxnView = connect((state)=> pinnedTxnConnector(state))(PerJVMTxnView_connect);