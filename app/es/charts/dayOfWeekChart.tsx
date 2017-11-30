import * as React from "react";
import {responseTimeDisplay, throughputUnit} from "../metricUtils";
import {ColumnAndSplineChart, ICSChartSeriesData} from "./columnAndSplineChart";
import {ITimeOfDayContainer} from "../widgets/metricTrends";

export class DayOfWeekChart extends ColumnAndSplineChart<{
	data: ITimeOfDayContainer;
},{}>
{
	protected getColumnSeriesData():ICSChartSeriesData
	{
		return {
			name: "Avg Response Time",
			valueDisplayFunc: responseTimeDisplay,
			values: this.props.data.values.map(it => it.avgResponseTime)
		};
	}

	protected getSplineSeriesData():ICSChartSeriesData
	{
		return {
			name: "Total Calls",
			valueDisplayFunc: throughputUnit,
			values: this.props.data.values.map(it => it.totalCalls)
		};
	}

	protected getXAxisCategories():string[]
	{
		return this.props.data.values.map(it => it.time);
	}
}