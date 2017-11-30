import * as React from "react";
import * as _ from "lodash";
import {connect} from "react-redux";
import {IAppTxnPageProps} from "./txn";
import {LoadableComponent} from "../../widgets/loadableComponent";
import {QueryRequests} from "../../es/queryRequests";
import {Http} from "../../http";
import {ChangeDetectionAppRR} from "../../es/pinned/changeDetectRRPinned";
import {ITxnDetail, TxnOverview} from "./txn/txnOverview";
import {DSTabs, DSTabType, DSTabViewInfo, DSTabViewManager, IDSTabView, TabStyle} from "../../es/widgets/dsTabs";
import {action_appTxn_updateDetailTab, action_apptxn_updateDetailTabState} from "../../reducers/appReducer";
import {IMetricStatsSummary, TxnPerJVM} from "./txn/perJvm";
import {IStatsByMetric} from "../../es/views/perAppMetricView";
import {ISortedListItem, MetricSortType} from "../../es/widgets/sortedMetricList";
import {TxnTraceViewer} from "./txn/trace";
import {ISeriesData} from "../../es/views/metricDetailView";
import {TxnErrView} from "./txn/err";
import {IAppIdName} from "../../es/err/errTrendsView";
import {ErrTraceViewer} from "../../es/err/errTraceViewer";
import {IMetricTrendContainerWithChildren, ITxnCalendarTrends, TxnTrendsView} from "../txnTrendsView";
import {MetricCategory, updateObj} from "../../reducers/esReducer";
import {IScalabilityGraph} from "../../es/widgets/scalabilityView";
import {GenericScalabilityView} from "../../es/views/generticScalabilityView";
import {Button, ButtonToolbar, Col, ControlLabel, FormControl, FormGroup, Row} from "react-bootstrap";
import {RowCol} from "../../widgets/rowCol";
import {updateComponentState} from "../../utils";
import {Permission, PermissionManager} from "../../roles";
import {CategoryTabsWidget, CatTab} from "../../es/widgets/catTabs";
import {TopXView} from "../../es/widgets/topXView";
import {accountStatus} from "../../accountStatus";
import {NeedPro} from "../../widgets/needPro";
import {IPercentileResult} from "./percentiles";
import {appTxnConnector, connectorWithProps} from "../../reduxConnectors";

declare let require:any;
const jstz = require('jstimezonedetect');

interface ITxnDetailState
{
	pinName:    string;
	showPinDlg: boolean;
}

class TxnDetailView_connect extends LoadableComponent<IAppTxnPageProps, ITxnDetailState>
{
	private tabViewManager = new DSTabViewManager([
		new DSTabViewInfo(DSTabType.overview, TxnOverviewView, TxnOverviewView_getDefaultTabState),
		new DSTabViewInfo(DSTabType.perjvm, TxnPerJVMView),
		new DSTabViewInfo(DSTabType.ttraces, TxnTxnTraceView),
		new DSTabViewInfo(DSTabType.errs, TxnErrorView),
		new DSTabViewInfo(DSTabType.trends, TxnTrendsPage),
		new DSTabViewInfo(DSTabType.scalable, TxnScalabilityPage),
	]);

	componentWillReceiveProps(nextProps:IAppTxnPageProps)
	{
		if( ChangeDetectionAppRR.txn(this.props.appTxn, nextProps.appTxn))
		{
			this.reloadData(nextProps);
		}
	}

	protected initialState(): ITxnDetailState
	{
		return {pinName: null, showPinDlg: false};
	}

	protected getStateFromPostResponse(responseData: any): ITxnDetailState
	{
		return {pinName: responseData[0], showPinDlg: false};
	}

	protected getHttpRequests(props:IAppTxnPageProps) :JQueryXHR[]
	{
		const body = {appId: props.appInfo.app.id, txnName: props.appTxn.txnRealName};
		return [Http.post("/pin/name", body)];
	}

	private onSelectTab(tabType:DSTabType)
	{
		const defaultState = this.tabViewManager.getViewDefaultState(tabType);
		this.props.dispatch(action_appTxn_updateDetailTab({type: tabType, state: defaultState} as any));
	}

	private renderPin(data: ITxnDetailState)
	{
		const style = {
			"marginRight" : "0.5em"
		};
		if(!data.pinName)
		{
			return (
				<div>
					<Button bsStyle="link"  onClick={this.onPinBegin.bind(this)}><i className="fa fa-thumb-tack" style={style}/>{"Pin Transaction"}</Button>
				</div>
			);
		}
		else {

			if(PermissionManager.permissionAvailable(Permission.TXN_UNPIN))
			{
				return (
					<div>
						<Button bsStyle="link" onClick={this.onUnpin.bind(this)}><i className="fa fa-thumb-tack fa-rotate-90" style={style}/>{"Unpin"}</Button>
					</div>
				);
			}

			return <div></div>;
		}
	}

	private onUnpin()
	{
		const body = {appId: this.props.appInfo.app.id, txnName: this.props.appTxn.txnRealName};
		Http.post("/pin/txn/undo", body);
		this.update_myStateProps({pinName: null});
	}

	private onPinBegin()
	{
		this.update_myStateProps({showPinDlg: true});
	}

	private onPinCancel()
	{
		this.update_myStateProps({showPinDlg: false});
	}

	private onPinDone(pinName: string)
	{
		this.update_myStateProps({showPinDlg: false, pinName: pinName.trim()});
	}

	protected renderContent(data: ITxnDetailState): any
	{
		const appTxn = this.props.appTxn;
		const txn = appTxn.txn;

		if(data.showPinDlg)
		{
			return (
				<div>
					<Row className="verticalAlign bottom2">
						<Col xs={10}>
							<h2>{txn}</h2>
						</Col>
					</Row>
					<PinTxnDlg appId={this.props.appInfo.app.id} txnName={txn} txnRealName={appTxn.txnRealName} onOk={this.onPinDone.bind(this)} onCancel={this.onPinCancel.bind(this)}/>
				</div>
			);
		}

		let detailView;

		if(appTxn.catTab == CatTab.metric && appTxn.txn)
		{
			const tabs = this.tabViewManager.getAllTabTypes();
			const activeTab = appTxn.tab.type;

			detailView = (
				<div>
					<Row className="verticalAlign bottom2">
						<Col xs={10}>
							<h2>{txn}</h2>
						</Col>
						<Col xs={2}>
							{this.renderPin(data)}
						</Col>
					</Row>
					<div className="bottom2">
						<DSTabs activeTab={activeTab} tabs={tabs} onSelect={this.onSelectTab.bind(this)} style={TabStyle.tabs}/>
					</div>
					{this.tabViewManager.renderView(activeTab)}
				</div>
			);
		}
		else
		{
			detailView = (
				<div>
					<TxnTopXOverviewPage/>
				</div>
			);
		}

		return (
			<div>
				<Row className = "bottom1">
					<Col xsOffset={3}>
						<TxnCategoryTabs/>
					</Col>
				</Row>

				{detailView}
			</div>
		)
	}

}

class PinTxnDlg extends React.Component<{
	appId:  string;
	txnName:    string;
	txnRealName:    string;

	onOk: (pinnedName: string) => void;
	onCancel: () => void;

}, {
	pinnedName: string;
	errMsg: string;
}>
{
	constructor(props, context)
	{
		super(props, context);
		this.state = {pinnedName: "", errMsg: null};
	}

	private onNameChange(e)
	{
		updateComponentState(this, {pinnedName: e.target.value});
	}

	private onSubmit(e)
	{
		e.preventDefault();

		if(!_.isEmpty(this.state.pinnedName.trim()))
		{
			const body = {appId: this.props.appId, txnName: this.props.txnRealName, name: this.state.pinnedName};
			Http.post("/pin/txn/do", body).then((response)=>
			{
				if (response)
				{
					this.props.onOk(this.state.pinnedName);
				}
				else
				{
					updateComponentState(this, {errMsg: "Name already in use by another Pinned Transaction"});
				}
			});
		}

	}

	private onCancel(e)
	{
		e.preventDefault();
		this.props.onCancel();
	}

	private  validate()
	{
		const length = this.state.pinnedName.length;
		if (length >= 200)
			return 'error';

		return "success";
	}

	render()
	{
		let err;
		if(this.state.errMsg)
		{
			let style = {color: "red"};
			err = <h5 style={style}>{this.state.errMsg}</h5>;
		}
		return (
			<div>
				<RowCol>
					<form onSubmit={this.onSubmit.bind(this)}>
						<FormGroup validationState={this.validate()}>
							<ControlLabel>{"Enter Pinned Name:"}</ControlLabel>
							<FormControl type="text" value={this.state.pinnedName} onChange={this.onNameChange.bind(this)} placeholder="Eg - My Pinned Transaction"/>
						</FormGroup>
						{err}
						<ButtonToolbar>
							<button className="btn btn-default" onClick={this.onCancel.bind(this)}>Cancel</button>
							<button type="submit" className="btn btn-primary">Pin</button>
						</ButtonToolbar>
					</form>
				</RowCol>
			</div>
		);
	}
}
abstract class AbstractTxnDetailView <P extends IAppTxnPageProps, S> extends LoadableComponent<P,S>
{
	componentWillReceiveProps(nextProps:P)
	{
		const newRR = nextProps.app;
		const oldRR = this.props.app;

		if(ChangeDetectionAppRR.timeRangeAndJVM(oldRR, newRR) || ChangeDetectionAppRR.sort(this.props.appTxn, nextProps.appTxn)
			|| ChangeDetectionAppRR.txn(this.props.appTxn, nextProps.appTxn))
		{
			this.reloadData(nextProps);
		}
	}


	protected getHttpRequests(props:P) :JQueryXHR[]
	{
		const body = QueryRequests.postBody_App_Txn_Filter(props.app, props.appInfo, props.appTxn);
		return this.getMetricFetchURLs().map(url => Http.postJSON(url, body));
	}

	protected abstract getMetricFetchURLs(): string[];
}

interface ITxnTopXOverviewPageState
{
	respTimes;
	thps;
	slowest;
}

class TxnTopXOverviewPage_connect extends AbstractTxnDetailView<IAppTxnPageProps, ITxnTopXOverviewPageState>
{
	protected getMetricFetchURLs(): string[]
	{
		return undefined;
	}

	protected initialState(): ITxnTopXOverviewPageState
	{
		return {respTimes: null, thps: null, slowest: null};
	}

	protected getStateFromPostResponse(responseData: any): ITxnTopXOverviewPageState
	{
		return { respTimes: responseData[0], thps: responseData[1], slowest: responseData[2]};
	}


	componentWillReceiveProps(nextProps:IAppTxnPageProps)
	{
		const newRR = nextProps.app;
		const oldRR = this.props.app;

		if(ChangeDetectionAppRR.timeRangeAndJVM(oldRR, newRR))
		{
			this.reloadData(nextProps);
		}
	}

	protected getHttpRequests(props:IAppTxnPageProps) :JQueryXHR[]
	{
		const body = QueryRequests.postBody_App_Txn_Filter(props.app, props.appInfo, props.appTxn);

		const respbody = updateObj(body, {sortType: MetricSortType[MetricSortType.TIME_SPENT]});
		const thpbody = updateObj(body, {sortType: MetricSortType[MetricSortType.AVG_THROUGHPUT]});
		const slowBody = updateObj(body, {sortType: MetricSortType[MetricSortType.AVG_RESPTIME]});
		return [Http.postJSON("/xapp/es/overview/top5", respbody), Http.postJSON("/xapp/es/overview/top5", thpbody), Http.postJSON("/xapp/es/overview/top5", slowBody)];
	}

	protected renderContent(data: ITxnTopXOverviewPageState): any
	{
		return <TopXView respTimes={data.respTimes} thps={data.thps} slowest={data.slowest} dispatch={this.props.dispatch}/>;
	}

}

interface ITxnOverviewState
{
	txnDetail:ITxnDetail;
	pctile: IPercentileResult;
}

interface ITxnOverviewTabState
{
	chartType: DSTabType;
}


export function TxnOverviewView_getDefaultTabState(): ITxnOverviewTabState
{
	return {chartType: DSTabType.segments};
}

class TxnOverviewView_connect extends AbstractTxnDetailView<IAppTxnPageProps, ITxnOverviewState> implements IDSTabView
{


	protected getMetricFetchURLs(): string[]
	{
		return ["/xapp/es/txn/detail","/xapp/es/app/pctile"];
	}

	protected initialState(): ITxnOverviewState
	{
		return {txnDetail: null, pctile: null};
	}

	protected getStateFromPostResponse(responseData: any): ITxnOverviewState
	{
		return {txnDetail: responseData[0], pctile: responseData[1]};
	}

	private onSelectPill(tab: DSTabType)
	{
		const data = {chartType: tab};
		this.props.dispatch(action_apptxn_updateDetailTabState(data));
	}

	protected renderContent(data: ITxnOverviewState): any
	{
		const tab = this.props.appTxn.tab.state as ITxnOverviewTabState;
		return <TxnOverview txnDetail={data.txnDetail} dispatch={this.props.dispatch} onChartStyleSelect={this.onSelectPill.bind(this)} selectedChartStyle={tab.chartType}
		                    pctile={data.pctile} timeRange={this.props.app.timeRange}/>;
	}
}



interface ITxnPerJVMState
{
	perJVM: IStatsByMetric;
	summary: IMetricStatsSummary;
}


class TxnPerJVMView_connect extends AbstractTxnDetailView<IAppTxnPageProps, ITxnPerJVMState> implements IDSTabView
{
	protected getMetricFetchURLs():string[]
	{
		return ["/xapp/es/txn/perjvm","/xapp/es/summary"];
	}

	protected initialState():ITxnPerJVMState
	{
		return {perJVM: null, summary: null};
	}

	protected getStateFromPostResponse(reponseData:any):ITxnPerJVMState
	{
		return {perJVM: reponseData[0], summary: reponseData[1]};
	}

	protected renderContent(data:ITxnPerJVMState):any
	{
		if(!accountStatus.isPro)
			return <NeedPro pageName={"Per JVM Stats"}/>;

		return <TxnPerJVM dispatch={this.props.dispatch} perJVM={data.perJVM} summary={data.summary}/>;
	}

}

interface ITxnTraceState
{
	traceList: ISortedListItem[];
}



class TxnTxnTraceView_connect extends AbstractTxnDetailView<IAppTxnPageProps, ITxnTraceState> implements IDSTabView
{

	protected getMetricFetchURLs():string[]
	{
		return undefined;
	}

	protected getHttpRequests(props:IAppTxnPageProps) :JQueryXHR[]
	{
		const body = QueryRequests.postBody_App_Txn_Filter(props.app, props.appInfo, props.appTxn);
		body.parentName = body.metricName;
		return [Http.postJSON("/xapp/es/txn/trace/list", body)];
	}

	protected initialState(): ITxnTraceState
	{
		return {traceList: []};
	}
	protected getStateFromPostResponse(reponseData:any): ITxnTraceState
	{
		const list = reponseData[0];
		return {traceList: list};
	}

	protected renderContent(data: ITxnTraceState)
	{
		if(!accountStatus.isPro)
			return <NeedPro pageName={"Transaction Traces"}/>;

		return <TxnTraceViewer traceList={data.traceList} appName={this.props.appInfo.app.name} txnName={this.props.appTxn.txnRealName} />
	}
}

interface ITxnErrState
{
	errPct: ISeriesData;
	topXTimeline: ISeriesData[];
	errList: ISortedListItem[] ;
	selectedErr: ISortedListItem;
}



class TxnErrorView_connect extends AbstractTxnDetailView<IAppTxnPageProps, ITxnErrState> implements IDSTabView
{

	protected getMetricFetchURLs():string[]
	{
		return ["/xapp/es/err/pct","/xapp/es/txn/err/topx/timeline","/xapp/es/txn/err/list"];
	}

	protected initialState():ITxnErrState
	{
		return {errPct: null, topXTimeline: [], errList: [], selectedErr: null};
	}

	protected getStateFromPostResponse(reponseData:any):ITxnErrState
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

	protected renderContent(data:ITxnErrState):any
	{
		if(!accountStatus.isPro)
			return <NeedPro pageName={"Errors for this Transaction"}/>;

		if(data.selectedErr)
		{
			return <TxnErrTrace exceptionName={data.selectedErr.realName} onClose={this.onErrClose.bind(this)} />;
		}

		return <TxnErrView errPct={data.errPct} topXTimeline={data.topXTimeline} errList={data.errList} dispatch={this.props.dispatch} onErrSelect={this.onErrSelect.bind(this)}/>;
	}
}

interface ITxnErrTraceProps1
{
	exceptionName: string;
	onClose: ()=>void;
}

interface ITxnErrTraceState
{
	data;
}

type ITxnErrTraceProps = ITxnErrTraceProps1 & IAppTxnPageProps;

class TxnErrTrace_connect extends LoadableComponent<ITxnErrTraceProps, ITxnErrTraceState>
{
	protected getHttpRequests(props:IAppTxnPageProps) :JQueryXHR[]
	{
		const body = QueryRequests.postBody_App_Txn_Filter(props.app, props.appInfo, props.appTxn);
		body.metricName = this.props.exceptionName;
		body.parentName = this.props.appTxn.txnRealName;

		return [Http.postJSON("/xapp/es/txn/err/trace/list", body)];
	}

	protected initialState(): ITxnErrTraceState
	{
		return {data: null};
	}

	protected getStateFromPostResponse(responseData: any): ITxnErrTraceState
	{
		return {data: responseData[0]};
	}

	protected renderContent(data: ITxnErrTraceState): any
	{
		const appIdName: IAppIdName = {appId: this.props.appInfo.app.id, appName: this.props.appInfo.app.name};
		return <ErrTraceViewer app={appIdName} data={data.data} onClose={this.props.onClose}/>;
	}

}

interface ITxnTrendViewState
{
	trends: IMetricTrendContainerWithChildren;
	txnDayOfWeek: ITxnCalendarTrends;
	txnTimeOfDay: ITxnCalendarTrends;
}



class TxnTrendsPage_connect extends AbstractTxnDetailView<IAppTxnPageProps, ITxnTrendViewState> implements IDSTabView
{
	protected getMetricFetchURLs(): string[]
	{
		return undefined;
	}

	protected getHttpRequests(props:IAppTxnPageProps) :JQueryXHR[]
	{
		const body = QueryRequests.postBody_App_Txn_Filter(props.app, props.appInfo, props.appTxn);
		const tz = jstz.determine().name();
		const bodyWTimezone = updateObj(body, {timezone: tz});
		return [Http.postJSON("/xapp/es/trends/overview/txns", body),Http.postJSON("/xapp/es/dayofweek/txn", bodyWTimezone),Http.postJSON("/xapp/es/timeofday/txn", bodyWTimezone)];
	}

	protected initialState(): ITxnTrendViewState
	{
		return {trends: null, txnDayOfWeek: null, txnTimeOfDay: null};
	}

	protected getStateFromPostResponse(responseData: any): ITxnTrendViewState
	{
		return {trends: responseData[0], txnDayOfWeek: responseData[1], txnTimeOfDay: responseData[2]};
	}

	protected renderContent(data: ITxnTrendViewState): any
	{
		if(!accountStatus.isPro)
			return <NeedPro pageName={"Trends"}/>;

		return (
			<div>
				<TxnTrendsView trendOverview={data.trends} txnDayOfWeek={data.txnDayOfWeek} txnTimeOfDay={data.txnTimeOfDay} />
			</div>
		);
	}
}

interface ITxnScalabilityPageState
{
	graph: IScalabilityGraph;
}


class TxnScalabilityPage_connect extends AbstractTxnDetailView<IAppTxnPageProps, ITxnScalabilityPageState> implements IDSTabView
{
	protected getMetricFetchURLs(): string[]
	{
		return ["/xapp/es/scalability"];
	}

	protected initialState(): ITxnScalabilityPageState
	{
		return {graph: null};
	}

	protected getStateFromPostResponse(responseData: any): ITxnScalabilityPageState
	{
		return {graph: responseData[0]};
	}

	protected renderContent(data: ITxnScalabilityPageState): any
	{
		if(!accountStatus.isPro)
			return <NeedPro pageName={"Scalability Report"}/>;

		return <GenericScalabilityView graph={data.graph} timeRange={this.props.app.timeRange}/>
	}
}



class TxnCategoryTabs_connect extends React.Component<IAppTxnPageProps,{}>
{
	render()
	{
		const appTxn = this.props.appTxn;

		return <CategoryTabsWidget activeTab={appTxn.catTab} selectedMetric={appTxn.txn} dispatch={this.props.dispatch} metricCategory={MetricCategory.Txn}/>;
	}
}

const TxnCategoryTabs = connect((state)=> appTxnConnector(state))(TxnCategoryTabs_connect);
const TxnScalabilityPage = connect((state)=> appTxnConnector(state))(TxnScalabilityPage_connect);
const TxnTrendsPage = connect((state)=> appTxnConnector(state))(TxnTrendsPage_connect);
export const TxnDetailView = connect((state)=> appTxnConnector(state))(TxnDetailView_connect);
const TxnErrorView = connect((state)=> appTxnConnector(state))(TxnErrorView_connect);
const TxnErrTrace = connect((state, props:ITxnErrTraceProps1)=> connectorWithProps(state, props, appTxnConnector))(TxnErrTrace_connect);
const TxnOverviewView = connect((state)=> appTxnConnector(state))(TxnOverviewView_connect);
const TxnPerJVMView = connect((state)=> appTxnConnector(state))(TxnPerJVMView_connect);
const TxnTopXOverviewPage = connect((state)=> appTxnConnector(state))(TxnTopXOverviewPage_connect);
const TxnTxnTraceView = connect((state)=> appTxnConnector(state))(TxnTxnTraceView_connect);