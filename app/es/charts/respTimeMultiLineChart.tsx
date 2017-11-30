import * as React from 'react';
import {MultiLineChart} from "./multiLineChart";
import {responseTimeDisplay} from "../metricUtils";
import {AbstractTooltip, ReverseSharedTooltip} from "./tooltips/sharedTooltip";

export class ResponseTimeMultiLineChart extends MultiLineChart
{
	protected getValueDisplayFunc():(number)=>string
	{
		return responseTimeDisplay;
	}
}


export class ResponseTimeMultiLineChartReversedTooltip extends ResponseTimeMultiLineChart
{

	protected getTooltipGenerator(valueDisplayFunc: (number)=>string): AbstractTooltip
	{
		return new ReverseSharedTooltip(valueDisplayFunc, false);
	}
}