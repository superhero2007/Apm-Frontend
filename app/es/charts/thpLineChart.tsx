import * as React from 'react';
import {throughputDisplay} from "../metricUtils";
import {LineChart} from "./lineChart";
import {Dispatch} from "redux";
import {IMetricStats} from "../views/metricDetailView";
import {DSTimelineChart, IChartTimeSeries} from "./dsTimelineChart";

export class ThroughputLineChart extends LineChart<{
	stats: IMetricStats;
	dispatch   :Dispatch<any>;
},{}>
{
	protected getSeries():IChartTimeSeries[]
	{
		const seriesData = DSTimelineChart.convertDataPoints(this.props.stats.throughputs);
		return [{
			name: "RPM",
			data: seriesData
		}];
	}

	protected getValueDisplayFunc():(number)=>string
	{
		return throughputDisplay;
	}

	protected getCustomConfig()
	{
		return {};
	}
}
