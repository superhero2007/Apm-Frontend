import * as React from "react";
import {MetricSortType, SortedMetricList, ISortedListItem} from "../../../es/widgets/sortedMetricList";
import {TxnTracePage} from "../../trace/txnTracePage";
import {updateComponentState} from "../../../utils";

export class TxnTraceViewer extends React.Component<{
	traceList: ISortedListItem[];
	appName:    string;
	txnName:    string;
}, {
	selection: ISortedListItem;
}>
{
	constructor(props, context)
	{
		super(props, context);

		let sel = null;
		if(this.props.traceList.length > 0)
			sel = this.props.traceList[0];

		this.state = {selection: sel};
	}

	private onSelectTrace(it:ISortedListItem)
	{
		updateComponentState(this, {selection: it});
	}

	render()
	{
		if(this.props.traceList.length == 0)
		{
			return <h3>No Traces in this time range</h3>;
		}


		return (
			<div>
				<SortedMetricList listItems={this.props.traceList} selectedItem={this.state.selection} sortType={MetricSortType.AVG_RESPTIME} hideNames={true} onSelectMetric={this.onSelectTrace.bind(this)}/>
				<div className="top2">
					<h3>Trace</h3>
					<hr/>
					<TxnTracePage traceId={this.state.selection.name} app={this.props.appName} txn={this.props.txnName} duration={this.state.selection.value}/>
				</div>
			</div>
		);
	}
}