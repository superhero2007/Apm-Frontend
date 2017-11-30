import * as React from "react";
import * as _ from "lodash";
import {CustomTimeRange} from "../filters/timerange";
import {action_updateTimeRange} from "../../reducers/esReducer";
import {IDataPoint} from "../views/metricDetailView";
import {DSStandardChart} from "./dsStandardChart";
import {AbstractTooltip} from "./tooltips/sharedTooltip";
import * as moment from 'moment';
import {Dispatch} from "redux";

export interface IChartTimeSeries {
	name: string;
	data: number[][];
	negativeColor?  :string;
	type?   :string;
	yAxis?  :number;
	index?  :number;
}
export interface IDispatchable {
	dispatch: Dispatch<any>;
}
export abstract class DSTimelineChart<P extends IDispatchable, S> extends DSStandardChart<P,S>
{
	private static chartSelection(event, dispatch:Dispatch<any>)
	{
		event.preventDefault();

		var chart = event.target;
		var selection = event.xAxis[0];
		var range = parseInt(selection.max) - parseInt(selection.min);
		if (range > chart.xAxis[0].minRange) {

			var mbegin:moment.Moment = moment(selection.min);
			var mend:moment.Moment = moment(selection.max);

			const customTimeRange = new CustomTimeRange(mbegin, mend);

			dispatch(action_updateTimeRange(customTimeRange));
			// if(!isMobileBrowser) {
			// 	ctrl.setChartsLoading(true);
			// 	ctrl.$scope.$emit(EVENT_CUSTOMRANGESELECTCHART, {begin: mbegin, end: mend});
			// }
		}
	}

	protected static convertDataPoints(data:IDataPoint[]):number[][] {
		var hcData:number[][] = [];
		_.each(data, (element:IDataPoint) => {
			var y = element.v;
			var x = moment(element.t).valueOf();

			hcData.push([x, y]);
		});

		return hcData;
	}

	protected getCommonConfig()
	{
		const selFunc = DSTimelineChart.chartSelection;
		const dispatch = this.props.dispatch;
		const chartType = this.chartType();
		const series = this.getSeries();
		const valueDisplayFunc = this.getValueDisplayFunc();
		const tooltipGenerator = this.getTooltipGenerator(valueDisplayFunc);
		const zoom = dispatch? "x":"";

		return {
			chart: {
				type: chartType,
				zoomType: zoom,
				resetZoomButton: {
					theme: {
						display: 'none'
					}
				},
				events: {
					selection: function (event) {
						selFunc(event, dispatch);
					}
				}
			},
			plotOptions: {
				line: {
					marker: {
						enabled: false
					}
				},
				series: {
					shadow: false,
					marker: {
						enabled: false
					}
				}
			},
			xAxis: {
				type: 'datetime',
				dateTimeLabelFormats: {
					month: '%d%b'
				},
				minRange: 1000 * 60 * 2,
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
				shared: tooltipGenerator.isShared(),
				formatter: function () {
					return tooltipGenerator.generateStr(this);
				}
			},
			series: series
		};
	}

	protected getCustomizedConfig()
	{
		const commonConfig = this.getCommonConfig();
		const myConfig = this.getCustomConfig();
		return $.extend(true, {}, commonConfig, myConfig);

	}

	protected abstract getValueDisplayFunc():(number)=>string;
	protected abstract getCustomConfig();
	protected abstract chartType():string;
	protected abstract getSeries():IChartTimeSeries[];
	protected abstract getTooltipGenerator(valueDisplayFunc: (number)=>string): AbstractTooltip;


}