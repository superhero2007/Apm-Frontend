import * as React from "react";
import {DSTimelineChart, IChartTimeSeries} from "./dsTimelineChart";
import {ISeriesData} from "../views/metricDetailView";
import {AbstractTooltip, SharedTooltip} from "./tooltips/sharedTooltip";
import {cpuPctDisplay, megaByteDisplay} from "../metricUtils";
import {Dispatch} from "redux";


export class MultiLineChart extends DSTimelineChart<{
	seriesList: ISeriesData[];
	dispatch:   Dispatch<any>;
	valueDisplayFunc?: (number)=>string;
}, {}>
{
	protected getValueDisplayFunc(): (number)=>string
	{
		return this.props.valueDisplayFunc;
	}

	protected getCustomConfig()
	{
		return {
			plotOptions: {
				series: {
					stacking: null
				}
			}
		};
	}

	protected getTooltipGenerator(valueDisplayFunc: (number)=>string): AbstractTooltip
	{
		return new SharedTooltip(valueDisplayFunc, false);
	}
	
	protected chartType():string
	{
		return 'line';
	}

	protected getSeries():IChartTimeSeries[]
	{
		return this.props.seriesList.map(s => ({
			name: s.seriesName,
			data: DSTimelineChart.convertDataPoints(s.dataPoints)
		}));
	}

}

export class HeapTimeMultiLineChart extends MultiLineChart
{
	protected getValueDisplayFunc():(number)=>string
	{
		return megaByteDisplay;
	}
}

export class CPUPercentageMultiLineChart extends MultiLineChart
{
	protected getValueDisplayFunc():(number)=>string
	{
		return cpuPctDisplay;
	}
}