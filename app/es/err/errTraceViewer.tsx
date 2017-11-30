import * as React from "react";
import {IAppIdName} from "./errTrendsView";
import {Button, ButtonToolbar} from "react-bootstrap";
import {ErrTrace} from "./errTrace";
import {updateComponentState} from "../../utils";

export interface IErrSample {
	timestamp: number;
	s3ID: string;
}

interface IState
{

	index: number;
}

interface IProps
{
	data:IErrSample[];
	app:IAppIdName;
	onClose: ()=>void;
}


export class ErrTraceViewer extends React.Component<IProps, IState>
{

	constructor(props, context)
	{
		super(props, context);
		this.state = {index: 0};
	}


	private onPrev()
	{
		const curIndex = this.state.index;
		if(curIndex > 0)
		{
			updateComponentState(this, {index: curIndex - 1});
		}
	}

	private onNext()
	{
		const curIndex = this.state.index;
		if( curIndex < this.props.data.length -1)
			updateComponentState(this, {index: curIndex+1});
	}

	private hasPrev()
	{
		return this.state.index > 0;
	}

	private hasNext()
	{
		return this.state.index < this.props.data.length -1;
	}


	render()
	{
		const sample = this.props.data[this.state.index];
		return (
			<div>
				<Button onClick={this.props.onClose} bsSize="large">{"< Back"}</Button>
				<hr/>
				<ButtonToolbar>
					<Button disabled={!this.hasNext()} bsStyle="success" onClick={this.onNext.bind(this)}><i className="fa fa-caret-left"/> Next</Button>
					<Button disabled={!this.hasPrev()} bsStyle="success" onClick={this.onPrev.bind(this)}>Prev <i className="fa fa-caret-right"/></Button>
				</ButtonToolbar>

				<div className="top2">
					<ErrTrace appId={this.props.app.appId} appName={this.props.app.appName} sample={sample}/>
				</div>
			</div>
		);
	}
	
}