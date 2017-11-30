import * as React from "react";
import {DSStandardChart} from "./dsStandardChart";
import {responseTimeDisplay, throughputUnit} from "../metricUtils";

export interface ICSChartSeriesData {
	values: number[];
	name: string;
	valueDisplayFunc: (number)=>string;
}

export abstract class ColumnAndSplineChart<P,S> extends DSStandardChart<P,S>
{
	protected abstract getColumnSeriesData(): ICSChartSeriesData;
	protected abstract getSplineSeriesData(): ICSChartSeriesData;
	protected abstract getXAxisCategories(): string[];

	protected getCustomizedConfig()
	{

		const columnSeriesData = this.getColumnSeriesData();
		const splineSeriesData = this.getSplineSeriesData();

		const maxResponseTime = Math.max.apply(Math, columnSeriesData.values);
		const minResponseTime = Math.min.apply(Math, columnSeriesData.values);

		let yAxisMin = null;
		if(minResponseTime > 20)
		{
			yAxisMin = minResponseTime - ((maxResponseTime - minResponseTime) * 0.05);
			if(yAxisMin < 0)
				yAxisMin = 0;
		}

		const respTimeColor = '#2080DC';
		const thpColor = '#fac303';

		const tooltipHeadingFunc = this.getTooltipHeading;

		const series =[
			{
				name: columnSeriesData.name,
				type: 'column',
				data: columnSeriesData.values,
				color: respTimeColor,
				yAxis: 0
			},
			{
				name: splineSeriesData.name,
				type: 'spline',
				data: splineSeriesData.values,
				color: thpColor,
				yAxis: 1
			}
		];

		return {
			xAxis: {
				categories: this.getXAxisCategories()
			},
			yAxis: [{
				title: {
					text: null
				},
				labels: {
					formatter: function () {
						return columnSeriesData.valueDisplayFunc(this.value);
					}
				},
				min: yAxisMin
			},
				{
					title: {
						text: null
					},
					labels: {
						formatter: function () {
							return splineSeriesData.valueDisplayFunc(this.value);
						},

					},
					opposite: true
				}
			],
			tooltip: {
				shared: true,
				formatter: function () {
					const respTime  = responseTimeDisplay(this.points[0].y);
					const thp       = throughputUnit(this.points[1].y);
					return `<b>${tooltipHeadingFunc(this)}</b><br>${columnSeriesData.name}: <b>${respTime}</b><br>${splineSeriesData.name}: <b>${thp}</b>`;
				}
			},
			series: series
		};
	}

	protected getTooltipHeading(obj:any)
	{
		return obj.x;
	}
}