import {LineChart} from "./lineChart";
import {IDataPoint} from "../views/metricDetailView";
import {DSTimelineChart, IChartTimeSeries} from "./dsTimelineChart";
import {errRateDisplay} from "../metricUtils";
import {Dispatch} from "redux";


export class ErrPctLineChart extends LineChart<
	{
		dataPoints: IDataPoint[];
		dispatch   :Dispatch<any>;
	},{}>
{
	protected getValueDisplayFunc():(number)=>string
	{
		return errRateDisplay;
	}

	protected getCustomConfig()
	{
		return {
			colors: ['#CD2525']
		};
	}

	protected getSeries():IChartTimeSeries[]
	{
		const seriesData = DSTimelineChart.convertDataPoints(this.props.dataPoints);
		return [{
			name: "Error Rate",
			data: seriesData
		}];
	}

}