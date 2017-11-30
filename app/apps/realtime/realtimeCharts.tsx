import * as React from "react";
import * as _ from "lodash";
import {RealtimeSharedTooltip, SharedTooltip, ITooltipSharedPoint} from "../../es/charts/tooltips/sharedTooltip";
import {DSStandardChart} from "../../es/charts/dsStandardChart";
import {ThroughputAndErrorChart, ThpErrRateTooltip} from "../../es/charts/thpAndErrChart";
import {metricCategoryDisplay, throughputUnit} from "../../es/metricUtils";
import {MetricCategory} from "../../reducers/esReducer";
import ReactHighCharts = require("react-highcharts");

export interface IPtValues
{
	[series: string]: number;
}

interface IChartProps
{
	valueDisplayFunc;
	maxPoints: number;
	max?: number;
}

abstract class RealtimeTimelineChart<P extends IChartProps> extends DSStandardChart<P,{}>
{
	protected tick = 0;

	protected getChart()
	{
		return (this.refs["chart"] as any).getChart();
	}


	private getMyConfig()
	{
		const valueDisplayFunc = this.props.valueDisplayFunc;
		const tooltipGenerator = new RealtimeSharedTooltip(valueDisplayFunc, false);

		return {
			chart: {
				resetZoomButton: {
					theme: {
						display: 'none'
					}
				}
			},
			plotOptions: {
				line: {
					marker: {
						enabled: false
					}
				},
			},
			xAxis: {
				type: 'datetime',
				dateTimeLabelFormats: {
					month: '%H:%M:%S'
				},
				minRange: 1000,
				minPadding: 0,
				maxPadding: 0
			},
			yAxis: {
				labels: {
					formatter: function () {
						return valueDisplayFunc(this.value);
					}
				}
			},
			tooltip: {
				shared: true,
				formatter: function () {
					return tooltipGenerator.generateStr(this);
				}
			}
		};
	}

	protected getCustomizedConfig()
	{
		const myConfig = this.getMyConfig();
		const customConfig = this.getRealtimeChartConfig();
		return $.extend(true, {}, myConfig, customConfig);
	}


	protected abstract getRealtimeChartConfig();
	protected abstract getTooltipGenerator(valueDisplayFunc:any):SharedTooltip;

}


interface IMultiLineChartProps extends IChartProps
{
	onSeriesDelete: (series: string) => void;
}

export class RealtimeMultilineChart extends RealtimeTimelineChart<IMultiLineChartProps>
{
	private unusedCounters: IPtValues = {};

	addSeries(names: string[])
	{
		if(names.length > 0 )
		{
			const chart = this.getChart();

			for (const name of names)
			{
				chart.addSeries({
					name: name,
					data: []
				}, false);
			}
			chart.redraw();
		}
	}

	updatePoints(x:Date, newVals:IPtValues)
	{
		const chart = this.getChart();
		const maxPoints = this.props.maxPoints;

		const defaultShift = this.tick >= maxPoints;
		for(const series of chart.series)
		{
			const seriesName = series.name;
			let newVal = newVals[seriesName];

			if(_.isUndefined(newVal))
			{
				newVal = 0;
				this.unusedCounters[seriesName] = (this.unusedCounters[seriesName] || 0) + 1;
			}
			else
			{
				this.unusedCounters[seriesName] = 0;
			}

			let shift = defaultShift;
			if(series.data.length < maxPoints)
				shift = false;
			series.addPoint({x: x, y: newVal}, false, shift);
		}

		if(this.tick < maxPoints)
			this.tick++;

		for (const series in this.unusedCounters)
		{
			if(this.unusedCounters[series] >= maxPoints)
			{
				this.removeSeries(series);
			}
		}



		chart.redraw();

	}

	removeSeries(seriesName: string)
	{
		const chart = this.getChart();
		const chartSeries = chart.series.find(it => it.name === seriesName) as any;
		if(chartSeries)
		{
			chartSeries.remove();
			delete this.unusedCounters[seriesName];
			this.props.onSeriesDelete(seriesName);
		}
	}

	protected getTooltipGenerator(valueDisplayFunc: any): SharedTooltip
	{
		return new RealtimeSharedTooltip(valueDisplayFunc, false);
	}


	protected getChartHeight(): any
	{
		return 220;
	}

	protected getRealtimeChartConfig()
	{
		return {
			chart: {
				type: 'line'
			},
			plotOptions: {
				series: {
					shadow: false,
					marker: {
						enabled: false
					},
					stacking: null
				}
			}
		};
	}

}

export class RealtimeThpStackedChart extends RealtimeTimelineChart<IChartProps>
{

	updatePoints(x:Date, succ:number, bad: number)
	{
		const chart = this.getChart();
		const maxPoints = this.props.maxPoints;

		const defaultShift = this.tick >= maxPoints;

		//using timestamps instead of date objects
		//due to bug: https://github.com/highcharts/highcharts/issues/5634
		chart.series[0].addPoint({x: +x, y: succ}, false, defaultShift);
		chart.series[1].addPoint({x: +x, y: bad}, false, defaultShift);

		if(this.tick < maxPoints)
			this.tick++;

		chart.redraw();
	}


	protected getChartHeight(): number
	{
		return 400;
	}

	protected getTooltipGenerator(valueDisplayFunc: any): SharedTooltip
	{
		return new RealtimeThpErrRateTooltip();
	}

	protected getRealtimeChartConfig()
	{
		return {
			chart: {
				type: 'area'
			},
			colors: ThroughputAndErrorChart.thpErrColors,
			plotOptions: {
				area: {
					stacking: 'normal',
					marker: {
						enabled: false
					}
				}
			},
			series: [
				{
					name: "Successful Requests",
					data: []
				},
				{
					name: "Bad Requests",
					data: []
				}
			]
		};
	}

}

export class RealtimeMetricCategoryStackedChart extends RealtimeTimelineChart<IChartProps>
{
	addSeries(names: string[])
	{
		if(names.length > 0 )
		{
			const chart = this.getChart();

			for (const name of names)
			{
				chart.addSeries({
					id: name,
					name: metricCategoryDisplay(MetricCategory[name]),
					data: []
				}, false);
			}
			chart.redraw();
		}
	}


	updatePoints(x:Date, newVals:IPtValues)
	{
		const chart = this.getChart();
		const maxPoints = this.props.maxPoints;

		const defaultShift = this.tick >= maxPoints;

		for(const series of chart.series)
		{
			const sid = series.options.id;
			let val = newVals[sid];
			if(!val)
				val =0;

			let shift = defaultShift;
			if(series.data.length < maxPoints)
				shift = false;
			//using timestamps instead of date objects
			//due to bug: https://github.com/highcharts/highcharts/issues/5634
			series.addPoint({x: +x, y: val}, false, shift);
		}

		if(this.tick < maxPoints)
			this.tick++;

		chart.redraw();
	}

	protected getTooltipGenerator(valueDisplayFunc: any): SharedTooltip
	{
		return new RealtimeSharedTooltip(valueDisplayFunc, true);
	}

	protected getChartHeight(): number
	{
		return 400;
	}

	protected getRealtimeChartConfig()
	{
		return {
			chart: {
				type: 'area',
			},
			colors: DSStandardChart.defaultStackColors,
			plotOptions: {
				area: {
					stacking: 'normal',
					marker: {
						enabled: false
					}
				}
			},
			yAxis:
			{
				max: this.props.max
			},
			series: [
				{
					id: 'Java',
					name: "Java Code",
					data: []
				}
			]
		};
	}

}

export class RealtimeThpErrRateTooltip extends ThpErrRateTooltip
{
	constructor()
	{
		super(throughputUnit);
	}

	protected addContentToHeader(point: ITooltipSharedPoint, str: string): string
	{
		return RealtimeSharedTooltip.perSecondHeader(point.x, str);
	}
}
