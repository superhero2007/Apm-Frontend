import * as React from "react";
import * as PropTypes from "prop-types";
import {ESFiltersPage} from "./esFiltersPage";
import {action_initESDetail, action_updateSortType, IRR_ESDETAIL, MetricCategory} from "../reducers/esReducer";
import {JSONEncoder} from "./routeobj/jsonEncoder";
import {TimeRange} from "./filters/timerange";
import {AppFilters_defaultAppFilerState} from "./filters/appFilters";
import {MetricListView} from "./views/metricListView";
import {MetricDetailView} from "./views/metricDetailView";
import {Col, Row} from "react-bootstrap";
import {MetricSortSelect} from "./widgets/metricSortSelect";
import {MetricSortType} from "./widgets/sortedMetricList";
import {RowCol} from "./../widgets/rowCol";
import {accountStatus} from "../accountStatus";
import {NeedPro} from "../widgets/needPro";
import {Tabs} from "./views/tab";
import {CategoryOverviewPage} from "./views/categoryOverviewPage";
import {CategoryTabs} from "./categoryTabs";
import {DSTabType} from "./widgets/dsTabs";
import {CatTab} from "./widgets/catTabs";
import {IESViewProps} from "./esViews";


export interface IRoutableESProps extends IESViewProps
{
	filterJSON: string;
}

export abstract class AbstractContainerPage extends React.Component<IRoutableESProps,{}>
{
	static contextTypes:any = {
		router: PropTypes.any.isRequired
	};

	context:any;


	static getDefaultRouteObj(metricCategory: MetricCategory): string
	{
		const iSerTimeRange = TimeRange.defaultRange.serialize();
		const appFilterState = AppFilters_defaultAppFilerState();
		const tab = Tabs.getDefaultTabState(DSTabType.overview);
		const esDetail: IRR_ESDETAIL = {
			timeRange: iSerTimeRange, sortType: MetricSortType.TIME_SPENT,
			appFilter: appFilterState, selectedMetric: null, selectedMetricRealName: null, tab: tab, metricCategory: metricCategory,
			catTab: CatTab.overview
		};
		return JSONEncoder.encode(esDetail);
	}

	constructor(props, context)
	{
		super(props, context);
	}

	componentWillMount()
	{
		const filterJSON = this.props.filterJSON;
		var esDetail:IRR_ESDETAIL = JSONEncoder.decode(filterJSON);

		this.props.dispatch(action_initESDetail(esDetail));
	}

	componentWillReceiveProps(nextProps:IRoutableESProps)
	{
		const nextEsDetail = nextProps.esDetail;
		const curESDetail = this.props.esDetail;

		const encodedNewJSON = JSONEncoder.encode(nextEsDetail);
		if(encodedNewJSON !== JSONEncoder.encode(curESDetail))
		{
			this.onStoreChange(encodedNewJSON);
		}
	}

	private onSelectSort(sort:MetricSortType)
	{
		this.props.dispatch(action_updateSortType(sort));
	}

	protected abstract pageName(): string;
	protected abstract onStoreChange(encodedJSON: string);

	protected doRender()
	{
		const detail = this.props.esDetail;

		let detailView = null;
		if(detail.selectedMetric && detail.catTab === CatTab.metric)
		{
			detailView = <MetricDetailView/>;
		}
		else
			detailView = <CategoryOverviewPage/>;

		return <div>
			<ESFiltersPage/>
			<Row>
				<Col xsOffset={6}>
					<CategoryTabs/>
				</Col>
			</Row>
			<Row>
				<Col xs={4}>
					<RowCol className="bottom2">
						<MetricSortSelect allowSortByError={false}
						                  onSelection={this.onSelectSort.bind(this)} selected={this.props.esDetail.sortType}/>
					</RowCol>
					<RowCol>
						<MetricListView/>
					</RowCol>
				</Col>
				<Col xs={8}>
					{detailView}
				</Col>
			</Row>
		</div>;
	}
	
	render()
	{
		if(!accountStatus.isPro)
			return <NeedPro pageName={this.pageName()} />;

		return this.doRender();
	}

}
