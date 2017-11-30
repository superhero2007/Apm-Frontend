import * as React from "react";
import {throughputDisplay} from "../metricUtils";
import {DeviationChart} from "./deviationChart";


export class DeviationThpChart extends DeviationChart
{
	protected getValueDisplayFunc():(number)=>string
	{
		return throughputDisplay;
	}

	protected getSeriesName(): string
	{
		return "Throughput"
	}
}
