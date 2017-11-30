import * as React from "react";
import {FormControl, InputGroup} from "react-bootstrap";

export class NumberInput extends React.Component<{
	min:number;
	max:number;
	defaultValue?:number;
	onValueChange:(value:number, valid:boolean)=>void;
	unitSuffix:string;
},{invalid:boolean, value:string}>
{
	constructor(props)
	{
		super(props);
		let val = "";

		if(props.defaultValue)
			val = props.defaultValue+"";

		this.state = {invalid: false, value:val};
	}

	onChange(e)
	{
		let valueStr = e.target.value;
		let valNum = Number(valueStr);

		const invalid = (valNum < this.props.min) || (valNum > this.props.max);

		this.setState({invalid:invalid, value: valueStr});
		this.props.onValueChange(valNum, !invalid);
	}

	render()
	{
		return (
			<div>
				<InputGroup>
					<FormControl type="number" value={this.state.value} min={this.props.min} max={this.props.max}  onChange={this.onChange.bind(this)}/>
					<InputGroup.Addon>{this.props.unitSuffix}</InputGroup.Addon>
				</InputGroup>
			</div>
		);
	}
}