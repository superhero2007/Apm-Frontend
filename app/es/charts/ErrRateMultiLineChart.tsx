import * as React from "react";
import {MultiLineChart} from "./multiLineChart";
import {errRateDisplay, epmDisplay} from "../metricUtils";

export class ErrRateMultiLineChart extends MultiLineChart
{
	protected getValueDisplayFunc():(number)=>string
	{
		return errRateDisplay;
	}
}

export class ErrCountMultiLineChart extends MultiLineChart
{
	protected getValueDisplayFunc():(number)=>string
	{
		return epmDisplay;
	}
}