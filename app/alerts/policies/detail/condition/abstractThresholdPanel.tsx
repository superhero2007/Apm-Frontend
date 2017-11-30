import * as React from "react";
import {ThresholdConfigPanel} from "./thresholdConfigPanel";

export abstract class AbstractThresholdConfigPanel extends React.Component<{
	defaultCriticalValue?:number;
	defaultWarningValue?:number;
	defaultCriticalDuration?:number;
	defaultWarningDuration?:number;
	defaultComparison?:string;
	ref?:string;
},{}>
{
	refs:any;

	hasErrorMsg()
	{
		return this.refs.panel.hasErrorMsg();
	}

	getCriticalValue()
	{
		return this.refs.panel.criticalValue;
	}

	getWarningValue()
	{
		return this.refs.panel.warningValue;
	}

	getCriticalDuration()
	{
		return this.refs.panel.getCriticalDuration();
	}

	getWarningDuration()
	{
		return this.refs.panel.getWarningDuration();
	}

	getComparison()
	{
		return this.refs.panel.getComparison();
	}


	protected doRender (min:number, max:number, unit:string)
	{
		return <ThresholdConfigPanel defaultCriticalDuration={this.props.defaultCriticalDuration} defaultWarningDuration={this.props.defaultWarningDuration}
			defaultCriticalValue={this.props.defaultCriticalValue} defaultWarningValue={this.props.defaultWarningValue} defaultComparison={this.props.defaultComparison}
		                             min={min} max={max} unit={unit} ref="panel"/>
	}
}