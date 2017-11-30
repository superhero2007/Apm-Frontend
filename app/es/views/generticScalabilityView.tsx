import * as React from "react";
import {IScalabilityGraph, ScalabilityView} from "../widgets/scalabilityView";
import {RowCol} from "../../widgets/rowCol";
import {TimeRange, AbstractTimeRange, ISer_TimeRange} from "../filters/timerange";

export class GenericScalabilityView extends React.Component<{
	graph: IScalabilityGraph;
	timeRange: ISer_TimeRange;
},{}>
{
	private shouldShowGraph():boolean
	{
		const timeRange = AbstractTimeRange.deserialize(this.props.timeRange);
		if(!timeRange.isCustom)
		{
			const range = timeRange as TimeRange;
			if(!range.greaterThan(new TimeRange("",12,'h')))
				return false;
		}

		return true;
	}

	render()
	{
		if(!this.shouldShowGraph())
		{
			return (
				<RowCol>
					<h3>Select a longer time range to see the Scalability Report, eg - 24 hrs or higher</h3>
				</RowCol>
			);
		}

		return (
			<div className="bottom2">
				<ScalabilityView graph={this.props.graph}/>
			</div>
		);
	}
}