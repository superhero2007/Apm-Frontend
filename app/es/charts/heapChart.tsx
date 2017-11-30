import {StackedAreaChart} from "./stackedAreaChart";
import * as React from "react";
import {IDataPoint, ISeriesData} from "../views/metricDetailView";
import {megaByteDisplay, dataPointsDifference} from "../metricUtils";
import {SharedTooltip, ITooltipSharedPoint, AbstractTooltip} from "./tooltips/sharedTooltip";

class HeapChartInternal extends StackedAreaChart
{
	getCustomConfig()
	{
		return {
			colors: ['#17607D', "#002A4A", "#D64700"]
		};
	}

	protected getTooltipGenerator(valueDisplayFunc: (number)=>string): AbstractTooltip
	{
		return new HeapChartTooltip(valueDisplayFunc);
	}
}

export class HeapChart extends React.Component<{
	usedPts: IDataPoint[]; //inclusive of gc values too. we will subtract internally.
	committedPts: IDataPoint[];
	maxPts: IDataPoint[];
	dispatch;
}, {}>
{
	render()
	{

		const commitWOUsed = dataPointsDifference(this.props.committedPts, this.props.usedPts);
		const maxWOCommit = dataPointsDifference(this.props.maxPts, this.props.committedPts);

		const used:ISeriesData = {seriesName: "Used Heap", dataPoints: this.props.usedPts};
		const commit:ISeriesData = {seriesName: "Remaining Committed Heap", dataPoints: commitWOUsed};
		const max:ISeriesData = {seriesName: "Remaining Max Heap", dataPoints: maxWOCommit};

		return <HeapChartInternal seriesList={[max, commit, used]} dispatch={this.props.dispatch}  displayFunc={megaByteDisplay}/>;
	}
}

class HeapChartTooltip extends SharedTooltip
{
	constructor(valDisplay:(number)=>string, showTotal=true)
	{
		super(valDisplay, showTotal);
	}

	generateStr(point:ITooltipSharedPoint): string
	{
		const uPt = this.getPointByName(point,"Used Heap");
		const cPt = this.getPointByName(point,"Remaining Committed Heap");
		const mPt = this.getPointByName(point,"Remaining Max Heap");

		if(cPt && uPt && mPt)
		{
			const usedHeap = uPt.y;
			const committedHeap = cPt.y + usedHeap;
			const maxHeap = mPt.y + committedHeap;

			let str = "";

			str += `<br/>Max Heap: <b>${megaByteDisplay(maxHeap)}</b>`;
			str += `<br/>Committed Heap: <b>${megaByteDisplay(committedHeap)}</b>`;
			str += `<br/>Used Heap: <b>${megaByteDisplay(usedHeap)}</b>`;

			return SharedTooltip.customTooltipHeader(point.x, str);
		}
		else {
			return this.barebonesTooltip(point);
		}
	}
}