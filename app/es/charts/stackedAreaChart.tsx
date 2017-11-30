import * as React from "react";
import {ISeriesData} from "../views/metricDetailView";
import {throughputDisplay} from "../metricUtils";
import {DSTimelineChart, IChartTimeSeries} from "./dsTimelineChart";
import {AbstractTooltip, SharedTooltip} from "./tooltips/sharedTooltip";
import {DSStandardChart} from "./dsStandardChart";
import {IDeploy} from "../../reducers/appInfoReducer";
import {Dispatch} from "redux";

export class StackedAreaChart extends DSTimelineChart<{
    seriesList: ISeriesData[];
    dispatch:   Dispatch<any>;
	displayFunc?: (number)=> string;
	deploys?:   IDeploy[];
	chartHeight? : number;
}, {}>
{
	protected getSeries():IChartTimeSeries[]
	{
		return this.props.seriesList.map(s => ({
			name: s.seriesName,
			data: DSTimelineChart.convertDataPoints(s.dataPoints)
		}));
	}
	protected chartType():string
	{
		return 'area';
	}
	
	protected getValueDisplayFunc():(number)=>string
	{
		if (this.props.displayFunc)
			return this.props.displayFunc;
		
		return throughputDisplay;
	}


	protected getChartHeight(): number
	{
		if(this.props.chartHeight)
			return this.props.chartHeight;

		return super.getChartHeight();
	}

	protected getTooltipGenerator(valueDisplayFunc: (number)=>string): AbstractTooltip
	{
		return new SharedTooltip(valueDisplayFunc);
	}
	
	getCustomConfig(): any
	{
		let plotLines;
		if(this.props.deploys)
		{
			plotLines = this.props.deploys.map(dep =>( {
				value: dep.id.deployTime*1000,
				color: 'black',
				width: 1,
				zIndex: 1
			}));
		}

		return {
			colors: DSStandardChart.defaultStackColors,
			xAxis: {
				plotLines: plotLines
			}
		};
	}
}
