import * as React from "react";
import {ErrRateMultiLineChart} from "../../../es/charts/ErrRateMultiLineChart";
import {errRateDisplay, responseTimeDisplay, throughputDisplay, throughputUnit} from "../../../es/metricUtils";
import {ChartTitle} from "../../../es/charts/chartTitle";
import {RowCol} from "../../../widgets/rowCol";
import {ThroughputMultiLineChart} from "../../../es/charts/thpMultiLineChart";
import {ResponseTimeMultiLineChart} from "../../../es/charts/respTimeMultiLineChart";
import {IStatsByMetric} from "../../../es/views/perAppMetricView";
import {Dispatch} from "redux";


export interface IMetricStatsSummary {
	avgResponseTime: number;
	avgThroughput: number;
	totalThroughput:    number;
	avgErrPct:  number;
}

export class TxnPerJVM extends React.Component<{
	dispatch   :Dispatch<any>;
	perJVM: IStatsByMetric;
	summary: IMetricStatsSummary;
}, {}>
{
	render()
	{
		return (
			<div>
				<RowCol>
					<ChartTitle chartName="Response Time" summaryStat={responseTimeDisplay(this.props.summary.avgResponseTime)} summaryType="Average"/>
					<ResponseTimeMultiLineChart seriesList={this.props.perJVM.responseTimes} dispatch={this.props.dispatch}/>
				</RowCol>
				<RowCol>
					<ChartTitle chartName="Throughput"
					            summaryStat={throughputDisplay(this.props.summary.avgThroughput)} summaryType="Average"
					            summaryStat2={throughputUnit(this.props.summary.totalThroughput)} summaryType2="Total"
					/>
					<ThroughputMultiLineChart   seriesList={this.props.perJVM.throughputs} dispatch={this.props.dispatch}/>
				</RowCol>
				<RowCol>
					<ChartTitle chartName="Error Rate" summaryStat={errRateDisplay(this.props.summary.avgErrPct)} summaryType="Average"/>
					<ErrRateMultiLineChart   seriesList={this.props.perJVM.errRates} dispatch={this.props.dispatch}/>
				</RowCol>
			</div>
		);
	}
}



export class MetricPerJVM extends React.Component<{
	dispatch   :Dispatch<any>;
	perJVM: IStatsByMetric;
	summary: IMetricStatsSummary;
}, {}>
{
	render()
	{
		return (
			<div>
				<RowCol>
					<ChartTitle chartName="Response Time" summaryStat={responseTimeDisplay(this.props.summary.avgResponseTime)} summaryType="Average"/>
					<ResponseTimeMultiLineChart seriesList={this.props.perJVM.responseTimes} dispatch={this.props.dispatch}/>
				</RowCol>
				<RowCol>
					<ChartTitle chartName="Throughput"
					            summaryStat={throughputDisplay(this.props.summary.avgThroughput)} summaryType="Average"
					            summaryStat2={throughputUnit(this.props.summary.totalThroughput)} summaryType2="Total"
					/>
					<ThroughputMultiLineChart   seriesList={this.props.perJVM.throughputs} dispatch={this.props.dispatch}/>
				</RowCol>
			</div>
		);
	}
}