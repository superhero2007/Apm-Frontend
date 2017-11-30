import * as React from "react";
import {responseTimeDisplay} from "../metricUtils";
import {StackedAreaChart} from "../charts/stackedAreaChart";
import {ResponseTimeMultiLineChart} from "../charts/respTimeMultiLineChart";

export class TopXView extends React.Component<{
	respTimes;
	thps;
	slowest;
	dispatch: any;
}, {}>
{
	render()
	{
		return (
			<div>
				<h3>Top Calls by Time Spent</h3>
				<ResponseTimeMultiLineChart seriesList={this.props.respTimes} dispatch={this.props.dispatch} />
				<hr/>
				<h3>Top Calls by Throughput</h3>
				<StackedAreaChart seriesList={this.props.thps} dispatch={this.props.dispatch}/>
				<hr/>
				<h3>Slowest Calls</h3>
				<ResponseTimeMultiLineChart seriesList={this.props.slowest} dispatch={this.props.dispatch}/>
			</div>
		);
	}
}