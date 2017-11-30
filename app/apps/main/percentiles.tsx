import * as React from "react";
import {IDataPoint, ISeriesData} from "../../es/views/metricDetailView";
import {ResponseTimeMultiLineChartReversedTooltip} from "../../es/charts/respTimeMultiLineChart";
import {ISer_TimeRange, AbstractTimeRange, TimeRange} from "../../es/filters/timerange";
import moment = require('moment');
import {RowCol} from "../../widgets/rowCol";

export interface IPercentileResult
{
	pct50: IDataPoint[];
	pct90: IDataPoint[];
	pct95: IDataPoint[];
	pct99: IDataPoint[];
}

export class PercentileView extends React.Component<{pctiles: IPercentileResult, dispatch: any;}, {}>
{
	render()
	{
		const pctiles = this.props.pctiles;

		const series: ISeriesData[] = [
			{
				seriesName: "Median",
				dataPoints: pctiles.pct50
			},
			{
				seriesName: "90th Percentile",
				dataPoints: pctiles.pct90
			},
			{
				seriesName: "95th Percentile",
				dataPoints: pctiles.pct95
			},
			{
				seriesName: "99th Percentile",
				dataPoints: pctiles.pct99
			}
		];


		return (
			<ResponseTimeMultiLineChartReversedTooltip seriesList={series} dispatch={this.props.dispatch}/>
		);
	}

	public static canDisplayPctile(serTimeRange: ISer_TimeRange): boolean
	{
		const curTimeRange = AbstractTimeRange.deserialize(serTimeRange).toUnix();
		const maxRange = new TimeRange("24 hours", 24, 'h').toUnix();
		return curTimeRange.begin >= maxRange.begin;
	}

	public static renderTimeRangeMsg()
	{
		return (
			<RowCol className="bottom4">
				<h2>Select a Time Range within last 24 hours to view percentiles</h2>
				<h4>The percentile viewing range will increase over the next few days as we measure the load it causes on our servers</h4>
			</RowCol>
		);
	}
}

