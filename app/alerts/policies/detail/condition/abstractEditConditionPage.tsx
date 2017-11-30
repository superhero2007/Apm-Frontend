import * as React from "react";
import {RoutableLoadableComponent} from "../../../../widgets/routableLoadableComponent";
import {PolicyURLGen} from "../../policyLinkUtils";
import {PercentageThresholdConfigPanel} from "./percentageThesholdConfigPanel";
import {ITargetApp} from "./selectApp";
import {getRouteParam} from "../../../../utils";
import {MetricDefinition} from "./metricTypes";
import {Http} from "../../../../http";
import {ThresholdComparison} from "../conditionsPage";
import {IHostId} from "../../../../reducers/serverPageReducer";
import {IConditionTargetSelectionPanel} from "./targetSelectionPanel";

export interface IState
{
	errMsg:string,
	posting: boolean;
	enabled: boolean;
}
export abstract class AbstractEditConditionForMetricPage<P> extends RoutableLoadableComponent<P,IState>
{
	constructor(props, context)
	{
		super(props, context);
	}

	refs:any;

	protected appList: ITargetApp[];
	protected hostList: IHostId[];
	protected targetPanel: IConditionTargetSelectionPanel ;

	protected initialState():IState
	{
		return {errMsg: null, posting: false, enabled: true};
	}


	protected redirectToConditionList()
	{
		const url = PolicyURLGen.createUrlForPolicyId(this.props, "conditions");
		this.context.router.push(url);
	};

	private validate():IState
	{
		const panel: PercentageThresholdConfigPanel = this.refs.thresholdPanel;

		let err = null;
		if (panel.hasErrorMsg()) {
			err = "Please correct violation threshold values and try again";
		}

		if (!err && this.targetPanel) {
			err = this.targetPanel.validate();
		}

		let posting = (err === null);
		let state =  {errMsg: err, posting: posting, enabled: this.getMyState().enabled};
		this.updateMyState(state);
		return state;
	};

	private postData(url)
	{
		let data = this.collectDataForPost();

		Http.postJSON(url, data).then(()=>{
			this.redirectToConditionList();
		});
	}

	onSave(url)
	{
		let state = this.validate();
		if(state.posting)
		{
			this.postData(url);
		}
	}


	protected renderErrMsg(data:IState)
	{
		let err = null;
		if (data.errMsg) {
			err = <h5 className="errMsg">{data.errMsg}</h5>;
		}
		return err;
	};

	private collectDataForPost()
	{
		const panel: PercentageThresholdConfigPanel = this.refs.thresholdPanel;

		return {
			conditionId:    this.getConditionId(),
			policyId:       getRouteParam(this.props, "policyId"),
			metricId:       this.getCurrentMetric().id,
			targetData:     this.collectTargetData(),
			criticalValue:  panel.getCriticalValue(),
			criticalDuration:   panel.getCriticalDuration(),
			warningValue:       panel.getWarningValue(),
			warningDuration:    panel.getWarningDuration(),
			enabled:        this.getMyState().enabled,
			comparisonType: ThresholdComparison.displayStrToEnum(panel.getComparison())
		};
	};

	protected collectTargetData()
	{
		if(this.targetPanel)
			return this.targetPanel.getData();
		return null;
	}

	protected abstract getCurrentMetric():MetricDefinition;

	protected getConditionId()
	{
		return 0;
	}

}
