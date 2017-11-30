import * as React from "react";
import {CSSProperties} from "react";
import {Button, ButtonToolbar, Col, FormControl, FormGroup, Grid, Radio, Row} from "react-bootstrap";
import * as Select from "react-select";
import {Option, ReactSelectClass} from "react-select";
import "react-select/dist/react-select.css";
import {PolicyURLGen} from "../../policyLinkUtils";
import {RoutableLoadableComponent} from "../../../../widgets/routableLoadableComponent";
import {policyDetail_extractPolicyId} from "../policyDetailPage";
import * as _ from "lodash";
import {RowCol} from "../../../../widgets/rowCol";
import {AlertConditionProperties, AlertMetricType, MetricDefinition, TargetType} from "./metricTypes";
import {IAddConditionParams, IConditionData, IExtSvcData, IPinnedTxnData} from "./addConditionForMetric";
import {JSONEncoder} from "../../../../es/routeobj/jsonEncoder";

interface IPinnedTxn
{
	txnId: number;
	name: string;
	appId: string;
}

interface IState
{
	selectedMetricType:AlertMetricType;
	selectedTarget: TargetType;
	extSvcName: string;
	txn:IPinnedTxn;
	errMsg: string;
}
export class AddConditionPage extends RoutableLoadableComponent<{},IState>
{
	private pinnedTxns:IPinnedTxn[] = [];

	protected initialState():IState
	{
		return {selectedMetricType: AlertMetricType.HEAP, selectedTarget: TargetType.JVM, extSvcName: "", txn: null, errMsg: null};
	}

	protected getPostUrl():string
	{
		return "/pin/list/all";
	}

	protected getPostData():any
	{
		return policyDetail_extractPolicyId(this.props);
	}

	protected getStateFromPostResponse(reponseData:any):IState
	{
		this.pinnedTxns = reponseData;
		return this.initialState();
	}

	private getMetricDefsForTarget(target:TargetType): MetricDefinition[]
	{
		return AlertConditionProperties.metricDefinitions.filter(def => def.target === target);
	}

	private onTargetChange(e)
	{
		const targetType = Number(e.currentTarget.value);
		this.update_myStateProps({selectedTarget: targetType, selectedMetricType: this.getMetricDefsForTarget(targetType)[0].metric});
	}

	private onMetricSelection(selectedMetricOption:Option)
	{
		this.update_myStateProps({selectedMetricType: Number(selectedMetricOption.value)});
	}

	private onExtSvcNameChange(e)
	{
		const name = e.currentTarget.value;
		this.update_myStateProps({extSvcName: name});
	}

	private onTxnSelect(txnOption:Option)
	{
		const txnId = Number(txnOption.value);
		const txn = this.pinnedTxns.find(it => it.txnId === txnId);

		this.update_myStateProps({txn: txn});
	}

	private validate()
	{
		const data = this.getMyState();
		if(data.selectedTarget === TargetType.EXT_SVC)
		{
			const svcName = data.extSvcName.trim();
			if(_.isEmpty(svcName))
				return "Need a valid External Service name";
		}
		else if(data.selectedTarget === TargetType.TXN)
		{
			if(data.txn === null)
			{
				return "Need to select a Pinned Transaction";
			}
		}

		return null;
	}

	protected renderContent(data:IState):any
	{

		const Select2: any = Select;
		const Select3: ReactSelectClass = Select2;

		const style = {
			padRow: {
				"marginTop": "4em"
			},
			padLittle: {
				"marginTop": "1em"
			},
			targets: {
				"display": "flex",
				"flexDirection": 'row',
				"justifyContent": "space-around"
			} as CSSProperties
		};

		const metricDefs = this.getMetricDefsForTarget(data.selectedTarget);
		const availableMetrics = metricDefs.map(m=> ({value: m.metric.toString(), label: m.metricName()}));
		const selectedMetric = availableMetrics.find(it=> it.value === data.selectedMetricType.toString());


		let svcNameBox = null;
		if(data.selectedTarget === TargetType.EXT_SVC)
		{
			svcNameBox = (
				<div>
					<RowCol className="top2">
						<h5>3. External Service name:</h5>
					</RowCol>
					<RowCol xs={6}>
						<FormControl type="text" value={data.extSvcName} onChange={this.onExtSvcNameChange.bind(this)}/>
					</RowCol>
				</div>
			);
		}

		let txnSelection = this.renderTxnSelection(data);

		let err = null;
		if(data.errMsg)
		{
			err = (
				<div className="top1 errMsg">
					<h5>{data.errMsg}</h5>
				</div>
			);
		}

		return (
			<Grid>
				<h3  style={style.padRow}>Add Alert Condition</h3>
				<RowCol style={style.padLittle}>
					<h5>1. Select Target:</h5>
				</RowCol>
				<Row>
					<Col xs={8}>
						<div style={style.targets}>
						{
							AlertConditionProperties.targets.map(
								tgt => <FormGroup key={tgt.type}><Radio value={tgt.type.toString()} checked={data.selectedTarget===tgt.type} onChange={this.onTargetChange.bind(this)}>{tgt.name}</Radio></FormGroup>)
						}
						</div>
					</Col>
				</Row>
				<Row className="verticalAlign top1">
					<Col xs={2}>
						<h5>2. Select Metric:</h5>
					</Col>
					<Col xs={4}>
						<Select3
							name="metricselect"
							value={selectedMetric}
						    options={availableMetrics}
							onChange={this.onMetricSelection.bind(this)}
							clearable={false}
							searchable={false}
							/>
					</Col>
				</Row>

				{svcNameBox}
				{txnSelection}

				<Row style={style.padRow}>
					<Col xs={2}>
						<ButtonToolbar>
							<Button onClick={this.onCancel.bind(this)}>Cancel</Button>
							<Button onClick={this.onNext.bind(this)} bsStyle="success" disabled={data.selectedMetricType==null}>Next</Button>
						</ButtonToolbar>
					</Col>
				</Row>
				{err}
			</Grid>);
	}

	private renderTxnSelection(data:IState)
	{
		if (data.selectedTarget === TargetType.TXN) 
		{
			if (this.pinnedTxns.length == 0)
			{
				const style = {
					color: "#AB0A0A"
				};
				return (
					<div className="top2" style ={style} >
						<h5>No Pinned Transactions.</h5>
						<h5><i>Pin</i> a transaction to allow placing alert conditions on it.</h5>
					</div>
				);
			}
			const txnOptions = this.pinnedTxns.map(txn => ({value: txn.txnId.toString(), label: txn.name}));

			let selectedTxn = null;

			if (data.txn != null)
			{
				selectedTxn = txnOptions.find(it => it.value === data.txn.txnId.toString());
			}


			const Select2: any = Select;
			const Select3: ReactSelectClass = Select2;

			return (
				<div>
					<RowCol className="top2">
						<h5>3. Pinned Transaction:</h5>
					</RowCol>
					<RowCol xs={6}>
						<Select3
							name="txnSelect"
							value={selectedTxn}
							options={txnOptions}
							onChange={this.onTxnSelect.bind(this)}
							clearable={false}
							searchable={true}
							placeholder="Select a Transaction..."
						/>
					</RowCol>
				</div>
			);
		}
		return null;
	}


	onCancel()
	{
		const url = PolicyURLGen.createUrlForPolicyId(this.props, "conditions");
		this.context.router.push(url);
	}

	onNext()
	{
		const errMsg = this.validate();
		if(errMsg!=null)
		{
			this.update_myStateProps({errMsg: errMsg});
			return;
		}
		const myState = this.getMyState();

		let data:IConditionData = null;
		if(myState.selectedTarget === TargetType.EXT_SVC)
		{
			data = {
				svcName: myState.extSvcName.trim()
			} as IExtSvcData
		}
		else if(myState.selectedTarget === TargetType.TXN)
		{
			data = {
				txnId:  myState.txn.txnId,
				appId:  myState.txn.appId,
				name:   myState.txn.name
			} as IPinnedTxnData;
		}
		
		const params:IAddConditionParams = {
			target: myState.selectedTarget,
			metric: myState.selectedMetricType,
			data: data
		};

		const paramsJSON = JSONEncoder.encode(params);
		const url = PolicyURLGen.createUrlForPolicyId(this.props, `addConditionForMetric/${paramsJSON}`);
		this.context.router.push(url);
	}

}