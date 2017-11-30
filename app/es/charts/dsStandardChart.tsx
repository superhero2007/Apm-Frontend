import * as React from "react";
import {DSChart} from "./dsChart";

export abstract class DSStandardChart<P,S> extends DSChart<P,S>
{
	public static defaultStackColors = ['#FAA43A', '#60BD68', '#F17CB0', '#B2912F', '#B276B2', '#DECF3F','#57CBE3'];

	private getStandardConfig()
	{
		const chartHeight = this.getChartHeight();
		return {
			chart: {
				height: chartHeight
			},
			credits: {
				enabled: false
			},
			title: {
				text: ""
			},
			plotOptions: {
				series: {
					stacking: 'normal'
				}
			},
			yAxis: {
				title: {
					text: null
				}
			}
		};
	}

	getChartConfig()
	{
		const standardConfig = this.getStandardConfig();
		const customConfig = this.getCustomizedConfig();
		return $.extend(true, {}, standardConfig, customConfig);
	}

	protected getChartHeight()
	{
		return 280;
	}

	protected abstract getCustomizedConfig();
}