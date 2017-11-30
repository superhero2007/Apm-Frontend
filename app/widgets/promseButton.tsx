import * as React from 'react';
import {Button, Sizes} from 'react-bootstrap';


export class PromiseButton extends React.Component< {
	text            :string;
	promiseCreator  :()=>Promise<any>;
	onPromiseDone   :(data:any)=>void;
	onPromiseErr?   :(data:any)=>void;
	bsStyle?        :string;
	bsSize?         :Sizes;
},{
	disabled    :boolean;
}>
{
	private unmounted = false;
	constructor(props)
	{
		super(props);
		this.state = {disabled :false};
	}

	private onClick(e)
	{
		this.setState({disabled:true});

		const promise = this.props.promiseCreator();

		if(promise!=null) {
			promise.then((data)=>
			{
				this.onDone(data, false);
			}, (err)=> {
				this.onDone(err, true);
			});
		}   else
		{
			this.setState({disabled: false});
		}

	}

	private onDone(data, err:boolean)
	{
		if (!this.unmounted)
		{
			this.setState({disabled: false});
			if(!err)
			{
				this.props.onPromiseDone(data);
			}
			else {
				if(this.props.onPromiseErr)
				{
					this.props.onPromiseErr(data);
				}
			}
		}
	}

	componentWillUnmount()
	{
		this.unmounted = true;
	}

	render()
	{

		const spinner = this.state.disabled? <i className="fa fa-spinner fa-spin"/> :null;
		const space = this.state.disabled? "  ": null;

		return <Button disabled={this.state.disabled} bsStyle={this.props.bsStyle} onClick={this.onClick.bind(this)} bsSize={this.props.bsSize}>
			{spinner}
			{space}
			{this.props.text}
		</Button>;
	}
}