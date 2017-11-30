import * as React from "react";
import {throughputUnit, throughputDisplay, responseTimeDisplay, metricCategoryDisplay} from "../metricUtils";
import {DSTable} from "../../widgets/dsTable";
import {StackedAreaChart} from "../charts/stackedAreaChart";
import {MetricCategory} from "../../reducers/esReducer";
import {IStatsByMetric} from "../views/perAppMetricView";

interface IStatSummary
{
	name: string;
	avgRespTime: number;
	avgThp: number;
	totalThp: number;
}

export interface IStatsByMetricWithSummary extends IStatsByMetric {
	summaries: IStatSummary[];
}

export class OpsView extends React.Component<{
	category: MetricCategory;
	stats:IStatsByMetricWithSummary;
	dispatch: any;
}, {}>
{
	render()
	{
		const opStr = `${metricCategoryDisplay(this.props.category)} Operations`;
		return (
			<div>
				<hr/>
				<h2>{opStr}</h2>
				<div className="top2">
					<h3>{`Avg Response Time`}</h3>
					<StackedAreaChart seriesList={this.props.stats.responseTimes} dispatch={this.props.dispatch} displayFunc={responseTimeDisplay}/>
					<hr/>
					<h3>{`Throughput`}</h3>
					<StackedAreaChart seriesList={this.props.stats.throughputs} dispatch={this.props.dispatch}/>
				</div>

				<div className="top2">
					<DSTable columnNames={["Operation", "Avg Response Time", "Avg Throughput", "Total Calls"]}>
						{this.props.stats.summaries.map(s => <tr key={s.name}>
							<td>{s.name}</td>
							<td>{responseTimeDisplay(s.avgRespTime)}</td>
							<td>{throughputDisplay(s.avgThp)}</td>
							<td>{throughputUnit(s.totalThp)}</td>
						</tr>)}
					</DSTable>
				</div>
			</div>
		);
	}
}