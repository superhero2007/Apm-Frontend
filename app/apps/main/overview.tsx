import * as React from "react";
import {LoadableComponent} from "../../widgets/loadableComponent";
import {IStore} from "../../reduxSetup";
import {connect} from "react-redux";
import {IAppPageProps} from "./applicationPage";
import {ChangeDetectionAppRR} from "../../es/pinned/changeDetectRRPinned";
import {Http} from "../../http";
import {QueryRequests} from "../../es/queryRequests";
import {IDataPoint, ISeriesData} from "../../es/views/metricDetailView";
import {ChartTitle} from "../../es/charts/chartTitle";
import {errRateDisplay, megaByteDisplay, responseTimeDisplay, throughputDisplay, throughputUnit} from "../../es/metricUtils";
import {RowCol} from "../../widgets/rowCol";
import {IResponseTimeSegment, SegmentUtils} from "./segmentStuff";
import {StackedAreaChart} from "../../es/charts/stackedAreaChart";
import {ThroughputAndErrorChart} from "../../es/charts/thpAndErrChart";
import * as _ from "lodash";
import {DeviationThpChart} from "../../es/charts/deviationThpChart";
import {DeviationResponseTimeChart} from "../../es/charts/deviationRespTimeChart";
import {DSTabs, DSTabType, DSTabViewInfo, DSTabViewManager, IDSTabView, TabStyle} from "../../es/widgets/dsTabs";
import {IStatsByMetric} from "../../es/views/perAppMetricView";
import {ResponseTimeMultiLineChart} from "../../es/charts/respTimeMultiLineChart";
import {ThroughputMultiLineChart} from "../../es/charts/thpMultiLineChart";
import {ErrRateMultiLineChart} from "../../es/charts/ErrRateMultiLineChart";
import {CPUPercentageMultiLineChart, HeapTimeMultiLineChart, MultiLineChart} from "../../es/charts/multiLineChart";
import {GenericScalabilityView} from "../../es/views/generticScalabilityView";
import {Col, Row} from "react-bootstrap";
import {ResponseTimeLineChart} from "../../es/charts/resptimeLineChart";
import {CpuChart} from "../../es/charts/cpuGcChart";
import {action_updateDetailTab_AppOvr, action_updateDetailTabState_AppOvr, IRR_AppOverview} from "../../reducers/appReducer";
import {updateObj} from "../../reducers/esReducer";
import {accountStatus} from "../../accountStatus";
import {NeedPro} from "../../widgets/needPro";
import {IMetricTrendContainerWithChildren, ITxnCalendarTrends, TxnTimeOfDayTrendChart, TxnTrendsOverviewView} from "../txnTrendsView";
import {AppFiltersPage, IAppJVMFilterState} from "./appFiltersPage";
import {AmplitudeAnalytics} from "../../analytics";
import {IPercentileResult, PercentileView} from "./percentiles";
import {appOverviewConnector, appOverviewConnectorWithProps, appPageConnector} from "../../reduxConnectors";

declare var require:any;
var jstz = require('jstimezonedetect');


export interface IAppOverviewPageProps extends IAppPageProps
{
	appOverview?: IRR_AppOverview;
}



export function App_OverviewPage_getDefaultPageState(): IRR_AppOverview
{
	return {tab: {type: DSTabType.overview, state: AppOverviewPage_getDefaultTabState()}};
}

class App_OverviewPage_connect extends AppFiltersPage<IAppOverviewPageProps>
{

	constructor(props, context)
	{
		super(props, context);
		AmplitudeAnalytics.track("App - Overview Page");
	}

	private tabViewManager = new DSTabViewManager([
		new DSTabViewInfo(DSTabType.overview, AppOverviewPage, AppOverviewPage_getDefaultTabState),
		new DSTabViewInfo(DSTabType.perjvm, AppPerJVMPage),
		new DSTabViewInfo(DSTabType.trends, AppTrendsPage),
		new DSTabViewInfo(DSTabType.scalable, AppScalabilityPage),
		new DSTabViewInfo(DSTabType.hardware, AppHardwarePage)
	]);


	private onSelectTab(tabType:DSTabType)
	{
		const defaultState = this.tabViewManager.getViewDefaultState(tabType);
		this.props.dispatch(action_updateDetailTab_AppOvr({type: tabType, state: defaultState} as any));
	}


	protected doRender(data: IAppJVMFilterState): any
	{
		const tab = this.props.appOverview.tab.type;
		return (
			<div>
				<div className="bottom2">
					<DSTabs activeTab={tab} tabs={this.tabViewManager.getAllTabTypes()} onSelect={this.onSelectTab.bind(this)} style={TabStyle.tabs}/>
				</div>
				{this.tabViewManager.renderView(tab)}
			</div>
		);
	}
}

interface IAppDetail {
	responseTimeSegments:IResponseTimeSegment[];
	asyncSegments:IResponseTimeSegment[];

	throughputs:IDataPoint[];
	errorCounts:IDataPoint[];
	avgErrRate:number;

	avgResponseTime:number;
	avgThroughput:number;

	responseTimes: IDataPoint[];
	totalThps: IDataPoint[];

}

abstract class AbstractAppPage<P extends IAppPageProps,S> extends LoadableComponent<P, S>
{
	componentWillReceiveProps(nextProps:P)
	{
		const newRR = nextProps.app;
		const oldRR = this.props.app;

		if(ChangeDetectionAppRR.timeRangeAndJVM(oldRR, newRR))
		{
			this.reloadData(nextProps);
		}
	}

	protected getHttpRequests(props:P) :JQueryXHR[]
	{
		const body = QueryRequests.postBody_App_detailFilter(props.app, props.appInfo);
		return this.getMetricFetchURLs().map(url => Http.postJSON(url, body));
	}

	protected abstract getMetricFetchURLs(): string[];
}


interface IAppPctileProps1
{
	avgResponseTime:number;
}

type IAppPctileProps = IAppPctileProps1 & IAppPageProps;

interface IAppPctileState
{
	pctiles: IPercentileResult;
}


class AppPctilePage_connect extends AbstractAppPage<IAppPctileProps, IAppPctileState>
{
	protected getMetricFetchURLs(): string[]
	{
		return [ "/xapp/es/app/pctile"];
	}

	protected initialState(): IAppPctileState
	{
		return {pctiles: null};
	}

	protected getStateFromPostResponse(responseData: any): IAppPctileState
	{
		return {pctiles: responseData[0]};
	}

	protected renderContent(data: IAppPctileState): any
	{
		return (
			<RowCol>
				<ChartTitle chartName="Response Time" summaryStat={responseTimeDisplay(this.props.avgResponseTime)} summaryType="Average"/>
				<PercentileView pctiles={data.pctiles} dispatch={this.props.dispatch}/>
			</RowCol>
		);
	}
}


interface IState {
	appDetail:IAppDetail;
}


interface IOverviewPageTabState
{
	chartType: DSTabType;
}


function AppOverviewPage_getDefaultTabState(): IOverviewPageTabState
{
	return {chartType: DSTabType.normal};
}

class AppOverviewPage_conenct extends AbstractAppPage<IAppOverviewPageProps, IState> implements IDSTabView
{

	protected getMetricFetchURLs():string[]
	{
		return ["/xapp/es/app/detail"];
	}

	protected initialState():IState
	{
		return {appDetail: null};
	}

	protected getStateFromPostResponse(reponseData:any):IState
	{
		return {appDetail: reponseData[0]};
	}


	private renderRelativeCharts(appDetail:IAppDetail)
	{
		return (
			<div>
				<RowCol>
					<ChartTitle chartName="Response Time" summaryStat={responseTimeDisplay(appDetail.avgResponseTime)} summaryType="Average"/>
					<DeviationResponseTimeChart dispatch={this.props.dispatch} stats={appDetail.responseTimes} avg={appDetail.avgResponseTime} />
				</RowCol>
				<RowCol>
					<ChartTitle chartName="Throughput" summaryStat={throughputDisplay(appDetail.avgThroughput)} summaryType="Average"/>
					<DeviationThpChart dispatch={this.props.dispatch} stats={appDetail.totalThps} avg={appDetail.avgThroughput} />
				</RowCol>
			</div>
		);
	}

	private onSelectPill(tab: DSTabType)
	{
		const data = {chartType: tab};
		this.props.dispatch(action_updateDetailTabState_AppOvr(data));
	}

	protected renderContent(data:IState):any
	{
		const appDetail = data.appDetail;

		const tabState = this.props.appOverview.tab.state as IOverviewPageTabState;
		const tabs = (
			<RowCol className="bottom2">
				<DSTabs activeTab={tabState.chartType} tabs={[DSTabType.normal, DSTabType.relative, DSTabType.percentiles]}
				        onSelect={this.onSelectPill.bind(this)} style={TabStyle.pills}/>
			</RowCol>
		);


		let charts;
		if(tabState.chartType == DSTabType.relative)
		{
			charts = this.renderRelativeCharts(appDetail);
		}
		else {
			const respTimes = SegmentUtils.toSeriesData(appDetail.responseTimeSegments);
			let asyncChart;
			if(! _.isEmpty(appDetail.asyncSegments))
			{
				const asyncTimes = SegmentUtils.toSeriesData(appDetail.asyncSegments);

				asyncChart = (
					<RowCol>
						<ChartTitle chartName="Async Calls"/>
						<StackedAreaChart seriesList={asyncTimes} dispatch={this.props.dispatch} displayFunc={responseTimeDisplay}/>
					</RowCol>

				);
			}

			let responseTimeChart;
			if(tabState.chartType == DSTabType.percentiles)
			{
				if(!PercentileView.canDisplayPctile(this.props.app.timeRange))
				{
					responseTimeChart= PercentileView.renderTimeRangeMsg();
				}
				else
				{
					responseTimeChart = <AppPctilePage avgResponseTime={appDetail.avgResponseTime}/>;
				}
			}
			else
			{
				responseTimeChart = (
					<div>
						<RowCol>
							<ChartTitle chartName="Response Time" summaryStat={responseTimeDisplay(appDetail.avgResponseTime)} summaryType="Average"/>
							<StackedAreaChart seriesList={respTimes} dispatch={this.props.dispatch} displayFunc={responseTimeDisplay} deploys={this.props.appInfo.deploys}/>
						</RowCol>
						{asyncChart}
					</div>
				);
			}

			charts = (
				<div>
					{responseTimeChart}

					<RowCol>
						<ChartTitle chartName="Throughput"
						            summaryStat={throughputDisplay(appDetail.avgThroughput)} summaryType="Average"
						            summaryStat2={errRateDisplay(appDetail.avgErrRate)} summaryType2="Average Error Rate"
						/>
						<ThroughputAndErrorChart succPts={appDetail.throughputs} errPts={appDetail.errorCounts} dispatch={this.props.dispatch}/>
					</RowCol>
				</div>
			);
		}

		return (
			<div>
				{tabs}
				{charts}
			</div>
		);
	}

}



interface IBasicJVMStats
{
	cpu: ISeriesData[];
	gc: ISeriesData[];
	heapUsed: ISeriesData[];
}
interface IAppJVMPageState {
	perJvm: IStatsByMetric;
	jvmStats: IBasicJVMStats;
}

class AppPerJVMPage_connect extends AbstractAppPage<IAppPageProps, IAppJVMPageState> implements IDSTabView
{

	protected getMetricFetchURLs():string[]
	{
		return ["/xapp/es/txn/perjvm", "/xapp/es/app/jvmbasic"];
	}

	protected initialState():IAppJVMPageState
	{
		return {perJvm: null, jvmStats: null};
	}

	protected getStateFromPostResponse(reponseData:any):IAppJVMPageState
	{
		return {perJvm: reponseData[0], jvmStats: reponseData[1]};
	}

	private sortSeries(seriesList: ISeriesData[]): ISeriesData[]
	{
		return _.sortBy(seriesList, series => series.seriesName);
	}

	protected renderContent(data:IAppJVMPageState):any
	{
		if(!accountStatus.isPro)
		{
			return <NeedPro pageName={"Per JVM Stats"}/>;
		}

		return (
			<div>
				<RowCol>
					<RowCol className="bottom1">
						<ChartTitle chartName="Response Time"/>
					</RowCol>
					<ResponseTimeMultiLineChart seriesList={this.sortSeries(data.perJvm.responseTimes)} dispatch={this.props.dispatch}/>
				</RowCol>
				<RowCol>
					<RowCol className="bottom1">
						<ChartTitle chartName="Throughput"/>
					</RowCol>
					<ThroughputMultiLineChart   seriesList={this.sortSeries(data.perJvm.throughputs)} dispatch={this.props.dispatch}/>
				</RowCol>
				<RowCol>
					<RowCol className="bottom1">
						<ChartTitle chartName="Error Rate"/>
					</RowCol>
					<ErrRateMultiLineChart   seriesList={this.sortSeries(data.perJvm.errRates)} dispatch={this.props.dispatch}/>
				</RowCol>

				<hr/>

				<RowCol className="top3">
					<RowCol className="bottom1">
						<ChartTitle chartName="Heap Used"/>
					</RowCol>
					<HeapTimeMultiLineChart dispatch={this.props.dispatch} seriesList={this.sortSeries(data.jvmStats.heapUsed)}/>
				</RowCol>


				<RowCol>
					<RowCol className="bottom1">
						<ChartTitle chartName="CPU"/>
					</RowCol>
					<CPUPercentageMultiLineChart seriesList={this.sortSeries(data.jvmStats.cpu)} dispatch={this.props.dispatch}/>
				</RowCol>
				<RowCol>
					<RowCol className="bottom1">
						<ChartTitle chartName="GC"/>
					</RowCol>
					<CPUPercentageMultiLineChart seriesList={this.sortSeries(data.jvmStats.gc)} dispatch={this.props.dispatch}/>
				</RowCol>
			</div>
		);
	}

}


interface IAppScalabilityState
{
	graph;
}

class AppScalabilityPage_connect extends AbstractAppPage<IAppPageProps, IAppScalabilityState> implements IDSTabView
{



	protected getMetricFetchURLs():string[]
	{
		return ["/xapp/es/scalability"];
	}

	protected initialState():IAppScalabilityState
	{
		return {graph: null};
	}

	protected getStateFromPostResponse(reponseData:any):IAppScalabilityState
	{
		return {graph: reponseData[0]};
	}

	protected renderContent(data:IAppScalabilityState):any
	{
		if(!accountStatus.isPro)
		{
			return <NeedPro pageName={"Scalability Report"}/>;
		}

		return (
			<div>
				<RowCol>
					<GenericScalabilityView graph={data.graph} timeRange={this.props.app.timeRange}/>
				</RowCol>
			</div>
		);
	}

}



interface IHardwareDetail {
	maxGC:IDataPoint[];
	totalHeap:IDataPoint[];
	usedHeap:IDataPoint[];
	totalCPU:IDataPoint[];
	jvmCounts:IDataPoint[];
	cores:IDataPoint[];
	ram:IDataPoint[];
	totalThreads:IDataPoint[];
}

interface IAppHardwareState
{
	hw: IHardwareDetail;
}

class AppHardwarePage_connect extends AbstractAppPage<IAppPageProps, IAppHardwareState> implements IDSTabView
{

	protected getMetricFetchURLs(): string[]
	{
		return ["/xapp/es/hardware"];
	}

	protected initialState(): IAppHardwareState
	{
		return {hw: null};
	}

	protected getStateFromPostResponse(reponseData: any): IAppHardwareState
	{
		return {hw: reponseData[0]};
	}

	protected renderContent(data: IAppHardwareState)
	{
		if(!accountStatus.isPro)
		{
			return <NeedPro pageName={"Hardware Usage"}/>;
		}

		const hw = data.hw;

		const memSeries: ISeriesData[] = [
			{seriesName: "Total RAM", dataPoints: hw.ram},
			{seriesName: "Total Available Heap", dataPoints: hw.totalHeap},
			{seriesName: "Total Used Heap", dataPoints: hw.usedHeap}
		];

		return (
			<div>
				<Row>
					<Col xs={6}>
						<ChartTitle chartName="Total JVMs" bottomSpace={true}/>
						<MultiLineChart dispatch={this.props.dispatch} valueDisplayFunc={throughputUnit} seriesList={([{seriesName: "JVM Count", dataPoints: hw.jvmCounts}])}/>
					</Col>
					<Col xs={6}>
						<ChartTitle chartName="Total CPU Cores" bottomSpace={true}/>
						<MultiLineChart dispatch={this.props.dispatch} valueDisplayFunc={throughputUnit} seriesList={([{seriesName: "CPU Core Count", dataPoints: hw.cores}])}/>
					</Col>
				</Row>
				<Row>
					<Col xs={6}>
						<ChartTitle chartName="Total Memory" bottomSpace={true}/>
						<MultiLineChart dispatch={this.props.dispatch} valueDisplayFunc={megaByteDisplay} seriesList={memSeries}/>
					</Col>
					<Col xs={6}>
						<ChartTitle chartName="Total CPU" bottomSpace={true}/>
						<CpuChart dispatch={this.props.dispatch} cpuPts={hw.totalCPU}/>
					</Col>
				</Row>
				<Row>
					<Col xs={6}>
						<ChartTitle chartName="Longest GC Pause" bottomSpace={true}/>
						<ResponseTimeLineChart dispatch={this.props.dispatch} seriesName="Longest GC Pause" dataPoints={hw.maxGC}/>
					</Col>
					<Col xs={6}>
						<ChartTitle chartName="Total Threads" bottomSpace={true}/>
						<MultiLineChart dispatch={this.props.dispatch} valueDisplayFunc={throughputUnit} seriesList={([{seriesName: "Total Thread Count", dataPoints: hw.totalThreads}])}/>
					</Col>
				</Row>
			</div>
		);
	}
}



interface IAppTrendsState
{
	trendsOvr: IMetricTrendContainerWithChildren;
	dayOfWeek: ITxnCalendarTrends;
	timeOfDay: ITxnCalendarTrends;
}

class AppTrendsPage_connect extends AbstractAppPage<IAppPageProps, IAppTrendsState> implements IDSTabView
{


	protected getHttpRequests(props:IAppPageProps) :JQueryXHR[]
	{
		const body = QueryRequests.postBody_App_detailFilter(props.app, props.appInfo);
		const tz = jstz.determine().name();
		const bodyWTimezone = updateObj(body, {timezone: tz});
		return [Http.postJSON("/xapp/es/trends/overview/app", body),Http.postJSON("/xapp/es/timeofday/app", bodyWTimezone), Http.postJSON("/xapp/es/dayofweek/app", bodyWTimezone)];
	}

	protected getMetricFetchURLs():string[]
	{
		return null;
	}

	protected initialState():IAppTrendsState
	{
		return {trendsOvr: null, dayOfWeek: null, timeOfDay: null};
	}

	protected getStateFromPostResponse(reponseData:any):IAppTrendsState
	{
		return {trendsOvr: reponseData[0], dayOfWeek: reponseData[2], timeOfDay: reponseData[1]};
	}

	protected renderContent(data:IAppTrendsState):any
	{
		if(!accountStatus.isPro)
		{
			return <NeedPro pageName={"Application Trends"}/>;
		}

		return (
			<div>
				<RowCol>
					<TxnTrendsOverviewView trendOverview={data.trendsOvr}/>
				</RowCol>
				<hr/>
				<RowCol className="bottom2">
					<h3>Day of Week Trend</h3>
					<h5>(Using aggregated data from last 90 days)</h5>
				</RowCol>
				<TxnTimeOfDayTrendChart trendData={data.dayOfWeek}/>

				<hr/>
				<RowCol className="bottom2">
					<h3>Time of Day Trend</h3>
					<h5>(Using aggregated data from last 90 days)</h5>
				</RowCol>
				<div className="bottom2">
					<TxnTimeOfDayTrendChart trendData={data.timeOfDay}/>
				</div>
			</div>
		);
	}

}

const AppPerJVMPage = connect((state)=> appPageConnector(state))(AppPerJVMPage_connect);
const AppTrendsPage = connect((state)=> appPageConnector(state))(AppTrendsPage_connect);
const AppHardwarePage = connect((state)=> appPageConnector(state))(AppHardwarePage_connect);
const AppScalabilityPage = connect((state)=> appPageConnector(state))(AppScalabilityPage_connect);

const AppOverviewPage = connect((state)=> appOverviewConnector(state))(AppOverviewPage_conenct);
export const App_OverviewPage = connect((state)=> appOverviewConnector(state))(App_OverviewPage_connect);
const AppPctilePage = connect((state, props: IAppPctileProps1)=> appOverviewConnectorWithProps(state, props))(AppPctilePage_connect);