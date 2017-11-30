import * as React from "react";
import * as _ from "lodash";
import {IAppPageProps} from "./applicationPage";
import {action_appES_updateCategory, action_appES_updateDetailTab, action_appES_updateDetailTabState, action_initApp_ES, action_updateSelectedES, IRR_App_ES} from "../../reducers/appReducer";
import {AppFiltersPage, IAppJVMFilterState} from "./appFiltersPage";
import {ISortedListItem, MetricSortType, SortedMetricList} from "../../es/widgets/sortedMetricList";
import {DSTabs, DSTabType, DSTabViewInfo, DSTabViewManager, IDSTabView, TabStyle} from "../../es/widgets/dsTabs";
import {CategoryTabsWidget, CatTab} from "../../es/widgets/catTabs";
import {AmplitudeAnalytics} from "../../analytics";
import {connect} from "react-redux";
import {action_updateSortType, MetricCategory, updateObj} from "../../reducers/esReducer";
import {RowCol} from "../../widgets/rowCol";
import {MetricSortSelect} from "../../es/widgets/metricSortSelect";
import {Col, Row} from "react-bootstrap";
import {LoadableComponent} from "../../widgets/loadableComponent";
import {Http} from "../../http";
import {QueryRequests} from "../../es/queryRequests";
import {ChangeDetectionAppRR} from "../../es/pinned/changeDetectRRPinned";
import {TopXView} from "../../es/widgets/topXView";
import {IStatsByMetric} from "../../es/views/perAppMetricView";
import {IMetricStatsSummary, MetricPerJVM} from "./txn/perJvm";
import {IScalabilityGraph} from "../../es/widgets/scalabilityView";
import {GenericScalabilityView} from "../../es/views/generticScalabilityView";
import {IMetricTrendContainer, ITimeOfDayContainer, MetricTrends} from "../../es/widgets/metricTrends";
import {IMetricOverview} from "../../es/views/metricOverview";
import {ResponseTimeLineChart} from "../../es/charts/resptimeLineChart";
import {DeviationResponseTimeChart} from "../../es/charts/deviationRespTimeChart";
import {awsCategories, dbCategories, featuresToMetricCategories, getOpsCategory, metricCategoryDisplay, normalizeUnnamedTxn, responseTimeDisplay, throughputDisplay} from "../../es/metricUtils";
import {ChartTitle} from "../../es/charts/chartTitle";
import {DeviationThpChart} from "../../es/charts/deviationThpChart";
import {PctBarChart} from "../../es/charts/pctBarChart";
import {accountStatus} from "../../accountStatus";
import {NeedPro} from "../../widgets/needPro";
import {AccountDbTabs} from "../../es/db/accountDbTabs";
import {updateComponentState} from "../../utils";
import {ISlowQueryInfo, SlowQueriesListView} from "../../es/views/slowQueriesListView";
import {ITraceSampleInfo, QueryTrace} from "../../es/widgets/slowQueryTrace";
import {IStatsByMetricWithSummary, OpsView} from "../../es/widgets/opsView";
import {ISeriesData} from "../../es/views/metricDetailView";
import {StackedAreaChart} from "../../es/charts/stackedAreaChart";
import {appESConnector, appESConnectorWithProps} from "../../reduxConnectors";

declare var require:any;
var jstz = require('jstimezonedetect');

export interface IAppESPageProps extends IAppPageProps
{
	appES?: IRR_App_ES;
}

export function AppESPage_getDefaultPageState(): IRR_App_ES
{
	return {
		sortType: MetricSortType.TIME_SPENT,
		metric: null,
		metricRealName: null,
		catTab: CatTab.overview,
		category: MetricCategory.Rest,
		tab:{
			type: DSTabType.overview,
			state: ESOverviewPage_getDefaultTabState()
		}
	};
}

export function ESOverviewPage_getDefaultTabState(): IOverviewTabState
{
	return {chartType: DSTabType.normal};
}

export function AppDBPage_getDefaultPageState(): IRR_App_ES
{
	const defaultPageState = AppESPage_getDefaultPageState();
	defaultPageState.category = null;
	return defaultPageState;
}

export abstract class AbstractDBPage extends React.Component<IAppESPageProps, {}>
{
	private availableDbs: MetricCategory[];

	constructor(props, context)
	{
		super(props, context);
		this.availableDbs = featuresToMetricCategories(this.props.appInfo.features, this.getSupportedCategories());
	}

	componentWillMount()
	{
		if (this.availableDbs.length > 0 && !this.props.appES.category)
		{
			this.props.dispatch(action_appES_updateCategory(this.availableDbs[0]));
		}
	}

	private onDbSelect(category:MetricCategory)
	{
		if(this.props.appES.category !== category)
		{
			const defaultPageState = AppESPage_getDefaultPageState();
			defaultPageState.category = category;
			this.props.dispatch(action_initApp_ES(defaultPageState));
		}
	}
	render()
	{
		if(!accountStatus.isPro)
		{
			return <NeedPro pageName={this.getProPageName()}/>;
		}

		if (this.availableDbs.length == 0)
		{
			return <h2>{this.noCategoriesMsg()}</h2>;
		}

		return (

			<div>
				<RowCol>
					<AccountDbTabs categories={this.availableDbs} onSelect={this.onDbSelect.bind(this)} selected={this.props.appES.category}/>
				</RowCol>

				<RowCol>
					<AppESPage/>
				</RowCol>
			</div>
		);
	}

	protected abstract getSupportedCategories():MetricCategory[];
	protected abstract getProPageName();
	protected abstract noCategoriesMsg();
}



class AppDBPage_connect extends AbstractDBPage
{

	constructor(props, context)
	{
		super(props, context);
		AmplitudeAnalytics.track("App - Database Page");
	}

	protected noCategoriesMsg()
	{
		return "No Database calls";
	}

	protected getProPageName()
	{
		return "Database metrics";
	}

	protected getSupportedCategories():MetricCategory[]
	{
		return dbCategories();
	}
}


class AppAWSPage_connect extends AbstractDBPage
{


	constructor(props, context)
	{
		super(props, context);
		AmplitudeAnalytics.track("App - AWS Page");
	}

	protected noCategoriesMsg()
	{
		return "No AWS calls";
	}

	protected getProPageName()
	{
		return "AWS metrics";
	}

	protected getSupportedCategories():MetricCategory[]
	{
		return awsCategories();
	}
}

class AppESPage_connect extends AppFiltersPage<IAppESPageProps>
{

	constructor(props, context)
	{
		super(props, context);
		AmplitudeAnalytics.track(`App - ${metricCategoryDisplay(this.props.appES.category)} Page`);
	}

	componentWillReceiveProps(nextProps:IAppESPageProps)
	{
		const newRR = nextProps.app;
		const oldRR = this.props.app;

		if (ChangeDetectionAppRR.timeRange(oldRR, newRR) || ChangeDetectionAppRR.category(this.props.appES, nextProps.appES))
		{
			this.reloadData(nextProps);
		}
	}

	private onSelectSort(sort:MetricSortType)
	{
		this.props.dispatch(action_updateSortType(sort));
	}


	protected renderContent(data: IAppJVMFilterState): any
	{
		if(!accountStatus.isPro)
		{
			return <NeedPro pageName={`${metricCategoryDisplay(this.props.appES.category)}`}/>;
		}
		return super.renderContent(data);
	}

	protected doRender(data: IAppJVMFilterState)
	{
		const appES = this.props.appES;

		let detailView;
		if(appES.metric && appES.catTab === CatTab.metric)
		{
			detailView = <ESDetailPage/>;
		}
		else
		{
			detailView = <ESTopXOverviewPage/>;
		}

		return (
			<div>
				<Row>
					<Col xs={4}>
						<RowCol className="bottom2">
							<MetricSortSelect allowSortByError={false}
							                  onSelection={this.onSelectSort.bind(this)} selected={appES.sortType}/>
						</RowCol>
						<RowCol>
							<ESListView/>
						</RowCol>
					</Col>
					<Col xs={8}>
						<Row className = "bottom1">
							<Col xsOffset={3}>
								<ESCategoryTabs/>
							</Col>
						</Row>
						<RowCol>
							{detailView}
						</RowCol>
					</Col>
				</Row>
			</div>
		);
	}
}




interface IESListViewState
{
	listItems   :ISortedListItem[];
}


class ESListView_connect extends LoadableComponent<IAppESPageProps,IESListViewState>
{
	protected initialState(): IESListViewState
	{
		return {listItems: []};
	}

	protected getStateFromPostResponse(responseData: any): IESListViewState
	{
		return {listItems: responseData[0]};
	}

	protected getHttpRequests(props:IAppESPageProps) :JQueryXHR[]
	{
		const body = QueryRequests.postBody_App_ES_Filter(props.app, props.appInfo, props.appES);

		return [Http.postJSON("/xapp/es/list", body)];
	}

	componentWillReceiveProps(nextProps:IAppESPageProps)
	{
		const newRR = nextProps.app;
		const oldRR = this.props.app;

		if(ChangeDetectionAppRR.timeRangeAndJVM(oldRR, newRR) || ChangeDetectionAppRR.sort(this.props.appES, nextProps.appES))
		{
			this.reloadData(nextProps);
		}
	}

	private onSelectMetric(it:ISortedListItem)
	{
		this.props.dispatch(action_updateSelectedES(it));
	}

	protected renderContent(data: IESListViewState): any
	{
		if(_.isEmpty(data.listItems))
		{
			return <div>No calls in this time range</div>;
		}

		const appES = this.props.appES;
		const selectedTxn = appES.metric;
		const selection = data.listItems.find(it => it.name === selectedTxn);

		return (
			<div>
				<SortedMetricList selectedItem={selection}
				                  listItems={data.listItems} sortType={appES.sortType}  onSelectMetric={this.onSelectMetric.bind(this)} />
			</div>
		);
	}

}

interface IESTopXOverviewPageState
{
	respTimes;
	thps;
	slowest;
}

class ESTopXOverviewPage_connect extends LoadableComponent<IAppESPageProps, IESTopXOverviewPageState>
{
	protected getMetricFetchURLs(): string[]
	{
		return undefined;
	}

	protected initialState(): IESTopXOverviewPageState
	{
		return {respTimes: null, thps: null, slowest: null};
	}

	protected getStateFromPostResponse(responseData: any): IESTopXOverviewPageState
	{
		return { respTimes: responseData[0], thps: responseData[1], slowest: responseData[2]};
	}


	componentWillReceiveProps(nextProps:IAppESPageProps)
	{
		const newRR = nextProps.app;
		const oldRR = this.props.app;

		if(ChangeDetectionAppRR.timeRangeAndJVM(oldRR, newRR))
		{
			this.reloadData(nextProps);
		}
	}

	protected getHttpRequests(props:IAppESPageProps) :JQueryXHR[]
	{
		const body = QueryRequests.postBody_App_ES_Filter(props.app, props.appInfo, props.appES);

		const respbody = updateObj(body, {sortType: MetricSortType[MetricSortType.TIME_SPENT]});
		const thpbody = updateObj(body, {sortType: MetricSortType[MetricSortType.AVG_THROUGHPUT]});
		const slowBody = updateObj(body, {sortType: MetricSortType[MetricSortType.AVG_RESPTIME]});
		return [Http.postJSON("/xapp/es/overview/top5", respbody), Http.postJSON("/xapp/es/overview/top5", thpbody), Http.postJSON("/xapp/es/overview/top5", slowBody)];
	}

	protected renderContent(data: IESTopXOverviewPageState): any
	{
		let opsView;
		const opsCategory = getOpsCategory(this.props.appES.category);
		if(opsCategory)
		{
			opsView = <ESOpsOverviewPage/>;
		}
		return (
			<div>
				<TopXView respTimes={data.respTimes} thps={data.thps} slowest={data.slowest} dispatch={this.props.dispatch}/>
				{opsView}
			</div>
		);
	}

}


class ESCategoryTabs_connect extends React.Component<IAppESPageProps,{}>
{
	render()
	{
		const appES = this.props.appES;

		return <CategoryTabsWidget activeTab={appES.catTab} selectedMetric={appES.metric} dispatch={this.props.dispatch} metricCategory={appES.category}/>;
	}
}


class ESDetailPage_connect extends React.Component<IAppESPageProps, {
	tabViewManager: DSTabViewManager;
}>
{
	constructor(props, context)
	{
		super(props, context);

		const category = this.props.appES.category;

		this.state = {tabViewManager: this.initTabViewManager(category)};

	}

	private initTabViewManager(category: MetricCategory)
	{
		const tabs = [
			new DSTabViewInfo(DSTabType.overview, ESOverviewPage, ESOverviewPage_getDefaultTabState),
			new DSTabViewInfo(DSTabType.perjvm, ESPerJVMView),
		];
		if (category === MetricCategory.CQL || category === MetricCategory.SQL)
		{
			tabs.push(new DSTabViewInfo(DSTabType.slowqueries, ESSlowQueriesPage));
		}

		tabs.push(new DSTabViewInfo(DSTabType.trends, ESTrendsView));
		tabs.push(new DSTabViewInfo(DSTabType.scalable, ESScalabilityPage));

		return new DSTabViewManager(tabs);
	}

	componentWillReceiveProps(nextProps:IAppESPageProps)
	{
		if (ChangeDetectionAppRR.category(this.props.appES, nextProps.appES))
		{
			updateComponentState(this, {tabViewManager: this.initTabViewManager(nextProps.appES.category)});
		}
	}

	private onSelectTab(tabType:DSTabType)
	{
		const defaultState = this.state.tabViewManager.getViewDefaultState(tabType);
		this.props.dispatch(action_appES_updateDetailTab({type: tabType, state: defaultState} as any));
	}


	render()
	{
		const appES = this.props.appES;

		const tabs = this.state.tabViewManager.getAllTabTypes();
		const activeTab = appES.tab.type;

		return (
			<div>
				<RowCol className="bottom1">
					<h2>{appES.metric}</h2>
				</RowCol>
				<hr/>
				<RowCol className="bottom2">
					<DSTabs activeTab={activeTab} tabs={tabs} onSelect={this.onSelectTab.bind(this)} style={TabStyle.tabs}/>
				</RowCol>
				<RowCol>
					{this.state.tabViewManager.renderView(activeTab)}
				</RowCol>
			</div>
		);
	}
}

abstract class AbstractESDetailView <P extends IAppESPageProps, S> extends LoadableComponent<P,S>
{
	componentWillReceiveProps(nextProps:P)
	{
		const newRR = nextProps.app;
		const oldRR = this.props.app;

		if(ChangeDetectionAppRR.timeRangeAndJVM(oldRR, newRR) || ChangeDetectionAppRR.sort(this.props.appES, nextProps.appES)
			|| ChangeDetectionAppRR.metric(this.props.appES, nextProps.appES))
		{
			this.reloadData(nextProps);
		}
	}


	protected getHttpRequests(props:P) :JQueryXHR[]
	{
		const body = QueryRequests.postBody_App_ES_Filter(props.app, props.appInfo, props.appES);
		return this.getMetricFetchURLs().map(url => Http.postJSON(url, body));
	}

	protected abstract getMetricFetchURLs(): string[];
}

interface ISlowQueriesState
{
	slowQueries: ISlowQueryInfo[];
	selectedQuery:ISlowQueryInfo;
}



class ESSlowQueriesPage_connect extends AbstractESDetailView<IAppESPageProps, ISlowQueriesState> implements IDSTabView
{
	protected getMetricFetchURLs(): string[]
	{
		return ["/xapp/es/slowqueries"];
	}

	protected initialState(): ISlowQueriesState
	{
		return {slowQueries: [], selectedQuery: null};
	}

	protected getStateFromPostResponse(responseData: any): ISlowQueriesState
	{
		return {slowQueries: responseData[0], selectedQuery: null};
	}

	private onSelectQuery(queryInfo:ISlowQueryInfo)
	{
		this.update_myStateProps({selectedQuery: queryInfo});
	}

	private onHideSample()
	{
		this.update_myStateProps({selectedQuery: null});
	}

	protected renderContent(data: ISlowQueriesState): any
	{
		if (data.selectedQuery)
			return <ESQueryTraceView slowQuery={data.selectedQuery} onClose={this.onHideSample.bind(this)}/>;
		else
			return <SlowQueriesListView onSelect={this.onSelectQuery.bind(this)} slowQueries={data.slowQueries} hideAppName={true}/>;
	}
}



interface IESQueryTraceViewProps
{
	onClose: ()=>void;
	slowQuery: ISlowQueryInfo;
}

type IProps = IESQueryTraceViewProps & IAppESPageProps;

class ESQueryTraceView_connect extends LoadableComponent<IProps, {}>
{
	private samples:ITraceSampleInfo[];

	protected initialState():{}
	{
		return {};
	}

	protected getHttpRequests(props:IProps) :JQueryXHR[]
	{
		const body = QueryRequests.postBody_App_ES_Filter(props.app, props.appInfo, props.appES) as any;
		body.sqlId = this.props.slowQuery.sqlId;

		return [Http.postJSON("/xapp/es/slowquery/samples", body)];
	}

	protected getStateFromPostResponse(reponseData:any):{}
	{
		this.samples = reponseData[0];
		return this.initialState();
	}

	protected renderContent(data:{}):any
	{
		return <QueryTrace metricCategory={this.props.appES.category} onClose={this.props.onClose} samples={this.samples} slowQuery={this.props.slowQuery}/>;
	}
}



interface IESOpsState
{
	stats:IStatsByMetricWithSummary;
}


class ESOpsOverviewPage_connect extends AbstractESDetailView<IAppESPageProps,IESOpsState>
{
	protected getMetricFetchURLs():string[]
	{
		return undefined;
	}

	protected initialState():IESOpsState
	{
		return {stats: null};
	}

	protected getHttpRequests(props:IAppESPageProps):JQueryXHR[]
	{
		const opsCategory = getOpsCategory(props.appES.category);
		const body = QueryRequests.postBody_App_ES_Filter(props.app, props.appInfo, props.appES);
		body.category =  MetricCategory[opsCategory];
		return [Http.postJSON("/xapp/es/ops", body)];
	}

	protected getStateFromPostResponse(reponseData:any):IESOpsState
	{
		return {stats: reponseData[0]};
	}

	protected renderContent(data:IESOpsState):any
	{
		return <OpsView category={this.props.appES.category} stats={data.stats} dispatch={this.props.dispatch}/>;
	}

}

interface IMetricDetail
{
	callers: ISortedListItem[];
	overview: IMetricOverview;
	thps: ISeriesData[];
}
interface IESOverviewState
{
	detail: IMetricDetail;
}

interface IOverviewTabState
{
	chartType: DSTabType
}

class ESOverviewPage_connect extends AbstractESDetailView<IAppESPageProps, IESOverviewState> implements IDSTabView
{

	protected getMetricFetchURLs(): string[]
	{
		return ["/xapp/es/detail/metric"];
	}

	protected initialState(): IESOverviewState
	{
		return {detail: null};
	}

	protected getStateFromPostResponse(responseData: any): IESOverviewState
	{
		return {detail: responseData[0]};
	}

	private onSelectTab(tab:DSTabType)
	{
		const data = {chartType: tab};
		this.props.dispatch(action_appES_updateDetailTabState(data));
	}

	protected renderResponseTimeChart(data:IESOverviewState)
	{
		const activeChartTypeTab = this.getActiveChartTypeTab();

		switch (activeChartTypeTab)
		{
			case DSTabType.normal:
				return <ResponseTimeLineChart dataPoints={data.detail.overview.responseTimes} dispatch={this.props.dispatch}/>;

			case DSTabType.relative:
				return (
					<div className="bottom-pad1">
						<DeviationResponseTimeChart stats={data.detail.overview.responseTimes} dispatch={this.props.dispatch} avg={data.detail.overview.avgResponseTime}/>
					</div>
				);

			default:
				throw "invalid tab";
		}
	}


	protected renderThpChart(data:IESOverviewState)
	{
		const activeChartTypeTab = this.getActiveChartTypeTab();

		switch (activeChartTypeTab)
		{
			case DSTabType.normal:
			{
				const thps = normalizeUnnamedTxn(data.detail.thps);
				return <StackedAreaChart seriesList={thps} dispatch={this.props.dispatch}/>;
			}

			case DSTabType.relative:
				return (
					<div className="bottom-pad1">
						<DeviationThpChart stats={data.detail.overview.throughputs} dispatch={this.props.dispatch} avg={data.detail.overview.avgThroughput}/>
					</div>
				);

			default:
				throw "invalid tab";
		}
	}

	protected renderContent(data: IESOverviewState): any
	{
		const callers = normalizeUnnamedTxn(data.detail.callers);

		return (
			<div>
				<RowCol className="bottom2">
					<DSTabs activeTab={this.getActiveChartTypeTab()} tabs={[DSTabType.normal, DSTabType.relative]} onSelect={this.onSelectTab.bind(this)} style={TabStyle.pills}/>
				</RowCol>
				<RowCol>
					<ChartTitle chartName="Response Time" summaryStat={responseTimeDisplay(data.detail.overview.avgResponseTime)} summaryType="Average"/>
					{this.renderResponseTimeChart(data)}
				</RowCol>
				<RowCol>
					<ChartTitle chartName="Throughput" summaryStat={throughputDisplay(data.detail.overview.avgThroughput)} summaryType="Average"/>
					{this.renderThpChart(data)}
				</RowCol>
				<RowCol>
					<ChartTitle chartName="Time Consumption By Transaction"/>
					<PctBarChart stats={callers}/>
				</RowCol>
			</div>
		);
	}

	private getActiveChartTypeTab(): DSTabType
	{
		const tab = this.props.appES.tab.state as IOverviewTabState;
		return tab.chartType;
	}
}

interface IESPerJVMState
{
	perJVM: IStatsByMetric;
	summary: IMetricStatsSummary;
}


class ESPerJVMView_connect extends AbstractESDetailView<IAppESPageProps, IESPerJVMState> implements IDSTabView
{

	protected getMetricFetchURLs():string[]
	{
		return ["/xapp/es/txn/perjvm","/xapp/es/summary"];
	}

	protected initialState():IESPerJVMState
	{
		return {perJVM: null, summary: null};
	}

	protected getStateFromPostResponse(reponseData:any):IESPerJVMState
	{
		return {perJVM: reponseData[0], summary: reponseData[1]};
	}

	protected renderContent(data:IESPerJVMState):any
	{
		return <MetricPerJVM dispatch={this.props.dispatch} perJVM={data.perJVM} summary={data.summary}/>;
	}
}

interface IESScalabilityPageState
{
	graph: IScalabilityGraph;
}


class ESScalabilityPage_connect extends AbstractESDetailView<IAppESPageProps, IESScalabilityPageState> implements IDSTabView
{

	protected getMetricFetchURLs(): string[]
	{
		return ["/xapp/es/scalability"];
	}

	protected initialState(): IESScalabilityPageState
	{
		return {graph: null};
	}

	protected getStateFromPostResponse(responseData: any): IESScalabilityPageState
	{
		return {graph: responseData[0]};
	}

	protected renderContent(data: IESScalabilityPageState): any
	{
		return <GenericScalabilityView graph={data.graph} timeRange={this.props.app.timeRange}/>
	}
}



interface IESTrendsViewState
{
	trends:     IMetricTrendContainer;
	dayOfWeek:  ITimeOfDayContainer;
	timeOfDay:  ITimeOfDayContainer;
}


class ESTrendsView_connect extends AbstractESDetailView<IAppESPageProps, IESTrendsViewState>
{
	protected getMetricFetchURLs():string[]
	{
		return [];
	}

	protected getHttpRequests(props:IAppESPageProps) :JQueryXHR[]
	{
		const body = QueryRequests.postBody_App_ES_Filter(props.app, props.appInfo, props.appES);
		const tz = jstz.determine().name();
		const bodyWTimezone = updateObj(body, {timezone: tz});

		return [Http.postJSON("/xapp/es/trends", body),Http.postJSON("/xapp/es/dayofweek", bodyWTimezone),Http.postJSON("/xapp/es/timeofday", bodyWTimezone)];
	}

	protected initialState():IESTrendsViewState
	{
		return {trends:null, dayOfWeek: null, timeOfDay: null};
	}

	protected getStateFromPostResponse(responseData:any):IESTrendsViewState
	{
		return {trends: responseData[0], dayOfWeek: responseData[1], timeOfDay: responseData[2]};
	}

	protected renderContent(data:IESTrendsViewState):any
	{
		return <MetricTrends trends={data.trends} dayOfWeek={data.dayOfWeek} timeOfDay={data.timeOfDay}/>;
	}

}

const ESTrendsView = connect((state)=> appESConnector(state))(ESTrendsView_connect);
const ESScalabilityPage = connect((state)=> appESConnector(state))(ESScalabilityPage_connect);
const ESPerJVMView = connect((state)=> appESConnector(state))(ESPerJVMView_connect);
const ESOverviewPage = connect((state)=> appESConnector(state))(ESOverviewPage_connect);
const ESOpsOverviewPage = connect((state)=> appESConnector(state))(ESOpsOverviewPage_connect);
const ESQueryTraceView = connect((state, props: IESQueryTraceViewProps)=> appESConnectorWithProps(state,props))(ESQueryTraceView_connect);
const ESSlowQueriesPage = connect((state)=> appESConnector(state))(ESSlowQueriesPage_connect);
const ESDetailPage = connect((state)=> appESConnector(state))(ESDetailPage_connect);
const ESCategoryTabs = connect((state)=> appESConnector(state))(ESCategoryTabs_connect);
const ESTopXOverviewPage = connect((state)=> appESConnector(state))(ESTopXOverviewPage_connect);
const ESListView = connect((state)=> appESConnector(state))(ESListView_connect);
export const AppESPage = connect((state)=> appESConnector(state))(AppESPage_connect);
export const AppDBPage = connect((state)=> appESConnector(state))(AppDBPage_connect);
export const AppAWSPage = connect((state)=> appESConnector(state))(AppAWSPage_connect);