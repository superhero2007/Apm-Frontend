import * as React from "react";
import * as _ from "lodash";
import {IDataSet, IJVMDetail} from "../trace/traceStructs";
import {MemPoolChart, BufferPoolChart, ThreadCountChart, ClassCountChart} from "../../es/charts/jvm/jvmCharts";
import {RowCol} from "../../widgets/rowCol";
import {ChartTitle} from "../../es/charts/chartTitle";
import {Col, Row} from "react-bootstrap";
import {ThroughputAndErrorChart} from "../../es/charts/thpAndErrChart";
import {errRateDisplay, responseTimeDisplay, throughputDisplay} from "../../es/metricUtils";
import {ResponseTimeLineChart} from "../../es/charts/resptimeLineChart";
import {CpuGcChart} from "../../es/charts/cpuGcChart";
import {GCPauseChart} from "../../es/charts/gcPauseChart";
import {HeapChart} from "../../es/charts/heapChart";

interface IDataSetMeta
{
	dataSet: IDataSet;
	nameParts: string[];
}

export class JVMDetail extends React.Component<{
	jvmDetail:IJVMDetail;
	dispatch: any;
},{}>
{

	private getMemPoolNames(dataListMeta:IDataSetMeta[], poolType:string)
	{
		return _.chain(dataListMeta)
			.filter(it => it.nameParts[1] === "MemPool" && it.nameParts[2] === poolType)
			.map(it => it.nameParts[3])
			.uniq()
			.value();
	}

	private getBufferPoolNames(dataListMeta:IDataSetMeta[])
	{
		return _.chain(dataListMeta)
			.filter(it => it.nameParts[1] === "BufferPool")
			.map(it => it.nameParts[2])
			.uniq()
			.value();
	}

	private renderMemPoolChart(poolType: string, name: string, jvmDataList: IDataSet[], dispatch:any)
	{
		const prefix = `JVM.MemPool.${poolType}.${name}`;

		const used:IDataSet = _.find(jvmDataList, {series: {key: prefix+".Used"}});
		const committed:IDataSet = _.find(jvmDataList, {series: {key: prefix+".Committed"}});
		const max:IDataSet = _.find(jvmDataList, {series: {key: prefix+".Max"}});

		return <MemPoolChart dispatch={dispatch} committedPts={committed.data} usedPts={used.data} maxPts={max? max.data: null}/>;
	}

	private renderBufferPoolChart(name: string, jvmDataList: IDataSet[], dispatch:any)
	{
		const prefix = `JVM.BufferPool.${name}`;

		const used:IDataSet = _.find(jvmDataList, {series: {key: prefix+".Used"}});
		const count:IDataSet = _.find(jvmDataList, {series: {key: prefix+".Count"}});
		const capacity:IDataSet = _.find(jvmDataList, {series: {key: prefix+".Capacity"}});

		return <BufferPoolChart dispatch={dispatch} countPts={count.data} usedPts={used.data} capacityPts={capacity.data}/>;
	}

	renderBufferPoolCharts(jvmDataList: IDataSet[], dispatch:any, poolNames: string[])
	{
		const colsPerRow = 2;
		const poolCount = poolNames.length;

		let numRows = Math.trunc(poolCount/colsPerRow);
		if((poolCount % colsPerRow) > 0)
			numRows++;

		const maxCols = 12;
		const colWidth = maxCols/colsPerRow;


		let colIndex = 0;
		const rows = [];
		for(let i = 0; i<numRows; i++)
		{
			const cols = [];
			for(let j =0;j < colsPerRow; j++)
			{
				if(colIndex < poolCount)
				{
					const poolName = poolNames[colIndex];
					cols.push((
						<Col key={colIndex} xs={colWidth}>
							<ChartTitle chartName={poolName} bottomSpace={true}/>
							{this.renderBufferPoolChart(poolName, jvmDataList, dispatch)}
						</Col>
					));
				}

				colIndex++;
			}

			rows.push((
				<Row className="bottom1" key={i}>
					{cols}
				</Row>
			));
		}


		return (
			<div>
				{rows}
			</div>
		);

	}

	renderPoolCharts(poolType: string, jvmDataList: IDataSet[], dispatch:any, poolNames: string[])
	{
		const colsPerRow = 3;
		const poolCount = poolNames.length;

		let numRows = Math.trunc(poolCount/colsPerRow);
		if((poolCount % colsPerRow) > 0)
			numRows++;

		const maxCols = 12;
		const colWidth = maxCols/colsPerRow;


		let colIndex = 0;
		const rows = [];
		for(let i = 0; i<numRows; i++)
		{
			const cols = [];
			for(let j =0;j < colsPerRow; j++)
			{
				if(colIndex < poolCount)
				{
					const poolName = poolNames[colIndex];
					cols.push((
						<Col key={colIndex} xs={colWidth}>
							<ChartTitle chartName={poolName} bottomSpace={true}/>
							{this.renderMemPoolChart(poolType,poolName, jvmDataList, dispatch)}
						</Col>
					));
				}

				colIndex++;
			}

			rows.push((
				<Row className="bottom1" key={i}>
					{cols}
				</Row>
			));
		}

		const tileName = poolType == this.nonHeapPoolType? "Non-Heap": poolType;

		return (
			<div>
				<RowCol className="bottom1">
					<h3>{`${tileName} Memory Pools`}</h3>
				</RowCol>
				{rows}
			</div>
		);

	}

	private heapPoolType = "Heap";
	private nonHeapPoolType = "NonHeap";

	render()
	{
		const jvmDetail = this.props.jvmDetail;

		const jvmDataList = jvmDetail.dataList;

		if(_.isEmpty(jvmDataList))
			return <h4>No data for JVM in this time range</h4>;

		const dataListMeta:IDataSetMeta[] = this.transformDataList(jvmDataList);

		const heapPoolNames = this.getMemPoolNames(dataListMeta, this.heapPoolType);
		const nonHeapPoolNames = this.getMemPoolNames(dataListMeta, this.nonHeapPoolType);
		const bufferPoolNames = this.getBufferPoolNames(dataListMeta);

		const cpuData:IDataSet = _.find(jvmDataList, {series: {key: "JVM.Processor.CPU"}});
		const gcData:IDataSet = _.find(jvmDataList, {series: {key: "JVM.Processor.GC"}});

		const heapUsedData:IDataSet = _.find(jvmDataList, {series: {key: "JVM.Memory.HeapUsed"}});
		const heapCommittedData:IDataSet = _.find(jvmDataList, {series: {key: "JVM.Memory.HeapCommitted"}});
		const heapMaxData:IDataSet = _.find(jvmDataList, {series: {key: "JVM.Memory.HeapMax"}});

		const gcpMaxData:IDataSet = _.find(jvmDataList, {series: {key: "JVM.GCPause.Max"}});
		const gcpCntData:IDataSet = _.find(jvmDataList, {series: {key: "JVM.GCPause.Count"}});
		const gcpTotalData:IDataSet = _.find(jvmDataList, {series: {key: "JVM.GCPause.Total"}});

		const clsCount: IDataSet = _.find(jvmDataList, {series: {key: "JVM.ClassCount.loaded"}});

		const daemonThreads: IDataSet = _.find(jvmDataList, {series: {key: "JVM.Threads.daemon"}});
		const nonDaemonThreads: IDataSet = _.find(jvmDataList, {series: {key: "JVM.Threads.nonDaemon"}});

		let gcCharts;

		if(gcpCntData) //gc pause data present?
		{
			gcCharts = (
				<RowCol className="bottom1">
					<div className="bottom1">
						<ChartTitle chartName="GC Pauses"/>
					</div>
					<GCPauseChart dispatch={this.props.dispatch} gcCountPts={gcpCntData.data} maxTimeGCPts={gcpMaxData.data} totalTimeGCPts={gcpTotalData.data}/>
				</RowCol>
			);

		}

		return (
			<div>
				<Row className="bottom1">
					<Col xs={6}>
						<ChartTitle chartName="Response Time" summaryStat={responseTimeDisplay(jvmDetail.avgResponseTime)} summaryType="Average"/>
						<ResponseTimeLineChart dataPoints={jvmDetail.avgResponseTimes} dispatch={this.props.dispatch}/>
					</Col>
					<Col xs={6}>
						<ChartTitle chartName="Throughput"
						            summaryStat={throughputDisplay(jvmDetail.avgThroughput)} summaryType="Average"
						            summaryStat2={errRateDisplay(jvmDetail.avgErrRate)} summaryType2="Average Error Rate"
						/>
						<ThroughputAndErrorChart dispatch={this.props.dispatch} succPts={jvmDetail.throughputs} errPts={jvmDetail.errorCounts}/>
					</Col>
				</Row>
				<Row className="bottom1">
					<Col xs={6}>
						<div className="bottom1">
							<ChartTitle chartName="CPU Usage"/>
						</div>
						<CpuGcChart dispatch={this.props.dispatch} cpuPts={cpuData.data} gcPts={gcData.data}/>
					</Col>
					<Col xs={6}>
						<div className="bottom1">
							<ChartTitle chartName="Heap Usage"/>
						</div>
						<HeapChart dispatch={this.props.dispatch} usedPts={heapUsedData.data} committedPts={heapCommittedData.data} maxPts={heapMaxData.data}/>
					</Col>
				</Row>
				{gcCharts}
				<Row className="bottom1">
					<Col xs={6}>
						<ChartTitle chartName="Class Count" bottomSpace={true}/>
						<ClassCountChart dispatch={this.props.dispatch} dataPoints={clsCount.data}/>
					</Col>
					<Col xs={6}>
						<ChartTitle chartName="Thread Count" bottomSpace={true}/>
						<ThreadCountChart dispatch={this.props.dispatch} daemonPts={daemonThreads.data} nonDaemonPts={nonDaemonThreads.data}/>
					</Col>
				</Row>
				{this.renderPoolCharts(this.heapPoolType,jvmDataList, this.props.dispatch, heapPoolNames)}
				{this.renderPoolCharts(this.nonHeapPoolType,jvmDataList, this.props.dispatch, nonHeapPoolNames)}
				<RowCol className="bottom1">
					<h3>Buffer Pools</h3>
				</RowCol>
				{this.renderBufferPoolCharts(jvmDataList, this.props.dispatch, bufferPoolNames)}
			</div>
		);
	}

	private transformDataList(jvmDataList: IDataSet[]): IDataSetMeta[]
	{
		return jvmDataList.map(it => ({
			dataSet: it,
			nameParts:it.series.key.split(".")
		}));
	}
}
