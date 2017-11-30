import * as React from "react";
import * as _ from "lodash";
import {LoadableComponent} from "../../widgets/loadableComponent";
import {ITargetApp} from "../../alerts/policies/detail/condition/selectApp";
import {Col, Row} from "react-bootstrap";
import {ChartTitle} from "../../es/charts/chartTitle";
import {IWS_JVMVals, WebSocketManager} from "./websocket";
import {IWS_Snapshot} from "./realtime";
import {updateComponentState} from "../../utils";
import {cpuPctDisplay, errRateDisplay, nanoToMilis, responseTimeDisplay, throughputUnit} from "../../es/metricUtils";
import {IPtValues, RealtimeMetricCategoryStackedChart, RealtimeMultilineChart} from "./realtimeCharts";
import {AmplitudeAnalytics} from "../../analytics";
import {AbstractContainerPage} from "../../es/abstractContainerPage";
import {action_initESDetail, IRR_ESDETAIL, MetricCategory} from "../../reducers/esReducer";
import {JSONEncoder} from "../../es/routeobj/jsonEncoder";
import {connect} from "react-redux";
import {RowCol} from "../../widgets/rowCol";
import {AppFilters} from "../../es/filters/appFilters";
import {accountStatus} from "../../accountStatus";
import {NeedPro} from "../../widgets/needPro";
import {BillingIssue} from "../../widgets/billingIssue";
import {IESViewProps} from "../../es/esViews";
import {esDetailConnector, esDetailConnectorWithProps} from "../../reduxConnectors";
import moment = require('moment');


interface IState
{
	appList: ITargetApp[];
}


class LiveXAppPage_connect extends LoadableComponent<IESViewProps, IState>
{
	componentWillMount()
	{
		AmplitudeAnalytics.track("XApp - Live");

		const routeObj = AbstractContainerPage.getDefaultRouteObj(MetricCategory.Rest);
		const esDetail:IRR_ESDETAIL = JSONEncoder.decode(routeObj);

		this.props.dispatch(action_initESDetail(esDetail));

		super.componentWillMount();
	}

	protected getPostUrl():string
	{
		return "/alert/targetApps";
	}

	protected initialState():IState
	{
		return {appList: []};
	}

	protected getStateFromPostResponse(reponseData:any):IState
	{
		return {appList: reponseData};
	}

	protected renderContent(data:IState):any
	{
		if(!accountStatus.isPro)
		{
			return <NeedPro pageName={"Cross Application Live Data"}/>;
		}

		if(accountStatus.hasBillingIssue())
		{
			return <BillingIssue/>;
		}

		return (
			<div>
				<RowCol className="top2">
					<AppFilters appList={data.appList} />
				</RowCol>
				<RowCol>
					<LiveXAppCharts appList={data.appList}/>
				</RowCol>
			</div>
		);
	}
}


interface ISnapShot{
	[appId: string]: IWS_Snapshot;
}

interface ILiveXAppChartProps  {
	appList: ITargetApp[];
}

type IProps = ILiveXAppChartProps &IESViewProps;

class LiveXAppCharts_connect extends React.Component<IProps , {
	timerId;
}
>
{
	private webSocketManager;
	private subscriptions  = {};

	private appSeries: string[] = [];
	private layerSeries: string[] = [];
	private curSnapShot: ISnapShot = {};


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

	componentWillReceiveProps(nextProps)
	{
		const appFilter = nextProps.esDetail.appFilter;

		const appIds = this.props.appList.map(app => app.id);

		let includedApps: string[], excludedApps: string[];
		if(appFilter.isAllApps)
		{
			excludedApps = appFilter.appIds_allApps.slice(0);
			includedApps = _.difference(appIds, excludedApps);
		}
		else
		{
			includedApps = appFilter.appIds_selectedApps.slice(0);
			excludedApps = _.difference(appIds, includedApps);
		}

		this.updateSubscriptions(includedApps, excludedApps);
	}

	private updateSubscriptions(includedAppIds: string[] , excludedAppIds: string[])
	{
		const client = this.webSocketManager.client;
		if(client)
		{
			for (const includedId of includedAppIds)
			{
				if (!this.subscriptions[includedId])
				{
					this.subscribeApp(client, this.getAppForId(includedId));
				}
			}

			for(const excludedId of excludedAppIds)
			{
				if(this.subscriptions[excludedId])
				{
					this.unSubscribeApp(excludedId);
				}
			}
		}
	}

	shouldComponentUpdate(nextProps, nextState): boolean
	{
		return false;
	}

	protected onWebsocketConnect(client)
	{
		for(const app of this.props.appList)
		{
			this.subscribeApp(client, app);
		}
	}

	private subscribeApp(client, app: ITargetApp)
	{
		const subscription = client.subscribe(`/topic/dripjvm.${app.id}`, (msg) =>
		{
			const json = msg.body;
			const value:IWS_JVMVals = JSON.parse(json);
			this.onValueReceive(app, value);

		});

		this.subscriptions[app.id] = subscription;
	}

	protected onStop()
	{
		for(const appId in this.subscriptions)
		{
			const subscription = this.subscriptions[appId];
			subscription.unsubscribe();
		}

		this.subscriptions = {};
	}

	private unSubscribeApp(appId: string)
	{
		const subscription = this.subscriptions[appId];
		if(subscription)
		{
			subscription.unsubscribe();

			const charts = this.getAllCharts();

			const app = this.getAppForId(appId);
			if(app)
			{
				charts.cpuChart.removeSeries(app.label);
				charts.respTimeChart.removeSeries(app.label);
				charts.thpChart.removeSeries(app.label);
				charts.errRateChart.removeSeries(app.label);
			}
		}

		delete this.subscriptions[appId];
	}

	private isAppIncluded(appId: string)
	{
		const appFilter = this.props.esDetail.appFilter;

		if(appFilter.isAllApps)
		{
			if(appFilter.appIds_allApps.includes(appId))
				return false;

			return true;
		}
		else
		{
			if(appFilter.appIds_selectedApps.includes(appId))
				return true;

			return false;
		}

	}

	private onValueReceive(app: ITargetApp, value: IWS_JVMVals)
	{
		let perJvmVals = this.curSnapShot[app.id];

		if(!perJvmVals)
		{
			perJvmVals = {};
			this.curSnapShot[app.id] = perJvmVals;
		}

		perJvmVals[value.hs] = value;
	}


	private onTick()
	{

		const current = this.curSnapShot;
		this.curSnapShot = {};
		this.renderData(current);
	}


	private getAllCharts()
	{
		const refs = this.refs;
		return {
			respTimeChart: refs["respTimeChart"] as RealtimeMultilineChart,
			thpChart: refs["thpChart"] as RealtimeMultilineChart,
			errRateChart: refs["errRateChart"] as RealtimeMultilineChart,
			cpuChart: refs["cpuChart"] as RealtimeMultilineChart,
			layerStackChart: refs["layerStackChart"] as RealtimeMetricCategoryStackedChart
		};
	}

	private renderData(current: ISnapShot)
	{
		const time = moment().toDate();
		const respTimeChart = this.refs["respTimeChart"] as RealtimeMultilineChart;
		const thpChart = this.refs["thpChart"] as RealtimeMultilineChart;
		const errRateChart = this.refs["errRateChart"] as RealtimeMultilineChart;
		const cpuChart = this.refs["cpuChart"] as RealtimeMultilineChart;
		const layerStackChart = this.refs["layerStackChart"] as RealtimeMetricCategoryStackedChart;

		const newSeries = [];
		const newSegs = [];
		const respPoints:IPtValues  = {};
		const thpPoints:IPtValues  = {};
		const errPctPoints:IPtValues  = {};
		const cpuPctPoints:IPtValues  = {};
		const segTimes: IPtValues = {};
		let globalTotalResp = 0;
		if(thpChart)
		{
			for (const appId in current)
			{
				const jvmVals = current[appId];

				const app = this.getAppForId(appId);

				if(!this.appSeries.includes(app.label) && this.isAppIncluded(appId))
				{
					this.appSeries.push(app.label);
					newSeries.push(app.label);
				}

				let totalJvms = 0;
				let totalThp = 0;
				let totalErrCnt = 0;
				let totalResp = 0;
				let totalCpu = 0;
				for (const jvm in jvmVals)
				{
					const curValues = jvmVals[jvm];

					const values = curValues.v;
					const respTime = values[0];
					const thp = values[1];
					const errCount = values[2];
					const cpu = values[4];

					totalJvms++;
					totalThp += thp;
					totalErrCnt+=errCount;
					totalResp+= respTime;
					totalCpu+=cpu;


					const segs = curValues.s;
					if(segs)
					{
						for(const seg in segs)
						{
							segTimes[seg] = (segTimes[seg] || 0) + segs[seg];
							if(!this.layerSeries.includes(seg))
							{
								this.layerSeries.push(seg);
								newSegs.push(seg);
							}
						}
					}
				}

				globalTotalResp+=totalResp;

				const avgCpu = totalJvms? (totalCpu/totalJvms): 0;
				const errPct = totalThp? ((totalErrCnt * 100)/totalThp): 0;
				const respTime = totalThp? nanoToMilis(totalResp/totalThp): 0;

				thpPoints[app.label] = totalThp;
				errPctPoints[app.label] = errPct;
				respPoints[app.label] = respTime;
				cpuPctPoints[app.label] = avgCpu;
			}

			if(newSeries.length > 0)
			{
				respTimeChart.addSeries(newSeries);
				thpChart.addSeries(newSeries);
				errRateChart.addSeries(newSeries);
				cpuChart.addSeries(newSeries);
			}

			if(newSegs.length > 0)
			{
				layerStackChart.addSeries(newSegs);
			}

			respTimeChart.updatePoints(time, respPoints);
			thpChart.updatePoints(time, thpPoints);
			errRateChart.updatePoints(time, errPctPoints);
			cpuChart.updatePoints(time, cpuPctPoints);

			const segPcts: IPtValues = {};

			if(globalTotalResp > 0)
			{
				let totalLayerTime = 0;
				for(const seg in segTimes)
				{
					const segTotal = segTimes[seg];

					const segPct = (segTotal * 100)/globalTotalResp;

					segPcts[seg] = segPct;

					totalLayerTime+=segTotal;
				}

				if(totalLayerTime < globalTotalResp)
				{
					const javaTime = globalTotalResp - totalLayerTime;

					segPcts["Java"] = (javaTime * 100)/globalTotalResp;
				}
			}

			layerStackChart.updatePoints(time, segPcts);

		}
	}

	private getAppForId(appId: string)
	{
		for(const app of this.props.appList)
		{
			if(app.id === appId)
				return app;
		}
	}

	render()
	{
		const maxChartPts = 90;
		return (
			<div>
				<Row>
					<Col xs={12}>
						<ChartTitle chartName="% Time Spent By Layer" bottomSpace={true}/>
						<RealtimeMetricCategoryStackedChart ref="layerStackChart" maxPoints={maxChartPts} valueDisplayFunc={cpuPctDisplay} max={100}/>
					</Col>
				</Row>
				<Row>
					<Col xs={6}>
						<ChartTitle chartName={"Respone Time"} bottomSpace={true}/>
						<RealtimeMultilineChart ref="respTimeChart" valueDisplayFunc={responseTimeDisplay} maxPoints={maxChartPts} onSeriesDelete={this.onSeriesRemove.bind(this)}/>
					</Col>
					<Col xs={6}>
						<ChartTitle chartName={"Throughput"} bottomSpace={true}/>
						<RealtimeMultilineChart ref="thpChart" valueDisplayFunc={throughputUnit} maxPoints={maxChartPts} onSeriesDelete={this.onSeriesRemove.bind(this)}/>
					</Col>
				</Row>
				<Row>
					<Col xs={6}>
						<ChartTitle chartName={"Error Rate"} bottomSpace={true}/>
						<RealtimeMultilineChart ref="errRateChart" valueDisplayFunc={errRateDisplay} maxPoints={maxChartPts} onSeriesDelete={this.onSeriesRemove.bind(this)}/>
					</Col>
					<Col xs={6}>
						<ChartTitle chartName={"CPU"} bottomSpace={true}/>
						<RealtimeMultilineChart ref="cpuChart" valueDisplayFunc={cpuPctDisplay} maxPoints={maxChartPts} onSeriesDelete={this.onSeriesRemove.bind(this)}/>
					</Col>
				</Row>
			</div>
		);
	}

	private onSeriesRemove(series:string)
	{
		this.appSeries = _.without(this.appSeries, series);
	}

}

export const LiveXAppPage = connect((state)=> esDetailConnector(state))(LiveXAppPage_connect);
const LiveXAppCharts = connect((state, props: ILiveXAppChartProps) => esDetailConnectorWithProps(state, props))(LiveXAppCharts_connect);
