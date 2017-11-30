import * as React from "react";
import {Button, ButtonToolbar} from "react-bootstrap";
import {QueryView} from "../views/queryView";
import {updateComponentState} from "../../utils";
import {MetricCategory} from "../../reducers/esReducer";
import {ISlowQueryInfo} from "../views/slowQueriesListView";


export interface ITraceSampleInfo
{
	s3Id: string;
	duration: number;
}

export class QueryTrace extends React.Component<{
	samples:ITraceSampleInfo[];
	metricCategory: MetricCategory;
	onClose: ()=>void;
	slowQuery: ISlowQueryInfo;

},{
	index: number;
}>
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
			updateComponentState(this, {index: curIndex-1});
	}

	private onNext()
	{
		const curIndex = this.state.index;
		if( curIndex < this.props.samples.length -1)
			updateComponentState(this, {index: curIndex+1});
	}

	private hasPrev()
	{
		return this.state.index > 0;
	}

	private hasNext()
	{
		return this.state.index < this.props.samples.length -1;
	}
	render()
	{
		const selectedSample = this.props.samples[this.state.index];
		return (
			<div>
				<Button onClick={this.props.onClose.bind(this)} bsSize="large">{"< Back"}</Button>
				<hr/>
				<ButtonToolbar>
					<Button disabled={!this.hasNext()} bsStyle="success" onClick={this.onNext.bind(this)}><i className="fa fa-caret-left"/> Next</Button>
					<Button disabled={!this.hasPrev()} bsStyle="success" onClick={this.onPrev.bind(this)}>Prev <i className="fa fa-caret-right"/></Button>
				</ButtonToolbar>
				<div className="top2">
					<QueryView query={this.props.slowQuery} category={this.props.metricCategory} sample={selectedSample}/>
				</div>
			</div>
		);
	}
}