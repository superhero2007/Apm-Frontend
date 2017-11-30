import * as React from "react";
import {Grid, Button, ButtonToolbar, Panel} from "react-bootstrap";
import {MetricDefUtils, MetricDefinition, TargetType, AlertMetricType, AlertConditionProperties} from "./metricTypes";
import {getRouteParam} from "../../../../utils";
import {ITargetApp} from "./selectApp";
import {AppTargetSelectionPanel, ServerTargetSelectionPanel} from "./targetSelectionPanel";
import {IState, AbstractEditConditionForMetricPage} from "./abstractEditConditionPage";
import {JSONEncoder} from "../../../../es/routeobj/jsonEncoder";
import {ServerSeriesUtils} from "../../../../server/serverCommons";

export interface IConditionData {}

export interface IExtSvcData extends IConditionData
{
	svcName: string;
}

export interface IPinnedTxnData extends IConditionData
{
	name: string;
	txnId: number;
	appId: string;
}
export interface IAddConditionParams
{
	target: TargetType,
	metric: AlertMetricType,
	data: IConditionData;
}

export class AddConditionForMetricPage extends AbstractEditConditionForMetricPage<{}>
{

	protected getPostUrl():string
	{
		const metricDefinition = this.getCurrentMetric();
		if(metricDefinition.target === TargetType.SERVER)
		{
			return "/servers/listSimple";
		}

		return "/alert/targetApps";
	}

	protected getStateFromPostResponse(reponseData):IState
	{
		const metricDefinition = this.getCurrentMetric();
		if(metricDefinition.target === TargetType.SERVER)
		{
			this.hostList = reponseData;
			ServerSeriesUtils.labelHosts(this.hostList);
		}
		else
		{
			this.appList = reponseData;
		}
		return this.initialState();
	}

	private onCancel()
	{
		this.redirectToConditionList();
	}

	private onNext()
	{
		this.onSave("/alert/policy/conditions/add");
	}

	protected getCurrentMetric(): MetricDefinition
	{
		const conditionParams = this.conditionParams();
		return AlertConditionProperties.getMetricDef(conditionParams.target, conditionParams.metric);
	}

	private conditionParams(): IAddConditionParams
	{
		const jsonData = getRouteParam(this.props, "jsonData");
		return JSONEncoder.decode(jsonData);
	}

	private renderThresholdPanel(metric:MetricDefinition)
	{
		const Panel = MetricDefUtils.getThresholdConfigPanel(metric);

		return <Panel ref="thresholdPanel"/>;
	}

	private heading(metric: MetricDefinition, data: IAddConditionParams)
	{
		let dataLabel = null;
		if(data.target === TargetType.EXT_SVC)
		{
			dataLabel = (data.data as IExtSvcData).svcName;
		}
		else if(data.target === TargetType.TXN)
		{
			dataLabel = (data.data as IPinnedTxnData).name;
		}

		if(dataLabel)
		{
			return `${metric.label()}: ${dataLabel}`;
		}

		return metric.label();
	}


	protected collectTargetData():any
	{
		const conditionParams:IAddConditionParams = this.conditionParams();

		const metricDefinition = this.getCurrentMetric();
		if(metricDefinition.target === TargetType.EXT_SVC)
		{
			const targetData = super.collectTargetData();
			targetData.extSvcName =  (conditionParams.data as IExtSvcData).svcName;
			return targetData;
		}
		else if(metricDefinition.target === TargetType.TXN)
		{
			const txnData = conditionParams.data as IPinnedTxnData;
			return {
					txnId: txnData.txnId,
					txnName: txnData.name,
					txnAppId: txnData.appId
				};
		}
		return super.collectTargetData();
	}

	protected renderContent(data:IState)
	{
		const conditionParams:IAddConditionParams = this.conditionParams();

		let metric = this.getCurrentMetric();

		let targetSelection = null;
		if(metric.target !== TargetType.TXN)
		{
			if(metric.target === TargetType.SERVER)
			{
				targetSelection = <ServerTargetSelectionPanel itemList={this.hostList} ref={(p) => this.targetPanel = p}/>;
			}
			else
			{
				targetSelection = <AppTargetSelectionPanel itemList={this.appList} ref={(p) => this.targetPanel = p}/>;
			}
		}

		return (<Grid>
			<h4>{this.heading(metric, conditionParams)}</h4>
			{this.renderThresholdPanel(metric)}

			{targetSelection}
			<ButtonToolbar>
				<Button onClick={this.onCancel.bind(this)}>Cancel</Button>
				<Button onClick={this.onNext.bind(this)} bsStyle="success" disabled={data.posting}>Save</Button>
			</ButtonToolbar>
			{this.renderErrMsg(data)}
		</Grid>)
	}

}
