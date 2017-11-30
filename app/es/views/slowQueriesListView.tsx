import * as React from "react";
import {responseTimeDisplay} from "../metricUtils";
import {DSTable} from "../../widgets/dsTable";

export interface ISlowQueryInfo
{
	duration: number;
	sql: string;
	sqlId: number;
	appId: string;
	appName: string;
}

export class SlowQueriesListView extends React.Component<{
	onSelect: (query:ISlowQueryInfo)=>void;
	slowQueries: ISlowQueryInfo[];
	hideAppName? :boolean
}, {}>
{

	render()
	{
		if(this.props.slowQueries.length == 0)
		{
			return <h3>No Slow Queries in this time range</h3>;
		}

		if(this.props.hideAppName)
		{
			return (
				<div>
					<DSTable columnNames={["Query","Duration"]}>
						{this.props.slowQueries.map(s => <tr key={s.sqlId} className="aLink" onClick={this.props.onSelect.bind(this, s)}>
							<td>{s.sql}</td>
							<td>{responseTimeDisplay(s.duration)}</td>
						</tr>)}
					</DSTable>
				</div>
			);
		}
		else
		{
			return (
				<div>
					<DSTable columnNames={["Query","Duration","Application"]}>
						{this.props.slowQueries.map(s => <tr key={s.sqlId} className="aLink" onClick={this.props.onSelect.bind(this, s)}>
							<td>{s.sql}</td>
							<td>{responseTimeDisplay(s.duration)}</td>
							<td>{s.appName}</td>
						</tr>)}
					</DSTable>
				</div>
			);
		}
	}
}