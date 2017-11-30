import * as React from "react";
import * as PropTypes from "prop-types";
import {Button} from "react-bootstrap";

export class CancelButton extends React.Component<{cancelUrl},{}>
{
	static contextTypes:any = {
		router: PropTypes.any.isRequired
	};

	context:any;

	constructor(props, context)
	{
		super(props, context);
	}

	private onCancel()
	{
		this.context.router.push(this.props.cancelUrl);
	}

	render()
	{
		return <Button onClick={this.onCancel.bind(this)}>Cancel</Button>
	}

}