import {DSTimelineChart, IChartTimeSeries} from "./dsTimelineChart";
import {AbstractTooltip, ITooltipSharedPoint, SharedTooltip} from "./tooltips/sharedTooltip";
import {dataPointsDifference, responseTimeDisplay} from "../metricUtils";
import {IDataPoint} from "../views/metricDetailView";
import {Dispatch} from "redux";

export class GCPauseChart extends DSTimelineChart<{
	totalTimeGCPts: IDataPoint[];
	maxTimeGCPts: IDataPoint[];
	gcCountPts: IDataPoint[];
	dispatch:   Dispatch<any>;
},{}>
{
	protected getValueDisplayFunc():(number)=>string
	{
		return responseTimeDisplay;
	}

	protected getCustomConfig()
	{
		return {
			yAxis: [ {
				min: 0,
				labels: {
					formatter: function () {
						return responseTimeDisplay(this.value);
					}
				},
				title: {
					text: null
				}
			},
				{
					min: 0,
					opposite: true,
					title: {
						text: null
					}
				}
			],
			plotOptions: {
				series: {
					stacking: "normal"
				}
			}
		};
	}

	protected chartType():string
	{
		return undefined;
	}

	protected getSeries():IChartTimeSeries[]
	{
		const gcTotalWOMax = dataPointsDifference(this.props.totalTimeGCPts, this.props.maxTimeGCPts);

		const total: IChartTimeSeries = {
			name: "Total time spent in GC",
			data: DSTimelineChart.convertDataPoints(gcTotalWOMax),
			yAxis: 0,
			index: 0,
			type: 'column'
		};

		const max: IChartTimeSeries = {
			name: "Longest Pause",
			data: DSTimelineChart.convertDataPoints(this.props.maxTimeGCPts),
			yAxis: 0,
			index: 1,
			type: 'column'
		};

		const count: IChartTimeSeries = {
			name: "Count",
			data: DSTimelineChart.convertDataPoints(this.props.gcCountPts),
			yAxis: 1,
			index: 2,
			type: 'line'
		};

		return [total, max, count];
	}

	protected getTooltipGenerator(valueDisplayFunc:(number)=>string):AbstractTooltip
	{
		return new GCPauseTooltip(valueDisplayFunc);
	}

}


class GCPauseTooltip extends SharedTooltip
{
	constructor(valDisplay:(number)=>string, showTotal=true)
	{
		super(valDisplay, showTotal);
	}

	generateStr(point:ITooltipSharedPoint): string
	{
		const tPt = this.getPointByName(point,"Total time spent in GC");
		const lPt = this.getPointByName(point,"Longest Pause");
		const cPt = this.getPointByName(point,"Count");

		if(tPt && lPt && cPt)
		{
			const maxPause = lPt.y;
			const totalPause = tPt.y + maxPause;
			const count = cPt.y;

			let str = "";

			str += `<br/>Total time spent in GC: <b>${responseTimeDisplay(totalPause)}</b>`;
			str += `<br/>Longest Pause: <b>${responseTimeDisplay(maxPause)}</b>`;
			str += `<br/>GC Count: <b>${count}</b>`;

			return SharedTooltip.customTooltipHeader(point.x, str);
		}
		else {
			return this.barebonesTooltip(point);
		}
	}
}