import * as React from "react";
import {StackedAreaChart} from "./stackedAreaChart";
import {AbstractTooltip, SharedTooltip, ITooltipSharedPoint} from "./tooltips/sharedTooltip";
import {errRateDisplay} from "../metricUtils";
import {ISeriesData, IDataPoint} from "../views/metricDetailView";

export class ThpErrRateTooltip extends SharedTooltip
{
	constructor(valDisplay:(number)=>string, showTotal=true)
	{
		super(valDisplay, showTotal);
	}

	generateStr(point:ITooltipSharedPoint): string
	{
		let str = "";
		let total = 0;

		let errCnt =0;
		for (let pt of point.points)
		{
			total = pt.total;
			str += `<br/>${pt.series.name}: ${this.valDisplay(pt.y)}`;

			if(pt.series.name.startsWith("Bad"))
				errCnt = pt.y;
		}

		const errPct = (errCnt * 100/total);
		str += `<br/><b>Throughput:  ${this.valDisplay(total)}</b>`;
		str += `<br/><b>Error Rate:  ${errRateDisplay(errPct)}</b>`;

		return this.addContentToHeader(point, str);
	}
}

class ThroughputAndErrorChartInternal extends StackedAreaChart
{

	getCustomConfig()
	{
		return {
			colors: ThroughputAndErrorChart.thpErrColors
		};
	}

	protected getTooltipGenerator(valueDisplayFunc: (number)=>string): AbstractTooltip
	{
		return new ThpErrRateTooltip(valueDisplayFunc);
	}
}

export class ThroughputAndErrorChart extends React.Component<{
	succPts: IDataPoint[];
	errPts: IDataPoint[];
	dispatch;
}, {}>
{
	static thpErrColors = ['#7CB5EC', '#CD2525'];
	render()
	{
		var thp:ISeriesData = {seriesName: "Successful Requests", dataPoints: this.props.succPts};
		var err:ISeriesData = {seriesName: "Bad Requests", dataPoints: this.props.errPts};

		return <ThroughputAndErrorChartInternal seriesList={[thp, err]} dispatch={this.props.dispatch}/>;
	}
}