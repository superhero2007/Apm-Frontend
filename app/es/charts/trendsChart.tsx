import * as React from "react";
import {responseTimeDisplay, throughputDisplay} from "../metricUtils";
import {ColumnAndSplineChart, ICSChartSeriesData} from "./columnAndSplineChart";
import {IMetricTrendContainer} from "../widgets/metricTrends";

export class TrendsChart extends ColumnAndSplineChart<{
	trends: IMetricTrendContainer;
},{}>
{
	protected getColumnSeriesData():ICSChartSeriesData
	{
		return {
			name: "Avg Response Time",
			valueDisplayFunc: responseTimeDisplay,
			values: this.getTrendItems().map(it => it.avgTime)
		};
	}

	protected getSplineSeriesData():ICSChartSeriesData
	{
		return {
			name: "Avg Throughput",
			valueDisplayFunc: throughputDisplay,
			values: this.getTrendItems().map(it => it.avgThp)
		};
	}

	protected getXAxisCategories():string[]
	{
		const catgs = ["Last 24 hrs", "Prev 24 hrs", "Prev 7 days", "Prev 30 Days"];
		catgs.reverse();
		return catgs;
	}

	private getTrendItems()
	{
		const trends = this.props.trends;
		var trendItems = [trends.last24hrs, trends.prev24hrs, trends.prev7days, trends.prev30days];
		trendItems.reverse();

		return trendItems;
	}
}