import * as React from "react";
import * as classNames from "classnames";
import {updateComponentState} from "../utils";


export class InlineInputEditor extends React.Component<{
	value: string;
	loading: boolean;
	onChange: (newVal:string)=>void;
	validate: (newVal:string)=>boolean;
}, {
	editing: boolean;
	invalid: boolean;
}>
{
	constructor(props, context)
	{
		super(props, context);

		this.state = {editing: false, invalid: false};
	}

	private startEditing()
	{
		updateComponentState(this, {editing: true});
	}

	private finishEditing()
	{
		const input = this.refs["input"] as any;
		const value = input.value.trim();

		if(this.props.validate(value))
		{
			updateComponentState(this, {editing: false, invalid: false});
			this.props.onChange(value);
		}
		else
		{
			updateComponentState(this, {invalid: true});
		}
	}

	private cancelEditing()
	{
		updateComponentState(this, {editing: false, invalid: false});
	}

	private keyDown(event)
	{
		if (event.keyCode === 13) // Enter
		{
			this.finishEditing()
		}
		else if (event.keyCode === 27) // Escape
		{
			this.cancelEditing()
		}
	}

	private renderNormalComponent()
	{
		return (
			<span tabIndex={0} onFocus={this.startEditing.bind(this)} onClick={this.startEditing.bind(this)} className="inlineEditable">
			{this.props.value}
			</span>
		);
	}


	private renderEditingComponent()
	{
		return (
			<input
				disabled={this.props.loading}
				defaultValue={this.props.value}
				onBlur={this.cancelEditing.bind(this)}
				onKeyDown={this.keyDown.bind(this)}
				className={classNames({"inlineEditableInvalid": this.state.invalid})}
				ref="input"
				autoFocus
			/>
		);
	}

	render()
	{
		if (this.state.editing || this.props.loading)
			return this.renderEditingComponent();
		else
			return this.renderNormalComponent();
	}
}