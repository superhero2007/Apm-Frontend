import * as React from "react";
import * as _ from "lodash";
import {IAppPageProps} from "./applicationPage";
import {action_updateSelectedTxn, IRR_App_Txn} from "../../reducers/appReducer";
import {IStore} from "../../reduxSetup";
import {connect} from "react-redux";
import {AppFiltersPage, IAppJVMFilterState} from "./appFiltersPage";
import {MetricSortSelect} from "../../es/widgets/metricSortSelect";
import {ISortedListItem, MetricSortType, SortedMetricList} from "../../es/widgets/sortedMetricList";
import {action_updateSortType} from "../../reducers/esReducer";
import {LoadableComponent} from "../../widgets/loadableComponent";
import {QueryRequests} from "../../es/queryRequests";
import {Http} from "../../http";
import {ChangeDetectionAppRR} from "../../es/pinned/changeDetectRRPinned";
import {Col, Row} from "react-bootstrap";
import {RowCol} from "../../widgets/rowCol";
import {TxnDetailView, TxnOverviewView_getDefaultTabState} from "./txnDetail";
import {DSTabType} from "../../es/widgets/dsTabs";
import {AmplitudeAnalytics} from "../../analytics";
import {CatTab} from "../../es/widgets/catTabs";
import {appTxnConnector} from "../../reduxConnectors";

export interface IAppTxnPageProps extends IAppPageProps
{
	appTxn?: IRR_App_Txn;
}

export function App_TxnPage_getDefaultPageState(): IRR_App_Txn
{
	return {sortType: MetricSortType.TIME_SPENT, txn: null, txnRealName: null,
		tab:{
			type: DSTabType.overview,
			state: TxnOverviewView_getDefaultTabState()
		}, catTab: CatTab.overview
	};
}

class App_TxnPage_connect extends AppFiltersPage<IAppTxnPageProps>
{
	constructor(props, context)
	{
		super(props, context);
		AmplitudeAnalytics.track("App - Txn Page");
	}

	private onSelectSort(sort:MetricSortType)
	{
		this.props.dispatch(action_updateSortType(sort));
	}

	protected doRender(data: IAppJVMFilterState): any
	{
		return (
			<div>
				<Row>
					<Col xs={4}>
						<RowCol className="bottom2">
							<MetricSortSelect allowSortByError={true}
						                  onSelection={this.onSelectSort.bind(this)} selected={this.props.appTxn.sortType}/>
						</RowCol>
						<RowCol>
							<TxnListView/>
						</RowCol>
					</Col>
					<Col xs={8}>
						<RowCol>
							<TxnDetailView/>
						</RowCol>
					</Col>
				</Row>
			</div>
		);
	}
}


interface ITxnListViewState
{
	listItems   :ISortedListItem[];
}


class TxnListView_connect extends LoadableComponent<IAppTxnPageProps,ITxnListViewState>
{
	protected initialState(): ITxnListViewState
	{
		return {listItems: []};
	}

	protected getStateFromPostResponse(responseData: any): ITxnListViewState
	{
		return {listItems: responseData[0]};
	}

	protected getHttpRequests(props:IAppTxnPageProps) :JQueryXHR[]
	{
		const body = QueryRequests.postBody_App_Txn_Filter(props.app, props.appInfo, props.appTxn);

		return [Http.postJSON("/xapp/es/list", body)];
	}

	componentWillReceiveProps(nextProps:IAppTxnPageProps)
	{
		const newRR = nextProps.app;
		const oldRR = this.props.app;

		if(ChangeDetectionAppRR.timeRangeAndJVM(oldRR, newRR) || ChangeDetectionAppRR.sort(this.props.appTxn, nextProps.appTxn))
		{
			this.reloadData(nextProps);
		}
	}

	private onSelectMetric(it:ISortedListItem)
	{
		this.props.dispatch(action_updateSelectedTxn(it));
	}

	protected renderContent(data: ITxnListViewState): any
	{
		if(_.isEmpty(data.listItems))
		{
			return <div>No Transactions in this time range</div>;
		}

		const selectedTxn = this.props.appTxn.txn;
		const selection = data.listItems.find(it => it.name === selectedTxn);

		return (
			<div>
				<SortedMetricList selectedItem={selection}
				                  listItems={data.listItems} sortType={this.props.appTxn.sortType}  onSelectMetric={this.onSelectMetric.bind(this)} />
			</div>
		);
	}

}

const TxnListView = connect((state)=> appTxnConnector(state))(TxnListView_connect);
export const App_TxnPage = connect((state)=> appTxnConnector(state))(App_TxnPage_connect);