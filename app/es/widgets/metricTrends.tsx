import * as React from "react";
import {DSTable} from "../../widgets/dsTable";
import {responseTimeDisplay, throughputDisplay, throughputUnit} from "../metricUtils";
import {RowCol} from "../../widgets/rowCol";
import {TrendsChart} from "../charts/trendsChart";
import {DayOfWeekChart} from "../charts/dayOfWeekChart";
import {TimeOfDayChart} from "../charts/timeOfDayChart";

export interface IMetricTrend
{
	totalTime   :number;
	totalCalls  :number;
	avgTime     :number;
	avgThp      :number;
}

export interface ITimeOfDayStats
{
	time:   string;
	avgResponseTime :number;
	totalCalls      :number;
}
export interface ITimeOfDayContainer
{
	values: ITimeOfDayStats[];
}

export interface IMetricTrendContainer
{
	last24hrs   :IMetricTrend;
	prev24hrs   :IMetricTrend;
	prev7days   :IMetricTrend;
	prev30days  :IMetricTrend;
}

export class MetricTrends extends React.Component<{
	trends:IMetricTrendContainer;
	dayOfWeek:  ITimeOfDayContainer;
	timeOfDay:  ITimeOfDayContainer;
},{}>
{

	private renderTrendsTable(trends: IMetricTrendContainer)
	{
		return (
			<DSTable columnNames={["Time Range", "Avg Response Time", "Avg Throughput", "Total Calls"]}>
				{this.renderTableRow(trends.last24hrs, "Last 24 Hrs")}
				{this.renderTableRow(trends.prev24hrs, "Prev 24 Hrs")}
				{this.renderTableRow(trends.prev7days, "Prev 7 Days")}
				{this.renderTableRow(trends.prev30days, "Prev 30 Days")}
			</DSTable>
		);
	}


	private renderTableRow(trend:IMetricTrend, name:string)
	{
		return (
			<tr key={name}>
				<td><b>{name}</b></td>
				<td>{responseTimeDisplay(trend.avgTime)}</td>
				<td>{throughputDisplay(trend.avgThp)}</td>
				<td>{throughputUnit(trend.totalCalls)}</td>
			</tr>
		);
	}


	render()
	{
		const style = {
			width: "800px"
		};
		return (
			<div>

				<RowCol className="bottom2">
					<h3>Overview</h3>
				</RowCol>

				<RowCol>
					<div className="horizontalAlign">
						<div style={style}>
							<TrendsChart trends={this.props.trends}/>
						</div>
					</div>
				</RowCol>
				{this.renderTrendsTable(this.props.trends)}

				<hr/>

				<RowCol className="bottom2">
					<h3>Day of Week Trend</h3>
					<h5>(Using aggregated data from last 90 days)</h5>
				</RowCol>
				<DayOfWeekChart data={this.props.dayOfWeek}/>

				<hr/>
				<RowCol className="bottom2">
					<h3>Time of Day Trend</h3>
					<h5>(Using aggregated data from last 90 days)</h5>
				</RowCol>
				<div className="bottom2">
					<TimeOfDayChart data={this.props.timeOfDay}/>
				</div>
			</div>
		);
	}
}