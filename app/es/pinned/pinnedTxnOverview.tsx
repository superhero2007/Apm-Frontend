import * as React from "react";
import {AbstractPinnedTxnDetailView} from "./abstractPinnedTxnDetailView";
import {IPinnedTxnComponentProps} from "./pinnedTxnList";
import {IStore} from "../../reduxSetup";
import {connect} from "react-redux";
import {DSTabType, IDSTabView} from "../widgets/dsTabs";
import {action_updateDetailTabState} from "../../reducers/esReducer";
import {ITxnDetail, TxnOverview} from "../../apps/main/txn/txnOverview";
import {IPercentileResult} from "../../apps/main/percentiles";
import {pinnedTxnConnector} from "../../reduxConnectors";


interface IState
{
	txnDetail:ITxnDetail;
	pctile: IPercentileResult;
}



interface ITabState
{
	chartType: DSTabType;
}


export function PinnedTxnOverviewPage_getDefaultTabState(): ITabState
{
	return {chartType: DSTabType.segments};
}

class PinnedTxnOverviewPage_connect extends AbstractPinnedTxnDetailView<IPinnedTxnComponentProps, IState> implements IDSTabView
{

	protected getMetricFetchURLs():string[]
	{
		return ["/xapp/es/txn/detail", "/xapp/es/app/pctile"];
	}

	protected initialState():IState
	{
		return {txnDetail: null, pctile: null};
	}

	protected getStateFromPostResponse(reponseData:any):IState
	{
		return {txnDetail: reponseData[0], pctile: reponseData[1]};
	}


	private onSelectPill(tab: DSTabType)
	{
		const data = {chartType: tab};
		this.props.dispatch(action_updateDetailTabState(data));
	}


	protected renderContent(data:IState):any
	{
		const tabState = this.props.pinnedTxnRedr.tab.state as ITabState;

		return <TxnOverview  pctile={data.pctile} txnDetail={data.txnDetail} dispatch={this.props.dispatch} onChartStyleSelect={this.onSelectPill.bind(this)} selectedChartStyle={tabState.chartType}
				timeRange={this.props.pinnedTxnRedr.timeRange}/>
	}


}

export const PinnedTxnOverviewPage = connect((state)=> pinnedTxnConnector(state))(PinnedTxnOverviewPage_connect);