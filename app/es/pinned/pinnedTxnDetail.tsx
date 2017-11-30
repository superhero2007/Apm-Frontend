import * as React from "react";
import {IPinnedTxnComponentProps} from "./pinnedTxnList";
import {IStore} from "../../reduxSetup";
import {connect} from "react-redux";
import {JVMFilters, IJVMLabel} from "./jvmFilters";
import {LoadableComponent} from "../../widgets/loadableComponent";
import {action_updateJVMFilter} from "../../reducers/pinnedTxnReducer";
import {DSTabType, DSTabs, TabStyle, DSTabViewManager, DSTabViewInfo, IDSTabView} from "../widgets/dsTabs";
import {ChangeDetectionPinnedRR} from "./changeDetectRRPinned";
import {PerJVMTxnView} from "./perJVMView";
import {action_updateDetailTab, updateObj} from "../../reducers/esReducer";
import {PinnedMetricScalabilityView} from "./pinnedScalabilityView";
import {PinnedTxnOverviewPage, PinnedTxnOverviewPage_getDefaultTabState} from "./pinnedTxnOverview";
import {PinnedErrView} from "./pinnedErrView";
import {PinnedTraceView} from "./pinnedTracePage";
import {AbstractPinnedTxnDetailView} from "./abstractPinnedTxnDetailView";
import {IMetricTrendContainerWithChildren, TxnTrendsView, ITxnCalendarTrends} from "../../apps/txnTrendsView";
import {QueryRequests} from "../queryRequests";
import {Http} from "../../http";
import {pinnedTxnConnector} from "../../reduxConnectors";
declare var require:any;
var jstz = require('jstimezonedetect');

interface IState
{
	jvms:IJVMLabel[];
}


class PinnedTxnDetail_connect extends LoadableComponent<IPinnedTxnComponentProps, IState>
{
	private tabViewManager = new DSTabViewManager([
		new DSTabViewInfo(DSTabType.overview, PinnedTxnOverviewPage, PinnedTxnOverviewPage_getDefaultTabState),
		new DSTabViewInfo(DSTabType.perjvm, PerJVMTxnView),
		new DSTabViewInfo(DSTabType.ttraces, PinnedTraceView),
		new DSTabViewInfo(DSTabType.errs, PinnedErrView),
		new DSTabViewInfo(DSTabType.trends, PinnedTrendsView),
		new DSTabViewInfo(DSTabType.scalable, PinnedMetricScalabilityView),
	]);

	protected initialState():IState
	{
		return {jvms: null};
	}

	protected getHttpRequests(props:IPinnedTxnComponentProps):JQueryXHR[]
	{
		const redr = props.pinnedTxnRedr;
		return [JVMFilters.fetchJvmsForApp(redr.txn.appId, redr.timeRange)];
	}

	componentWillReceiveProps(nextProps:IPinnedTxnComponentProps)
	{
		const newRR = nextProps.pinnedTxnRedr;
		const oldRR = this.props.pinnedTxnRedr;

		if (ChangeDetectionPinnedRR.txnAndTimeRange(oldRR, newRR))
		{
			this.reloadData(nextProps);
		}
	}

	protected getStateFromPostResponse(reponseData:any):IState
	{
		const jvms = reponseData[0];
		this.props.dispatch(action_updateJVMFilter(JVMFilters.defaultFilterState()));

		return {jvms: jvms};
	}

	private onSelectTab(tabType:DSTabType)
	{
		const defaultState = this.tabViewManager.getViewDefaultState(tabType);
		this.props.dispatch(action_updateDetailTab({type: tabType, state: defaultState} as any));
	}


	protected renderContent(data:IState):any
	{
		const redr = this.props.pinnedTxnRedr;
		const txn = redr.txn;

		const tabs = this.tabViewManager.getAllTabTypes();

		return (
			<div>
				<h2>{txn.txnName}</h2>
				<h4>{`${txn.appName}`}</h4>
				<JVMFilters jvms={data.jvms} filters={this.props.pinnedTxnRedr.jvmFilter} dispatch={this.props.dispatch}/>
				<hr/>
				<div className="bottom2">
					<DSTabs activeTab={redr.tab.type} tabs={tabs} onSelect={this.onSelectTab.bind(this)} style={TabStyle.tabs}/>
				</div>
				{this.tabViewManager.renderView(redr.tab.type)}
			</div>
		);
	}

}


interface IPTVState
{
	trends: IMetricTrendContainerWithChildren;
	txnDayOfWeek: ITxnCalendarTrends;
	txnTimeOfDay: ITxnCalendarTrends;
}

class PinnedTrendsView_connect extends AbstractPinnedTxnDetailView<IPinnedTxnComponentProps, IPTVState> implements IDSTabView
{

	protected getHttpRequests(props:IPinnedTxnComponentProps) :JQueryXHR[]
	{
		const body = QueryRequests.postBody_Pinned_detailFilter(props.pinnedTxnRedr);
		const tz = jstz.determine().name();
		const bodyWTimezone = updateObj(body, {timezone: tz});
		return [Http.postJSON("/xapp/es/trends/overview/txns", body),Http.postJSON("/xapp/es/dayofweek/txn", bodyWTimezone),Http.postJSON("/xapp/es/timeofday/txn", bodyWTimezone)];
	}


	protected getMetricFetchURLs():string[]
	{
		return ["/xapp/es/trends/overview/txns"];
	}

	protected initialState():IPTVState
	{
		return {trends: null, txnDayOfWeek: null, txnTimeOfDay: null};
	}

	protected getStateFromPostResponse(reponseData:any):IPTVState
	{
		return {trends: reponseData[0], txnDayOfWeek: reponseData[1], txnTimeOfDay: reponseData[2]};
	}
	protected renderContent(data:IPTVState):any
	{
		return (
			<div>
				<TxnTrendsView trendOverview={data.trends} txnDayOfWeek={data.txnDayOfWeek} txnTimeOfDay={data.txnTimeOfDay} />
			</div>
		);
	}
}

const PinnedTrendsView = connect((state)=> pinnedTxnConnector(state))(PinnedTrendsView_connect);
export const PinnedTxnDetail = connect((state)=> pinnedTxnConnector(state))(PinnedTxnDetail_connect);