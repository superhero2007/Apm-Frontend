import * as React from "react";
import {IMtc} from "./mtcListPage";
import {DSTable} from "../../widgets/dsTable";
import {AlertUtils} from "../AlertUtils";
import "./mtc.css";

export class MtcListTable extends React.Component<{items:IMtc[]},{}>
{
	private renderReason(reason: string)
	{
		if(reason == null || reason.length <= 80)
			return reason;

		return reason.substr(0, 80)+"...";
	}

	render()
	{
		const sortedItems = this.props.items;
		let ctr = 1;
		return (<DSTable columnNames={["Application", "Began", "Ended", "User", "Reason"]} classes="mtcTable" noStripe={true} noBorder={true} noHover={true}>
			{sortedItems.map(item =>
				<tr key={ctr++}>
					<td>{item.id.appId}</td>
					<td>{AlertUtils.humanize_unixtime(item.id.beginTime)}</td>
					<td>{AlertUtils.humanize_unixtime(item.endTime)}</td>
					<td>{item.username}</td>
					<td>{this.renderReason(item.reason)}</td>
				</tr>
			)}
		</DSTable>);
	}
}