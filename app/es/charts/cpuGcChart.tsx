
import * as React from "react";
import {StackedAreaChart} from "./stackedAreaChart";
import {IDataPoint, ISeriesData} from "../views/metricDetailView";
import {cpuPctDisplay, dataPointsDifference} from "../metricUtils";

class CpuGcChartInternal extends StackedAreaChart
{
	getCustomConfig()
	{
		return {
			colors: ['#44bb55', "#D64700"]
		};
	}

}

export class CpuGcChart extends React.Component<{
	cpuPts: IDataPoint[]; //inclusive of gc values too. we will subtract internally.
	gcPts: IDataPoint[];
	dispatch;
}, {}>
{
	render()
	{
		var cpuWithoutGC:IDataPoint[] = dataPointsDifference(this.props.cpuPts, this.props.gcPts);

		var cpu:ISeriesData = {seriesName: "CPU", dataPoints: cpuWithoutGC};
		var gc:ISeriesData = {seriesName: "GC", dataPoints: this.props.gcPts};

		return <CpuGcChartInternal seriesList={[cpu, gc]} dispatch={this.props.dispatch} displayFunc={cpuPctDisplay}/>;
	}
}

export class CpuChart extends React.Component<{
	cpuPts: IDataPoint[];
	dispatch;
}, {}>
{
	render()
	{
		var cpu:ISeriesData = {seriesName: "CPU", dataPoints: this.props.cpuPts};

		return <CpuGcChartInternal seriesList={[cpu]} dispatch={this.props.dispatch} displayFunc={cpuPctDisplay}/>;
	}
}