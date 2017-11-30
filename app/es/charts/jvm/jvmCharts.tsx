import {megaByteDisplay, throughputUnit} from "../../metricUtils";
import {DSTimelineChart, IChartTimeSeries} from "../dsTimelineChart";
import {IDataPoint, ISeriesData} from "../../views/metricDetailView";
import {LineChart} from "../lineChart";
import {StackedAreaChart} from "../stackedAreaChart";
import * as React from "react";
import {MultiLineChart} from "../multiLineChart";
import {AbstractTooltip, ITooltipSharedPoint, SharedTooltip} from "../tooltips/sharedTooltip";
import {Dispatch} from "redux";

export class ClassCountChart extends LineChart<{
	dataPoints: IDataPoint[];
	dispatch   :Dispatch<any>;
},{}>
{
	protected getSeries():IChartTimeSeries[]
	{
		const seriesData = DSTimelineChart.convertDataPoints(this.props.dataPoints);
		return [{
			name: "Class Count",
			data: seriesData
		}];
	}
	protected getValueDisplayFunc():(number)=>string
	{
		return throughputUnit;
	}

	protected getCustomConfig()
	{
		return {

		};
	}
}


class ThreadCountChartInternal extends StackedAreaChart
{
	getCustomConfig()
	{
		return {
			colors: ['#b598c4', "#ffbb66"]
		};
	}
}

export class ThreadCountChart extends React.Component<{
	daemonPts: IDataPoint[];
	nonDaemonPts: IDataPoint[];
	dispatch;
},{}>
{
	render()
	{

		var daemon:ISeriesData = {seriesName: "Daemon Threads", dataPoints: this.props.daemonPts};
		var nonDaemon:ISeriesData = {seriesName: "Non Daemon Threads", dataPoints: this.props.nonDaemonPts};

		return <ThreadCountChartInternal seriesList={[daemon, nonDaemon]} dispatch={this.props.dispatch} displayFunc={throughputUnit}/>;
	}

}

export class MemPoolChart extends React.Component<{
	maxPts: IDataPoint[];
	usedPts: IDataPoint[];
	committedPts: IDataPoint[];
	dispatch;
}, {}>
{
	render()
	{

		const used:ISeriesData = {seriesName: "Used", dataPoints: this.props.usedPts};
		const committed:ISeriesData = {seriesName: "Committed", dataPoints: this.props.committedPts};

		let seriesList = [used, committed];

		if(this.props.maxPts && this.props.maxPts.length > 0)
		{
			const max:ISeriesData = {seriesName: "Max", dataPoints: this.props.maxPts};
			seriesList.push(max);
		}

		return <MultiLineChart dispatch={this.props.dispatch} valueDisplayFunc={megaByteDisplay} seriesList={seriesList} />;
	}
}

export class BufferPoolChart extends DSTimelineChart<{
	capacityPts: IDataPoint[];
	usedPts: IDataPoint[];
	countPts: IDataPoint[];
	dispatch;
}, {}>
{
	protected getValueDisplayFunc(): (number)=>string
	{
		return megaByteDisplay;
	}

	protected getCustomConfig()
	{
		return {
			yAxis: [ {
				min: 0,
				labels: {
					formatter: function () {
						return throughputUnit(this.value);
					}
				},
				title: {
					text: null
				}
			},
			{
				opposite: true,
				title: {
					text: null
				},
				labels: {
					formatter: function () {
						return megaByteDisplay(this.value);
					}
				}
			}
			],
			plotOptions: {
				series: {
					stacking: null
				}
			}
		};
	}

	protected chartType(): string
	{
		return undefined;
	}

	protected getSeries(): IChartTimeSeries[]
	{
		const count:IChartTimeSeries = {
			name: "Count",
			data: DSTimelineChart.convertDataPoints(this.props.countPts),
			type: 'column',
			yAxis: 0,
			index: 0
		};
		const used:IChartTimeSeries = {
			name: "Used",
			data: DSTimelineChart.convertDataPoints(this.props.usedPts),
			type: 'line',
			yAxis: 1,
			index: 1
		};
		const capacity:IChartTimeSeries = {
			name: "Capacity",
			data: DSTimelineChart.convertDataPoints(this.props.capacityPts),
			type: 'line',
			yAxis: 1,
			index: 2
		};


		return [count, used, capacity];
	}

	protected getTooltipGenerator(valueDisplayFunc: (number)=>string): AbstractTooltip
	{
		return new BufferPoolTooltip(valueDisplayFunc);
	}
}



class BufferPoolTooltip extends SharedTooltip
{
	constructor(valDisplay:(number)=>string)
	{
		super(valDisplay, false);
	}

	generateStr(point:ITooltipSharedPoint): string
	{
		const countPt = this.getPointByName(point,"Count");
		const usedPt = this.getPointByName(point,"Used");
		const capacityPt = this.getPointByName(point,"Capacity");

		if(usedPt && capacityPt && countPt)
		{
			const capacity = capacityPt.y;
			const used = usedPt.y;
			const count = countPt.y;

			let str = "";

			str += `<br/>Count: <b>${throughputUnit(count)}</b>`;
			str += `<br/>Used: <b>${megaByteDisplay(used)}</b>`;
			str += `<br/>Capacity: <b>${megaByteDisplay(capacity)}</b>`;

			return SharedTooltip.customTooltipHeader(point.x, str);
		}
		else {
			return this.barebonesTooltip(point);
		}
	}
}