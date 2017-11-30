import * as React from "react";
import {IDataPoint, IMetricStats, ISeriesData} from "./metricDetailView";
import {connect} from "react-redux";
import {RowCol} from "../../widgets/rowCol";
import {ResponseTimeLineChart} from "../charts/resptimeLineChart";
import {DeviationResponseTimeChart} from "../charts/deviationRespTimeChart";
import {DeviationThpChart} from "../charts/deviationThpChart";
import {PctBarChart} from "../charts/pctBarChart";
import {StackedAreaChart} from "../charts/stackedAreaChart";
import {ChartTitle} from "../charts/chartTitle";
import {IDSTabState} from "./tab";
import {action_updateDetailTab} from "../../reducers/esReducer";
import "./tabPills.css";
import {AbstractMetricChartView} from "./abstactMetricChartView";
import {DSTabs, DSTabType, TabStyle} from "../widgets/dsTabs";
import {esDetailConnector} from "../../reduxConnectors";

export interface IMetricOverview
{
	name: string;
	avgResponseTime: number;
	avgThroughput: number;
	totalThroughput:    number;
	throughputs: IDataPoint[];
	responseTimes: IDataPoint[];
}

export interface IMetricDetail extends IMetricStats, IMetricOverview {
	appThpSeries    :ISeriesData[];
}

interface ICallerAppData {
	name    :string;
	value   :number;
}

interface IMetricCallers {
	list: ICallerAppData[];
}


interface IOverviewTab extends IDSTabState
{
	chartType: DSTabType
}

interface IState
{
	metricDetail:IMetricDetail;
	callers :IMetricCallers;
}


export function MetricOverview_getDefaultTabState(): IOverviewTab
{
	return {chartType: DSTabType.normal, type: DSTabType.overview};
}

class MetricOverview_connect extends AbstractMetricChartView<IState>
{
	protected initialState():IState
	{
		return {metricDetail: null, callers: null};
	}

	protected getMetricFetchURLs(): string[]
	{
		return ["/xapp/es/detail", "/xapp/es/callers"];
	}

	protected getStateFromPostResponse(reponseData:any):IState
	{
		return {metricDetail: reponseData[0], callers: reponseData[1]};
	}

	protected renderResponseTimeChart(data:IState)
	{
		const activeChartTypeTab = this.getActiveChartTypeTab();

		switch (activeChartTypeTab)
		{
			case DSTabType.normal:
				return <ResponseTimeLineChart dataPoints={data.metricDetail.avgResponseTimes} dispatch={this.props.dispatch}/>;

			case DSTabType.relative:
				return (
					<div className="bottom-pad1">
						<DeviationResponseTimeChart stats={data.metricDetail.avgResponseTimes} dispatch={this.props.dispatch} avg={data.metricDetail.avgResponseTime}/>
					</div>
				);

			default:
				throw "invalid tab";
		}
	}

	protected renderThpChart(data:IState)
	{
		const activeChartTypeTab = this.getActiveChartTypeTab();

		switch (activeChartTypeTab)
		{
			case DSTabType.normal:
				return <StackedAreaChart seriesList={data.metricDetail.appThpSeries} dispatch={this.props.dispatch}/>;

			case DSTabType.relative:
				return (
					<div className="bottom-pad1">
						<DeviationThpChart stats={data.metricDetail.throughputs} dispatch={this.props.dispatch} avg={data.metricDetail.avgThroughput}/>
					</div>
				);

			default:
				throw "invalid tab";
		}
	}

	private onSelectTab(tab:DSTabType)
	{
		const data = {chartType: tab, type: DSTabType.overview};
		this.props.dispatch(action_updateDetailTab(data));
	}

	protected renderContent(data:IState):any
	{
		const activeTab = this.getActiveChartTypeTab();
		return (
			<RowCol>
				<div className="bottom2">
					<DSTabs activeTab={activeTab} tabs={[DSTabType.normal, DSTabType.relative]} onSelect={this.onSelectTab.bind(this)} style={TabStyle.pills}/>
				</div>

				{this.renderMetricCharts(data,data.metricDetail)}
				<RowCol>
					<ChartTitle chartName="Time Consumption By App"/>
					<PctBarChart stats={data.callers.list}/>
				</RowCol>
			</RowCol>
		);

	}

	private getActiveChartTypeTab()
	{
		const tabState = this.props.esDetail.tab as IOverviewTab;
		return tabState.chartType;
	}
}

export const MetricOverview = connect((state)=> esDetailConnector(state))(MetricOverview_connect);
