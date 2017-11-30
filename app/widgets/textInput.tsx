import * as React from "react";
import {FormControl} from "react-bootstrap";
import {updateComponentState} from "../utils";

export class TextInput extends React.Component<{
	placeholder?: string;
	initialValue?: string;
	multiline?: boolean;
}, {
	value: string;
}>
{
	constructor(props, context)
	{
		super(props, context);

		let val = "";
		if(props.initialValue)
			val = props.initialValue;

		this.state = {value: val};
	}

	private onChange(e)
	{
		updateComponentState(this, {value: e.target.value});
	}

	getValue()
	{

		const value = this.state.value;
		if(!value)
			return "";

		return value.trim();
	}

	render()
	{
		if(this.props.multiline)
			return <FormControl componentClass="textarea"  placeholder={this.props.placeholder} onChange={this.onChange.bind(this)} value={this.state.value}/>;

		return <FormControl type="text" placeholder={this.props.placeholder} onChange={this.onChange.bind(this)} value={this.state.value}/>;
	}
}