import * as React from "react";
import {IDataPoint} from "../views/metricDetailView";
import {responseTimeDisplay, throughputDisplay} from "../metricUtils";
import {LineChart} from "./lineChart";
import {DSTimelineChart, IChartTimeSeries} from "./dsTimelineChart";
import {Dispatch} from "redux";

export class ResponseTimeLineChart extends LineChart<{
	dataPoints: IDataPoint[];
	dispatch   :Dispatch<any>;
	seriesName? :string;
},{}>
{
	protected getSeries():IChartTimeSeries[]
	{
		const seriesData = DSTimelineChart.convertDataPoints(this.props.dataPoints);
		return [{
			name: this.props.seriesName? this.props.seriesName: "Response Time",
			data: seriesData
		}];
	}
	protected getValueDisplayFunc():(number)=>string
	{
		return responseTimeDisplay;
	}

	protected getCustomConfig()
	{
		return {
			plotOptions: {
				series: {
					color: '#93dd0f'
				}
			}
		};
	}
}


export class ThpLineChart extends LineChart<{
	dataPoints: IDataPoint[];
	dispatch   :Dispatch<any>;
	seriesName? :string;
},{}>
{
	protected getSeries():IChartTimeSeries[]
	{
		const seriesData = DSTimelineChart.convertDataPoints(this.props.dataPoints);
		return [{
			name: this.props.seriesName? this.props.seriesName: "Throughput",
			data: seriesData
		}];
	}
	protected getValueDisplayFunc():(number)=>string
	{
		return throughputDisplay;
	}

	protected getCustomConfig()
	{
		return {

		};
	}
}
