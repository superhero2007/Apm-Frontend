import * as React from 'react';
import {MultiLineChart} from "./multiLineChart";
import {throughputDisplay} from "../metricUtils";

export class ThroughputMultiLineChart extends MultiLineChart
{
	protected getValueDisplayFunc():(number)=>string
	{
		return throughputDisplay;
	}
}