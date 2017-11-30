import * as React from "react";
import {ISortedListItem} from "../../../es/widgets/sortedMetricList";
import {ISeriesData} from "../../../es/views/metricDetailView";
import {epmDisplay, throughputUnit} from "../../../es/metricUtils";
import {DSTable} from "../../../widgets/dsTable";
import {RowCol} from "../../../widgets/rowCol";
import {ChartTitle} from "../../../es/charts/chartTitle";
import {ErrPctLineChart} from "../../../es/charts/errPctLineChart";
import {StackedAreaChart} from "../../../es/charts/stackedAreaChart";
import {Dispatch} from "redux";

export class TxnErrView extends React.Component<{
	errPct: ISeriesData;
	topXTimeline: ISeriesData[];
	errList: ISortedListItem[] ;
	dispatch   :Dispatch<any>;
	onErrSelect: any;
}, {
	selectedErr: ISortedListItem;
}>
{
	private onErrSelect(err:ISortedListItem)
	{
		this.props.onErrSelect(err);
	}

	render()
	{
		return (
			<div>
				<ChartTitle chartName="Error Rate" />
				<ErrPctLineChart dispatch={this.props.dispatch} dataPoints={this.props.errPct.dataPoints}/>
				<ChartTitle chartName="Top Exceptions" />
				<StackedAreaChart seriesList={this.props.topXTimeline} dispatch={this.props.dispatch} displayFunc={epmDisplay}/>

				<RowCol>
					<h4>See Full Stacktrace samples for:</h4>
					<DSTable columnNames={["Name", "Count"]}>
						{this.props.errList.map(err => <tr key={err.realName} onClick={this.onErrSelect.bind(this, err)} className="aLink">
							<td>{err.name}</td>
							<td>{throughputUnit(err.value)}</td>
						</tr>)}
					</DSTable>
				</RowCol>
			</div>
		);

	}
}