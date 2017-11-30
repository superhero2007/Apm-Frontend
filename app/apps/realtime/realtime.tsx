import * as React from "react";
import * as _ from "lodash";
import {byteDisplay, cpuPctDisplay, throughputUnit, responseTimeDisplay, nanoToMilis} from "../../es/metricUtils";
import {updateComponentState} from "../../utils";
import {Loading} from "../../widgets/loading";
import {Row, Col} from "react-bootstrap";
import {ChartTitle} from "../../es/charts/chartTitle";
import {RealtimeMultilineChart, IPtValues, RealtimeThpStackedChart, RealtimeMetricCategoryStackedChart} from "./realtimeCharts";
import moment = require('moment');
import Highcharts = require('highcharts');
import ReactHighCharts = require('react-highcharts');
import {IWS_JVMVals, WebSocketManager} from "./websocket";


export interface IWS_Snapshot
{
	[jvmName: string]:IWS_JVMVals;
}

export class RealtimePage extends React.Component<{
	appId: string;
}, {
	timerId;
	loading: boolean;
	cantLoad: boolean;
}>
{
	private jvms:string[] = [];
	private respSegments = [];

	private snapshot_current: IWS_Snapshot = {};

	private webSocketManager: WebSocketManager;

	private websocketSubscription;

	private tickOnLoading = 0;


	constructor(props, context)
	{
		super(props, context);
		this.state = {timerId: null, loading: true, cantLoad: false};
	}


	componentWillMount()
	{
		this.webSocketManager = new WebSocketManager(this.onWebsocketConnect.bind(this), this.onStop.bind(this));
		this.webSocketManager.setup();


		const timerId  = setInterval(this.onTick.bind(this), 2000);
		updateComponentState(this, {timerId: timerId});
	}

	componentWillUnmount()
	{
		clearInterval(this.state.timerId);
		this.webSocketManager.stop();
	}
	shouldComponentUpdate(nextProps, nextState): boolean
	{
		if(_.isEqual(this.props, nextProps) && _.isEqual(this.state, nextState))
		{
			return false;
		}
		return true;
	}

	private onSeriesRemove(series:string)
	{
		this.jvms = _.without(this.jvms, series);
	}

	private onTick()
	{
		if(this.state.loading)
		{
			this.tickOnLoading++;

			if(this.tickOnLoading > 2)
			{
				updateComponentState(this, {cantLoad: true});
			}

			return;
		}


		const current = this.snapshot_current;
		this.snapshot_current = {};
		RealtimePage.renderData(current, this.refs, this.jvms, this.respSegments);
	}

	private static renderData(current:IWS_Snapshot, refs, jvms:string[], respSegments)
	{

		const time = moment().toDate();
		const heapChart = refs["heapChart"] as RealtimeMultilineChart;
		const cpuChart = refs["cpuChart"] as RealtimeMultilineChart;
		const gcChart = refs["gcChart"] as RealtimeMultilineChart;
		const thpChart = refs["thpChart"] as RealtimeMultilineChart;
		const errChart = refs["errChart"] as RealtimeMultilineChart;
		const respChart = refs["respChart"] as RealtimeMultilineChart;
		const thpStackChart = refs["thpStackChart"] as RealtimeThpStackedChart;
		const respStackChart = refs["respStackChart"] as RealtimeMetricCategoryStackedChart;


		if (heapChart)
		{
			const newSeries = [];
			const newSegs = [];
			const newHeapPoints: IPtValues = {};
			const newCPUPoints: IPtValues = {};
			const newGCPoints: IPtValues = {};
			const newThpPoints: IPtValues = {};
			const newErrPoints: IPtValues = {};
			const newRespPoints: IPtValues = {};
			const segTotals: IPtValues = {};

			let totalThp = 0, totalErr = 0, totalResp = 0;

			for (const jvm in current)
			{
				const curValues = current[jvm];
				if (!jvms.includes(jvm))
				{
					newSeries.push(jvm);
					jvms.push(jvm);
				}

				const segs = curValues.s;
				if (segs)
				{
					for (const seg in segs)
					{
						segTotals[seg] = (segTotals[seg] || 0) + segs[seg];
						if (!respSegments.includes(seg))
						{
							newSegs.push(seg);
							respSegments.push(seg);
						}
					}
				}

				const values = curValues.v;
				const respTime = values[0];
				const thp = values[1];
				const errCount = values[2];

				newHeapPoints[jvm] = values[3];
				newCPUPoints[jvm] = values[4];
				newGCPoints[jvm] = values[5];
				newThpPoints[jvm] = thp;
				newErrPoints[jvm] = errCount;
				newRespPoints[jvm] = thp ? nanoToMilis(respTime / thp) : 0;

				totalThp += thp;
				totalErr += errCount;
				totalResp += respTime;
			}

			if (newSeries.length > 0)
			{
				heapChart.addSeries(newSeries);
				cpuChart.addSeries(newSeries);
				gcChart.addSeries(newSeries);
				thpChart.addSeries(newSeries);
				errChart.addSeries(newSeries);
				respChart.addSeries(newSeries);
			}

			if (newSegs.length > 0)
			{
				respStackChart.addSeries(newSegs);
			}

			heapChart.updatePoints(time, newHeapPoints);
			cpuChart.updatePoints(time, newCPUPoints);
			gcChart.updatePoints(time, newGCPoints);
			thpChart.updatePoints(time, newThpPoints);
			errChart.updatePoints(time, newErrPoints);
			respChart.updatePoints(time, newRespPoints);
			thpStackChart.updatePoints(time, totalThp - totalErr, totalErr);

			const segTimes: IPtValues = {};
			if (totalThp > 0 && totalResp > 0)
			{
				const avgTime = totalResp / totalThp;
				let javaTime = avgTime;
				for (const seg in segTotals)
				{
					const segTime = segTotals[seg];

					const segPct = (segTime * 100) / totalResp;
					const segAvgTime = (segPct * avgTime) / 100;
					javaTime -= segAvgTime;
					segTimes[seg] = nanoToMilis(segAvgTime);
				}

				if(javaTime < 0)
					javaTime = 0;

				segTimes["Java"] = nanoToMilis(javaTime);
			}
			else
			{
				segTimes["Java"] = 0;
			}
			respStackChart.updatePoints(time, segTimes);
		}
	}


	protected onWebsocketConnect(client)
	{
		this.websocketSubscription = client.subscribe(`/topic/dripjvm.${this.props.appId}`, (msg) =>
		{
			const json = msg.body;
			const value:IWS_JVMVals = JSON.parse(json);

			this.snapshot_current[value.hs] = value;
			if(this.state.loading)
			{
				updateComponentState(this, {loading: false});
			}
		});
	}

	protected onStop()
	{
		if (this.websocketSubscription)
		{
			this.websocketSubscription.unsubscribe();
			this.websocketSubscription = null;
		}
	}

	render()
	{
		if (this.state.loading)
		{
			if(this.state.cantLoad)
			{
				return (
					<div>
						<h3>No Live Data feed found</h3>
						<h4>Ensure you are running Agent 9 or higher</h4>
						<h4>Read <a href="https://chronon.atlassian.net/wiki/display/DRIP/LIVE+Dashboard" target="_blank">documentation</a></h4>
					</div>
				);
			}

			return (
				<div>
					<h3>{"Starting Live Data Feed.."}</h3>
					<Loading/>
				</div>
			);
		}

		const maxChartPts = 60;
		return (
			<div>
				<Row>
					<Col xs={6}>
						<ChartTitle chartName="Response Time" bottomSpace={true}/>
						<RealtimeMetricCategoryStackedChart ref="respStackChart" maxPoints={maxChartPts} valueDisplayFunc={responseTimeDisplay}/>
					</Col>
					<Col xs={6}>
						<ChartTitle chartName="Throughput" bottomSpace={true}/>
						<RealtimeThpStackedChart ref="thpStackChart" maxPoints={maxChartPts} valueDisplayFunc={throughputUnit}/>
					</Col>
				</Row>
				<Row>
					<Col xs={4}>
						<ChartTitle chartName="Response Time" bottomSpace={true}/>
						<RealtimeMultilineChart ref="respChart" valueDisplayFunc={responseTimeDisplay} maxPoints={maxChartPts} onSeriesDelete={this.onSeriesRemove.bind(this)}/>
					</Col>
					<Col xs={4}>
						<ChartTitle chartName="Throughput" bottomSpace={true}/>
						<RealtimeMultilineChart ref="thpChart" valueDisplayFunc={throughputUnit} maxPoints={maxChartPts} onSeriesDelete={this.onSeriesRemove.bind(this)}/>
					</Col>
					<Col xs={4}>
						<ChartTitle chartName="Error Count" bottomSpace={true}/>
						<RealtimeMultilineChart ref="errChart" valueDisplayFunc={throughputUnit} maxPoints={maxChartPts} onSeriesDelete={this.onSeriesRemove.bind(this)}/>
					</Col>
				</Row>
				<Row>
					<Col xs={4}>
						<ChartTitle chartName="Heap" bottomSpace={true}/>
						<RealtimeMultilineChart ref="heapChart" valueDisplayFunc={byteDisplay} maxPoints={maxChartPts} onSeriesDelete={this.onSeriesRemove.bind(this)}/>
					</Col>
					<Col xs={4}>
						<ChartTitle chartName="CPU" bottomSpace={true}/>
						<RealtimeMultilineChart ref="cpuChart" valueDisplayFunc={cpuPctDisplay} maxPoints={maxChartPts} onSeriesDelete={this.onSeriesRemove.bind(this)}/>
					</Col>
					<Col xs={4}>
						<ChartTitle chartName="GC Pause" bottomSpace={true}/>
						<RealtimeMultilineChart ref="gcChart" valueDisplayFunc={responseTimeDisplay} maxPoints={maxChartPts} onSeriesDelete={this.onSeriesRemove.bind(this)}/>
					</Col>
				</Row>

			</div>
		);
	}
}


