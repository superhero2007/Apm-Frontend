import * as React from "react";
import * as _ from "lodash";
import {IAppPageProps} from "./applicationPage";
import {IRR_App_Err, action_updateSelectedERR, action_appERR_updateDetailTab} from "../../reducers/appReducer";
import {connect} from "react-redux";
import {IStore} from "../../reduxSetup";
import {AppFiltersPage, IAppJVMFilterState} from "./appFiltersPage";
import {AmplitudeAnalytics} from "../../analytics";
import {Row, Col} from "react-bootstrap";
import {MetricSortType, ISortedListItem, SortedMetricList} from "../../es/widgets/sortedMetricList";
import {ChangeDetectionAppRR} from "../../es/pinned/changeDetectRRPinned";
import {Http} from "../../http";
import {LoadableComponent} from "../../widgets/loadableComponent";
import {QueryRequests} from "../../es/queryRequests";
import {ISeriesData} from "../../es/views/metricDetailView";
import {StackedAreaChart} from "../../es/charts/stackedAreaChart";
import {epmDisplay} from "../../es/metricUtils";
import {ErrPctLineChart} from "../../es/charts/errPctLineChart";
import {CatTab, CategoryTabsWidget} from "../../es/widgets/catTabs";
import {MetricCategory, updateObj} from "../../reducers/esReducer";
import {RowCol} from "../../widgets/rowCol";
import {DSTable} from "../../widgets/dsTable";
import {ErrTraceViewer} from "../../es/err/errTraceViewer";
import {IAppIdName} from "../../es/err/errTrendsView";
import {IDSTabView, DSTabViewManager, DSTabViewInfo, DSTabType, DSTabs, TabStyle} from "../../es/widgets/dsTabs";
import {MetricType} from "../metricStructs";
import {ErrRateMultiLineChart, ErrCountMultiLineChart} from "../../es/charts/ErrRateMultiLineChart";
import {ChartTitle} from "../../es/charts/chartTitle";
import {accountStatus} from "../../accountStatus";
import {NeedPro} from "../../widgets/needPro";
import {appErrorConnector, appErrorConnectorWithProps} from "../../reduxConnectors";

export interface IAppErrPageProps extends IAppPageProps
{
	appErr?: IRR_App_Err;
}


export function App_ErrPage_getDefaultPageState(): IRR_App_Err
{
	return { metric: null,
		metricRealName: null,
		catTab: CatTab.overview,
		tab: {
				type: DSTabType.overview,
				state: null
			}
		};
}

class App_ErrPage_connect extends AppFiltersPage<IAppErrPageProps>
{
	constructor(props, context)
	{
		super(props, context);
		AmplitudeAnalytics.track("App - Err Page");
	}

	protected renderContent(data: IAppJVMFilterState): any
	{
		if(!accountStatus.isPro)
		{
			return <NeedPro pageName={"Errors"}/>;
		}
		return super.renderContent(data);
	}

	protected doRender(data: IAppJVMFilterState): any
	{
		const appES = this.props.appErr;

		let detailView;
		if(appES.metric && appES.catTab === CatTab.metric)
		{
			detailView = <ErrDetailPage/>;
		}
		else
		{
			detailView = <AppErrOverviewPage/>;
		}
		return (
			<div>
				<Row className = "bottom1">
					<Col xsOffset={6}>
						<ErrCategoryTabs/>
					</Col>
				</Row>
				<Row>
					<Col xs={4}>
						<ErrListView/>
					</Col>
					<Col xs={8}>
						{detailView}
					</Col>
				</Row>
			</div>
		);
	}
}


class ErrCategoryTabs_connect extends React.Component<IAppErrPageProps,{}>
{
	render()
	{
		const appES = this.props.appErr;

		return <CategoryTabsWidget activeTab={appES.catTab} selectedMetric={appES.metric} dispatch={this.props.dispatch} metricCategory={MetricCategory.Exception}/>;
	}
}



interface IErrListViewState
{
	listItems   :ISortedListItem[];
}


class ErrListView_connect extends LoadableComponent<IAppErrPageProps,IErrListViewState>
{
	protected initialState(): IErrListViewState
	{
		return {listItems: []};
	}

	protected getStateFromPostResponse(responseData: any): IErrListViewState
	{
		return {listItems: responseData[0]};
	}

	protected getHttpRequests(props:IAppErrPageProps) :JQueryXHR[]
	{
		const body = QueryRequests.postBody_App_Err_Filter(props.app, props.appInfo, props.appErr);

		return [Http.postJSON("/xapp/es/list", body)];
	}

	componentWillReceiveProps(nextProps:IAppErrPageProps)
	{
		const newRR = nextProps.app;
		const oldRR = this.props.app;

		if(ChangeDetectionAppRR.timeRangeAndJVM(oldRR, newRR) )
		{
			this.reloadData(nextProps);
		}
	}

	private onSelectMetric(it:ISortedListItem)
	{
		this.props.dispatch(action_updateSelectedERR(it));
	}

	protected renderContent(data: IErrListViewState): any
	{
		if(_.isEmpty(data.listItems))
		{
			return <div>No errors in this time range</div>;
		}

		const appES = this.props.appErr;
		const selectedTxn = appES.metric;
		const selection = data.listItems.find(it => it.name === selectedTxn);

		return (
			<div>
				<SortedMetricList selectedItem={selection}
				                  listItems={data.listItems} sortType={MetricSortType.TIME_SPENT}  onSelectMetric={this.onSelectMetric.bind(this)} />
			</div>
		);
	}

}


abstract class AbstractErrDetailView <P extends IAppErrPageProps, S> extends LoadableComponent<P,S>
{
	componentWillReceiveProps(nextProps:P)
	{
		const newRR = nextProps.app;
		const oldRR = this.props.app;

		if(ChangeDetectionAppRR.timeRangeAndJVM(oldRR, newRR) || ChangeDetectionAppRR.metric(this.props.appErr, nextProps.appErr))
		{
			this.reloadData(nextProps);
		}
	}


	protected getHttpRequests(props:P) :JQueryXHR[]
	{
		const body = QueryRequests.postBody_App_Err_Filter(props.app, props.appInfo, props.appErr);
		return this.getMetricFetchURLs().map(url => Http.postJSON(url, body));
	}

	protected abstract getMetricFetchURLs(): string[];
}

interface IErrOvrState
{
	top5: ISeriesData[];
	appErrRate: ISeriesData;
	txnErrRates: ISeriesData[];
}


class AppErrOverviewPage_connect extends AbstractErrDetailView<IAppErrPageProps,IErrOvrState>
{

	protected getMetricFetchURLs(): string[]
	{
		return null;
	}

	protected initialState():IErrOvrState
	{
		return {top5: [], appErrRate: null, txnErrRates: []};
	}

	protected getHttpRequests(props:IAppErrPageProps) :JQueryXHR[]
	{
		const body = QueryRequests.postBody_App_Err_Filter(props.app, props.appInfo, props.appErr);
		const body2 = updateObj(body, {
			sortType: MetricSortType[MetricSortType.ERR_PCT],
			metricType: MetricType[MetricType.TXN],
			category: MetricCategory[MetricCategory.Txn]
		});

		return [Http.postJSON("/xapp/es/err/top5", body), Http.postJSON("/xapp/es/err/rate/app", body), Http.postJSON("/xapp/es/overview/top5", body2)];
	}

	protected getStateFromPostResponse(reponseData:any):IErrOvrState
	{
		return { top5: reponseData[0], appErrRate: reponseData[1], txnErrRates: reponseData[2]};
	}

	protected renderContent(data:IErrOvrState):any
	{
		return (
			<div>
				<h3>Application Error Rate</h3>
				<ErrPctLineChart dataPoints={data.appErrRate.dataPoints}  dispatch={this.props.dispatch} />

				<h3>Top Exceptions</h3>
				<StackedAreaChart seriesList={data.top5} dispatch={this.props.dispatch} displayFunc={epmDisplay}/>

				<h3>Top Transactions by Error Rate</h3>
				<ErrRateMultiLineChart   seriesList={data.txnErrRates} dispatch={this.props.dispatch}/>
			</div>
		);
	}

}


class ErrDetailPage_connect extends React.Component<IAppErrPageProps, {}>
{
	private tabViewManager = new DSTabViewManager([
			new DSTabViewInfo(DSTabType.overview, ErrDetailOverviewPage),
			new DSTabViewInfo(DSTabType.stacktrace, ErrDetailTracePage),
	]);

	private onSelectTab(tabType:DSTabType)
	{
		const defaultState = this.tabViewManager.getViewDefaultState(tabType);
		this.props.dispatch(action_appERR_updateDetailTab({type: tabType, state: defaultState} as any));
	}


	render()
	{
		const activeTab = this.props.appErr.tab.type;
		return (
			<div>
				<RowCol className="bottom2">
					<h2>{this.props.appErr.metric}</h2>
				</RowCol>
				<hr/>
				<RowCol className="bottom2">
					<DSTabs activeTab={activeTab} tabs={this.tabViewManager.getAllTabTypes()} onSelect={this.onSelectTab.bind(this)} style={TabStyle.tabs}/>
				</RowCol>
				{this.tabViewManager.renderView(activeTab)}
			</div>
		);
	}
}

interface IErrDetailOverviewState
{
	errData: ISeriesData[];
	perJVMData:ISeriesData[];
}

class ErrDetailOverviewPage_connect extends AbstractErrDetailView<IAppErrPageProps, IErrDetailOverviewState> implements IDSTabView
{

	protected getMetricFetchURLs(): string[]
	{
		return ["/xapp/es/err/timeline/txn","/xapp/es/err/timeline/jvm"];
	}

	protected initialState(): IErrDetailOverviewState
	{
		return {errData: [], perJVMData: []};
	}

	protected getStateFromPostResponse(responseData: any): IErrDetailOverviewState
	{
		return {errData: responseData[0], perJVMData: responseData[1]};
	}

	protected renderContent(data: IErrDetailOverviewState): any
	{
		return (
			<div>
				<RowCol>
					<ChartTitle chartName="Per Transaction" bottomSpace={true}/>
					<StackedAreaChart seriesList={data.errData} dispatch={this.props.dispatch} displayFunc={epmDisplay}/>
				</RowCol>
				<RowCol>
					<ChartTitle chartName="Per JVM" bottomSpace={true}/>
					<ErrCountMultiLineChart dispatch={this.props.dispatch}  seriesList={data.perJVMData}/>
				</RowCol>
			</div>
		);
	}
}


interface IErrDetailTraceState
{
	txnList: ISortedListItem[];
	selectedTxn: ISortedListItem;
}


class ErrDetailTracePage_connect extends AbstractErrDetailView<IAppErrPageProps, IErrDetailTraceState> implements IDSTabView
{
	protected getMetricFetchURLs(): string[]
	{
		return ["/xapp/es/err/txn/list"];
	}

	protected initialState(): IErrDetailTraceState
	{
		return {txnList: [], selectedTxn: null};
	}

	protected getStateFromPostResponse(responseData: any): IErrDetailTraceState
	{
		return {txnList: responseData[0], selectedTxn: null};
	}

	private onTxnSelect(item:ISortedListItem)
	{
		this.update_myStateProps({selectedTxn: item});
	}

	private onTraceClose()
	{
		this.update_myStateProps({selectedTxn: null});
	}

	protected renderContent(data: IErrDetailTraceState): any
	{
		if(data.selectedTxn)
		{
			return (
				<div>
					<ErrTracePage onClose={this.onTraceClose.bind(this)} txnName={data.selectedTxn.realName}/>
				</div>

			);
		}
		return (
			<div>
				<RowCol>
					<h4>See Full Stacktrace samples for:</h4>
					<DSTable>
						{data.txnList.map(it => <tr key={it.realName} className="aLink" onClick={this.onTxnSelect.bind(this, it)}>
							<td>{it.name}</td>
						</tr>)}
					</DSTable>
				</RowCol>
			</div>
		);
	}
}

interface IErrTraceProps1
{
	onClose: ()=>void;
	txnName
}

type IErrTraceProps = IErrTraceProps1 & IAppErrPageProps

interface IStateErrTrace {
	data;

}

class ErrTracePage_connect extends LoadableComponent<IErrTraceProps, IStateErrTrace>
{
	protected initialState(): IStateErrTrace
	{
		return {data: null};
	}

	protected getStateFromPostResponse(responseData: any): IStateErrTrace
	{
		return {data: responseData[0]};
	}

	protected getHttpRequests(props:IErrTraceProps) :JQueryXHR[]
	{
		const body = QueryRequests.postBody_App_Err_Filter(props.app, props.appInfo, props.appErr);
		body.parentName = this.props.txnName;
		return [Http.postJSON("/xapp/es/txn/err/trace/list", body)];
	}

	protected renderContent(data: IStateErrTrace): any
	{
		const app = this.props.appInfo.app;
		const appIdName: IAppIdName = {appId: app.id, appName: app.name};

		return <ErrTraceViewer app={appIdName} data={data.data} onClose={this.props.onClose}/>;
	}
}

export const App_ErrPage = connect((state)=> appErrorConnector(state))(App_ErrPage_connect);
const ErrTracePage = connect((state, props: IErrTraceProps1)=> appErrorConnectorWithProps(state, props))(ErrTracePage_connect);
const ErrDetailTracePage = connect((state)=> appErrorConnector(state))(ErrDetailTracePage_connect);
const ErrDetailPage = connect((state)=> appErrorConnector(state))(ErrDetailPage_connect);
const AppErrOverviewPage = connect((state)=> appErrorConnector(state))(AppErrOverviewPage_connect);
const ErrListView = connect((state)=> appErrorConnector(state))(ErrListView_connect);
const ErrCategoryTabs = connect((state)=> appErrorConnector(state))(ErrCategoryTabs_connect);
const ErrDetailOverviewPage = connect((state)=> appErrorConnector(state))(ErrDetailOverviewPage_connect);