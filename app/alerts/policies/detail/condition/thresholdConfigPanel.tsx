import * as React from "react";
import * as _ from "lodash";
import {Row, Col, Panel} from "react-bootstrap";
import {NumberInput} from "./../../../../widgets/numberInput";
import * as Select from "react-select";
import {ReactSelectClass, Option} from "react-select";
import "./thresholdConfigPanel.css";

export class ThresholdConfigPanel extends React.Component<{
	defaultCriticalValue?:number;
	defaultWarningValue?:number;
	defaultCriticalDuration?:number;
	defaultWarningDuration?:number;
	defaultComparison?: string;
	ref?:string;
	min: number;
	max: number;
	unit:string;
},{errMsg:string; criticalDuration:number; warningDuration:number, comparison: string}>
{


	criticalValue:number;
	warningValue:number;
	private criticalValid = true;
	private warningValid = true;


	constructor(props)
	{
		super(props);

		let criticalDuration = 1, warningDuration = 1;

		if(props.defaultCriticalDuration)
		{
			criticalDuration = props.defaultCriticalDuration;
		}

		if(props.defaultWarningDuration)
		{
			warningDuration = props.defaultWarningDuration;
		}

		if (props.defaultCriticalValue) {
			this.criticalValue = props.defaultCriticalValue;
		}

		if (props.defaultWarningValue) {
			this.warningValue = props.defaultWarningValue;
		}

		let comp = ">=";
		if(props.defaultComparison)
		{
			comp = props.defaultComparison;
		}

		this.state = {errMsg: null, criticalDuration: criticalDuration, warningDuration: warningDuration, comparison: comp};
	}


	getCriticalDuration()
	{
		return this.state.criticalDuration;
	}

	getWarningDuration()
	{
		return this.state.warningDuration;
	}

	getComparison()
	{
		return this.state.comparison;
	}

	private onComparisonChange(e: Option)
	{
		const errMsg = this.validate(e.value);
		this.setState(Object.assign({}, this.state, {comparison: e.value, errMsg: errMsg}));
	}

	private onCriticalValueChange(value:number, valid:boolean)
	{
		this.criticalValue = value;
		this.criticalValid = valid;
		const errMsg = this.validate(this.state.comparison);
		this.setErrMsgState(errMsg);
	}

	private onWarningValueChange(value:number, valid:boolean)
	{
		this.warningValue = value;
		this.warningValid = valid;
		const errMsg = this.validate(this.state.comparison);
		this.setErrMsgState(errMsg);
	}

	hasErrorMsg()
	{
		var hasErr = false;
		if (this.state.errMsg) {
			hasErr = true;
		}
		else {
			var err = null;
			if (_.isUndefined(this.criticalValue) || this.criticalValue <= 0)
			{
				if(this.criticalValue <= 0)
					err = "Enter a value greater than 0 for Critical Violation Threshold";
				else
					err = "Enter a valid value for Critical Violation Threshold";
			}
			else if (_.isUndefined(this.warningValue) || this.warningValue <= 0) {
				if(this.warningValue <= 0)
					err = "Enter a value greater than 0 for Warning Violation Threshold";
				else
					err = "Enter a valid value for Warning Violation Threshold";
			}


			if (err != null) {
				this.setErrMsgState(err);
				hasErr = true;
			}
		}

		return hasErr;
	}

	private setErrMsgState(err:any)
	{
		this.setState(Object.assign({}, this.state, {errMsg: err}));
	};


	private validate(comparison)
	{
		let errMsg = null;
		if (!this.warningValid || !this.criticalValid) {
			errMsg = "Invalid value";
		}
		else {
			if (this.criticalValue > 0 && this.warningValue > 0) {
				const comp = comparison;
				if(comp === ">" || comp === ">=")
				{
					if (this.warningValue >= this.criticalValue)
					{
						errMsg = "Warning value must be lower than Critical value";
					}
				}
				else
				{
					if (this.warningValue <= this.criticalValue)
					{
						errMsg = "Warning value must be greater than Critical value";
					}
				}
			}
		}

		return errMsg;

	}

	private static getDurationOptions()
	{
		let options = [];
		for (var i = 1; i <= 10; i++) {
			options.push({label: i, value: i})
		}

		return options;
	}

	private static getComparisonOptions()
	{
		const comps = [">=",">","<=","<"];

		return comps.map(c => ({label:c, value:c}));
	}

	private onCriticalDurationChange(e:Option)
	{
		this.setState(Object.assign({}, this.state, {criticalDuration: Number(e.value)}));
	}

	private onWarningDurationChange(e:Option)
	{
		this.setState(Object.assign({}, this.state, {warningDuration: Number(e.value)}));
	}

	render()
	{
		let style = {
			critical: {
				color: "rgba(187, 42, 7, 0.97)"
			},
			warning: {
				color: "rgba(234, 146, 8, 0.91)"
			}
		};
		var err = null;
		if (this.state.errMsg) {
			err = <div>
				<h5 className="errMsg">{this.state.errMsg}</h5>
			</div>;
		}

		let Select2:any = Select;
		let Select3:ReactSelectClass = Select2;

		return (<Panel header="Set thresholds" className="thresholdPanel">
			<Row className="verticalAlign top1">
				<Col xs={3}>
					<b>Create Violation when value is</b>
				</Col>
				<Col xs={1}>
					<div className="comparisonSelect">
						<Select3
							name="comparisonType"
							value={{value: this.state.comparison, label: this.state.comparison} as any}
							options={ThresholdConfigPanel.getComparisonOptions()}
							clearable={false}
							searchable={false}
							multi={false}
							onChange={this.onComparisonChange.bind(this)}
						/>
					</div>
				</Col>
			</Row>
			<Row className="verticalAlign top1">
				<Col xs={3}>
					<i className="fa fa-exclamation-circle" style={style.critical}/>
					<b>{"  "}Critical Violation Threshold</b>
				</Col>

				<Col xs={2} >
					<div className="noBSFormMargin">
						<NumberInput defaultValue={this.props.defaultCriticalValue} min={this.props.min}
					             max={this.props.max} onValueChange={this.onCriticalValueChange.bind(this)}
					             unitSuffix={this.props.unit} />
					</div>
				</Col>
				<Col xs={2}>
					average for
				</Col>
				<Col xs={1}>
						<Select3
							name="criticalDuration"
							value={{value: this.state.criticalDuration, label: this.state.criticalDuration} as any}
							options={ThresholdConfigPanel.getDurationOptions()}
							clearable={false}
							searchable={false}
							multi={false}
							onChange={this.onCriticalDurationChange.bind(this)}
						    />
				</Col>
				<Col xs={1}>
					<div>minute(s)</div>
				</Col>


			</Row>

			<Row className="verticalAlign top2">
				<Col xs={3}>
					<i className="fa fa-exclamation-triangle" style={style.warning}/>
					<b>{"  "}Warning Violation Threshold</b>
				</Col>
				<Col xs={2}>
					<div className="noBSFormMargin">
						<NumberInput defaultValue={this.props.defaultWarningValue} min={this.props.min} max={this.props.max}
					             onValueChange={this.onWarningValueChange.bind(this)} unitSuffix={this.props.unit}/>
					</div>
				</Col>


				<Col xs={2}>
					average for
				</Col>
				<Col xs={1}>
					<Select3
						name="warningDuration"
						value={{value: this.state.warningDuration, label: this.state.warningDuration} as any}
						options={ThresholdConfigPanel.getDurationOptions()}
						clearable={false}
						searchable={false}
						multi={false}
						onChange={this.onWarningDurationChange.bind(this)}
					/>
				</Col>
				<Col xs={1}>
					<div>minute(s)</div>
				</Col>
			</Row>

			{err}
		</Panel>);
	}

}