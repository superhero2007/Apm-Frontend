import * as React from "react";
import {connect} from "react-redux";
import {ISeriesData} from "./metricDetailView";
import {ResponseTimeMultiLineChart} from "../charts/respTimeMultiLineChart";
import {ThroughputMultiLineChart} from "../charts/thpMultiLineChart";
import {IMetricOverview} from "./metricOverview";
import {IDSTabState} from "./tab";
import {AbstractMetricChartView} from "./abstactMetricChartView";
import {DSTabType} from "../widgets/dsTabs";
import {esDetailConnector} from "../../reduxConnectors";


export interface IStatsByMetric
{
	responseTimes:  ISeriesData[];
	throughputs:    ISeriesData[];
	errRates:       ISeriesData[];
}

interface IState {
	perApp: IStatsByMetric;
	overview: IMetricOverview;
}

export function PerAppMetricView_getDefaultTabState(): IDSTabState
{
	return {type: DSTabType.perapp};
}

class PerAppMetricView_connect extends AbstractMetricChartView<IState>
{

	protected initialState():IState
	{
		return {perApp: null, overview: null};
	}

	protected getMetricFetchURLs(): string[]
	{
		return ["/xapp/es/perApp", "/xapp/es/overview"];
	}

	protected getStateFromPostResponse(reponseData:any):IState
	{
		return {perApp: reponseData[0], overview: reponseData[1]};
	}

	protected renderResponseTimeChart(data:IState)
	{
		return <ResponseTimeMultiLineChart seriesList={data.perApp.responseTimes} dispatch={this.props.dispatch}/>;
	}

	protected renderThpChart(data:IState)
	{
		return <ThroughputMultiLineChart   seriesList={data.perApp.throughputs} dispatch={this.props.dispatch}/>;
	}

	protected renderContent(data:IState):any
	{
		return this.renderMetricCharts(data, data.overview);
	}
}

export const PerAppMetricView = connect((state)=> esDetailConnector(state))(PerAppMetricView_connect);
