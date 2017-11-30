import * as React from "react";
import {responseTimeDisplay} from "../metricUtils";
import {DeviationChart} from "./deviationChart";


export class DeviationResponseTimeChart  extends DeviationChart
{
	protected getSeriesName():string
	{
		return "Response Time";
	}

	protected getValueDisplayFunc():(number)=>string
	{
		return responseTimeDisplay;
	}
}
