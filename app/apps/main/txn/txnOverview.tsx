import * as React from "react";
import {IDataPoint, ISeriesData} from "../../../es/views/metricDetailView";
import {IResponseTimeSegment, SegmentUtils} from "../segmentStuff";
import {errRateDisplay, responseTimeDisplay, roundToTwo, throughputDisplay} from "../../../es/metricUtils";
import {DSTable} from "../../../widgets/dsTable";
import {RowCol} from "../../../widgets/rowCol";
import {DeviationThpChart} from "../../../es/charts/deviationThpChart";
import {ThroughputAndErrorChart} from "../../../es/charts/thpAndErrChart";
import {DSTabs, DSTabType, TabStyle} from "../../../es/widgets/dsTabs";
import {ChartTitle} from "../../../es/charts/chartTitle";
import {StackedAreaChart} from "../../../es/charts/stackedAreaChart";
import {DeviationResponseTimeChart} from "../../../es/charts/deviationRespTimeChart";
import {IPercentileResult, PercentileView} from "../percentiles";
import {ISer_TimeRange} from "../../../es/filters/timerange";
import {Dispatch} from "redux";


interface ITableSegment
{
	name:string;
	category:string;
	percentTime:number;
	avgCallsPerTxn:number;
	avgTimeSpent:number;
}

interface IBreakdownTable
{
	segments:ITableSegment[];
}

export interface ITxnDetail
{
	responseTimeSegments:IResponseTimeSegment[];
	xdResponseTimeSegments: IResponseTimeSegment[];
	asyncSegments:IResponseTimeSegment[];
	perLayerSegments:IResponseTimeSegment[];
	asyncPerLayerSegments:IResponseTimeSegment[];
	breakdownTable:IBreakdownTable;
	asyncBreakdownTable:IBreakdownTable;
	avgErrRate:number;
	avgResponseTime:number;
	avgThroughput:number;
	throughputs:IDataPoint[];
	errorCounts:IDataPoint[];

	responseTimes: IDataPoint[];
	totalThps: IDataPoint[];
}




export class TxnOverview extends React.Component<{
	txnDetail:ITxnDetail;
	pctile: IPercentileResult;
	dispatch   :Dispatch<any>;
	onChartStyleSelect;
	selectedChartStyle: DSTabType;
	timeRange: ISer_TimeRange;
},{}>
{
	private renderBreakdownTable(bt:IBreakdownTable)
	{
		let key = 1;
		return (
			<div>
				<DSTable columnNames={["Category", "Name","% Time Spent", "Calls per Txn","Avg Time per Call"]}>
					{bt.segments.map(r => <tr key={key++}>
						<td>{r.category}</td>
						<td>{r.name}</td>
						<td>{roundToTwo(r.percentTime)}</td>
						<td>{roundToTwo(r.avgCallsPerTxn) == 0 ? "" : roundToTwo(r.avgCallsPerTxn)}</td>
						<td>{responseTimeDisplay(r.avgTimeSpent)}</td>
					</tr>)}
				</DSTable>
			</div>
		);
	}


	private renderTables(txnDetail:ITxnDetail, hasAsync: boolean)
	{
		let asyncTable;
		if(hasAsync)
		{
			asyncTable = (
				<RowCol>
					<h4>Async Breakdown</h4>
					{this.renderBreakdownTable(txnDetail.asyncBreakdownTable)}
				</RowCol>
			);
		}

		return  (
			<div>
				<RowCol>
					<h4>Transaction Breakdown</h4>
					{this.renderBreakdownTable(txnDetail.breakdownTable)}
				</RowCol>
				{asyncTable}
			</div>
		);

	}

	private renderCharts(txnDetail:ITxnDetail, hasAsync: boolean)
	{
		if(this.props.selectedChartStyle == DSTabType.relative)
		{
			return this.renderRelativeCharts(txnDetail, hasAsync);
		}

		let syncSegs, asyncSegs;

		if (this.props.selectedChartStyle == DSTabType.layers)
		{
			syncSegs = txnDetail.perLayerSegments;
			asyncSegs = txnDetail.asyncPerLayerSegments;
		}
		else
		{
			syncSegs = txnDetail.responseTimeSegments;
			asyncSegs = txnDetail.asyncSegments;
		}

		const respTimeSeries:ISeriesData[] = SegmentUtils.toSeriesData(syncSegs);

		let asyncChart;
		if(hasAsync)
		{
			const asyncSeries = SegmentUtils.toSeriesData(asyncSegs);
			asyncChart = (
				<RowCol>
					<ChartTitle chartName="Async Calls"/>
					<StackedAreaChart seriesList={asyncSeries} dispatch={this.props.dispatch} displayFunc={responseTimeDisplay}/>
				</RowCol>
			);
		}


		let responseTimeChart;

		if(this.props.selectedChartStyle == DSTabType.percentiles)
		{
			if(!PercentileView.canDisplayPctile(this.props.timeRange))
			{
				responseTimeChart = PercentileView.renderTimeRangeMsg();
			}
			else
			{
				responseTimeChart = (
					<RowCol>
						<ChartTitle chartName="Response Time" summaryStat={responseTimeDisplay(txnDetail.avgResponseTime)} summaryType="Average"/>
						<PercentileView pctiles={this.props.pctile} dispatch={this.props.dispatch}/>
					</RowCol>
				);
			}
		}
		else if(this.props.selectedChartStyle == DSTabType.xd)
		{
			const respTimeSeries:ISeriesData[] = SegmentUtils.toSeriesData(txnDetail.xdResponseTimeSegments);
			responseTimeChart = (<div>
				<RowCol>
					<ChartTitle chartName="Response Time" summaryStat={responseTimeDisplay(txnDetail.avgResponseTime)} summaryType="Average"/>
					<StackedAreaChart seriesList={respTimeSeries} dispatch={this.props.dispatch} displayFunc={responseTimeDisplay} chartHeight={1200}/>
				</RowCol>
				{asyncChart}
			</div>);
		}
		else
		{
			responseTimeChart = (
				<div>
					<RowCol>
						<ChartTitle chartName="Response Time" summaryStat={responseTimeDisplay(txnDetail.avgResponseTime)} summaryType="Average"/>
						<StackedAreaChart seriesList={respTimeSeries} dispatch={this.props.dispatch} displayFunc={responseTimeDisplay} chartHeight={340}/>
					</RowCol>
					{asyncChart}
				</div>
			);
		}

		return (
			<div>
				{responseTimeChart}
				<RowCol>
					<ChartTitle chartName="Throughput"
					            summaryStat={throughputDisplay(txnDetail.avgThroughput)} summaryType="Average"
					            summaryStat2={errRateDisplay(txnDetail.avgErrRate)} summaryType2="Average Error Rate"
					/>
					<ThroughputAndErrorChart succPts={txnDetail.throughputs} errPts={txnDetail.errorCounts} dispatch={this.props.dispatch}/>
				</RowCol>
			</div>
		);
	}

	private renderRelativeCharts(txnDetail:ITxnDetail, hasAsync: boolean)
	{
		return (
			<div>
				<RowCol>
					<ChartTitle chartName="Response Time" summaryStat={responseTimeDisplay(txnDetail.avgResponseTime)} summaryType="Average"/>
					<DeviationResponseTimeChart dispatch={this.props.dispatch} stats={txnDetail.responseTimes} avg={txnDetail.avgResponseTime} />
				</RowCol>
				<RowCol>
					<ChartTitle chartName="Throughput" summaryStat={throughputDisplay(txnDetail.avgThroughput)} summaryType="Average"/>
					<DeviationThpChart dispatch={this.props.dispatch} stats={txnDetail.totalThps} avg={txnDetail.avgThroughput} />
				</RowCol>
			</div>
		);
	}

	private onSelectPill(tab: DSTabType)
	{
		this.props.onChartStyleSelect(tab);
	}



	render()
	{
		const txnDetail = this.props.txnDetail;
		const hasAsync = txnDetail.asyncSegments.length > 0;


		const tabs = (
			<RowCol className="bottom2">
				<DSTabs activeTab={this.props.selectedChartStyle} tabs={[DSTabType.segments,DSTabType.layers, DSTabType.relative, DSTabType.percentiles, DSTabType.xd]} onSelect={this.onSelectPill.bind(this)} style={TabStyle.pills}/>
			</RowCol>
		);

		return (<div>
			{tabs}
			{this.renderCharts(txnDetail, hasAsync)}
			{this.renderTables(txnDetail, hasAsync)}
		</div>);
	}
}