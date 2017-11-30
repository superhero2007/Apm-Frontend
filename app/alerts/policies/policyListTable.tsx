import * as React from "react";
import * as _ from "lodash";
import {IAlertPolicyListItem} from "./policyListPage";
import {Link} from "react-router";
import {DSTable} from "./../../widgets/dsTable";
import "./policyList.css";

export class PolicyListTable extends React.Component<{items:IAlertPolicyListItem[]},{}>
{
	private renderPolicyState(item:IAlertPolicyListItem){
		var statusClass;

		if(item.openIncidents > 0)
		{
			statusClass = "error";
		}
		else if(item.openViolations > 0 )
		{
			statusClass = "warning";
		}
		else
		{
			statusClass = "ok";
		}

		return <i className={"fa fa-circle policyStatus "+statusClass}/>;
	}

	render()
	{
		let sortedItems = _.sortBy(this.props.items, "name");

		return (<DSTable columnNames={["Status", "Alert Policy Name", "Open Incidents","Open Violations"]}>
			{sortedItems.map(item =>
			<tr key={item.id}>
					<td>{this.renderPolicyState(item)}</td>
					<td> <Link to={`/policy/${item.id}`}> {item.name} </Link> </td>
					<td>{item.openIncidents}</td>
					<td>{item.openViolations}</td>

				</tr>
				)}
		</DSTable>);
	}
}