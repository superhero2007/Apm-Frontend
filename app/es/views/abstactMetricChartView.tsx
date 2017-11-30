import * as React from "react";
import {AbstractMetricDetailView} from "./abstractMetricDetailView";
import {IMetricOverview} from "./metricOverview";
import {RowCol} from "../../widgets/rowCol";
import {ChartTitle} from "../charts/chartTitle";
import {throughputUnit, throughputDisplay, responseTimeDisplay} from "../metricUtils";
import {IESViewProps} from "../esViews";

export abstract class AbstractMetricChartView<S> extends AbstractMetricDetailView<IESViewProps, S>
{
	protected renderMetricCharts(data:S, stats:IMetricOverview)
	{
		return <RowCol>
			<ChartTitle chartName="Response Time" summaryStat={responseTimeDisplay(stats.avgResponseTime)} summaryType="Average"/>
			{this.renderResponseTimeChart(data)}
			<ChartTitle chartName="Throughput"
			            summaryStat={throughputDisplay(stats.avgThroughput)} summaryType="Average"
			            summaryStat2={throughputUnit(stats.totalThroughput)} summaryType2="Total"
			/>
			{this.renderThpChart(data)}
		</RowCol>;
	}

	protected abstract renderResponseTimeChart(data:S);
	protected abstract renderThpChart(data:S);
}