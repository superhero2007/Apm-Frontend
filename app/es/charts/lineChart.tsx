import * as React from "react";
import {DSTimelineChart, IChartTimeSeries, IDispatchable} from "./dsTimelineChart";
import {AbstractTooltip, PointTooltip} from "./tooltips/sharedTooltip";
import {Dispatch} from "redux";
import {IDataPoint} from "../views/metricDetailView";


export abstract class LineChart<P extends IDispatchable,S> extends DSTimelineChart<P,S>
{
	protected  chartType():string
	{
		return 'line';
	}

	protected getTooltipGenerator(valueDisplayFunc: (number)=>string): AbstractTooltip
	{
		return new PointTooltip(valueDisplayFunc);
	}

}


export class SingleLineChart extends LineChart<{
	dataPoints: IDataPoint[];
	dispatch   :Dispatch<any>;
	seriesName: string;
	valueDisplayFunc: (number) => string;
},{}>
{
	protected getValueDisplayFunc(): (number) => string
	{
		return this.props.valueDisplayFunc;
	}

	protected getCustomConfig()
	{
		return {};
	}

	protected getSeries(): IChartTimeSeries[]
	{
		const seriesData = DSTimelineChart.convertDataPoints(this.props.dataPoints);
		return [{
			name: this.props.seriesName,
			data: seriesData
		}];
	}

}