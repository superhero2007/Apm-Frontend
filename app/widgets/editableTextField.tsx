import * as React from "react";
import {Button, OverlayTrigger, Popover, ButtonToolbar} from "react-bootstrap";
import "./editableTextField.css";

export class EditableTextField extends React.Component<{
	onUpdate:   (name:string, val:string)=>void,
	name:   string,
	value:  string,
	popupId:     string

},
	{}>
{


	refs:any;

	save()
	{
		if (this.props.onUpdate) {
			this.props.onUpdate(this.props.name, this.refs.input.value);
		}
		this.refs.overlay.hide();
	}


	cancel()
	{
		this.refs.overlay.hide();
	}


	submit(event)
	{
		event.preventDefault();
		this.save();
	}

	render()
	{
		const inputStyle = {
			"marginBottom": "5px",
			"fontSize": "14px",
			"border": "1px solid #ccc",
			"borderRadius": "4px",
			"padding": "6px 12px",
			"height": "34px",
			"boxShadow": "inset 0 1px 1px rgba(0,0,0,.075)"
		};
		var empty = this.props.value === "";
		var id = this.props.popupId !== "undefined" ? this.props.popupId : "popover";
		var linkText = empty ? 'Empty' : this.props.value;
		var linkClass = empty ? 'editable-click editable-empty' : 'editable-click';
		var popover =
			<Popover id={id}>
				<form className='form-inline' onSubmit={this.submit.bind(this)}>
					<input type='text' ref='input' defaultValue={this.props.value} style={inputStyle}/>
					<ButtonToolbar className='editable-buttons'>
						<Button bsStyle='primary' className='btn-sm' onClick={this.save.bind(this)}>
							<i className='glyphicon glyphicon-ok'/>
						</Button>
						<Button bsStyle='default' className='btn-sm' onClick={this.cancel.bind(this)}>
							<i className='glyphicon glyphicon-remove'/>
						</Button>
					</ButtonToolbar>
				</form>
			</Popover>;

		return (
			<OverlayTrigger ref='overlay' trigger='click' rootClose={true} placement='bottom' overlay={popover}>
				<a href='javascript:;' className={linkClass}>{linkText}</a>
			</OverlayTrigger>
		);
	}
}
