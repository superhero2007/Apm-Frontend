import * as React from "react";
import {DSTimelineChart, IChartTimeSeries} from "./dsTimelineChart";
import {AbstractTooltip, PointTooltip} from "./tooltips/sharedTooltip";
import {IDataPoint} from "../views/metricDetailView";
import {Dispatch} from "redux";

export abstract class DeviationChart extends DSTimelineChart<{
	stats: IDataPoint[];
	dispatch   :Dispatch<any>;
	avg:    number;
},{}>
{
	protected  chartType():string
	{
		return 'area';
	}

	protected getTooltipGenerator(valueDisplayFunc: (number)=>string): AbstractTooltip
	{
		return new PointTooltip(valueDisplayFunc);
	}

	protected getSeries():IChartTimeSeries[]
	{
		const seriesData = DSTimelineChart.convertDataPoints(this.props.stats);
		const name = this.getSeriesName();
		return [{
			name: name,
			data: seriesData,
			negativeColor: '#93dd0f'
		}];
	}

	protected getCustomConfig()
	{
		//cannot have 'min: 0' here since then the chart no longer remains 'relative' thereby becoming useless

		const avgValue = this.props.avg;
		return {
			plotOptions: {
				series: {
					color: '#0000FF',
					threshold: avgValue,
					stacking: null
				}
			},
			legend: {
				enabled: false
			},
			yAxis: {

				plotLines: [{
					color: '#0000FF',
					width: 2,
					value: avgValue
				}]
			}
		};
	}

	protected abstract getValueDisplayFunc():(number)=>string;
	protected abstract getSeriesName(): string;
}
