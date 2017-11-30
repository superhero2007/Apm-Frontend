import * as React from "react";
import * as _ from "lodash";
import {connect} from "react-redux";
import {RowCol} from "../widgets/rowCol";
import {TimeRangeFilter} from "../es/filters/timeRangeFilter";
import {AbstractSelectEntity} from "../es/pinned/selectJvm";
import {IHostId} from "../reducers/serverPageReducer";
import {ISvrPageProps} from "./serverPageFrame";
import {Col, Row} from "react-bootstrap";
import {action_updateSelectedHosts} from "../reducers/hostFilterReducer";
import {TimeRange} from "../es/filters/timerange";
import {serverPageConnector} from "../reduxConnectors";


export class SelectHost extends AbstractSelectEntity<IHostId>
{
	getMapper()
	{
		return (host: IHostId) => ({value: host.id, label: host.label});
	}

}



class ServerFilters_connect extends React.Component<ISvrPageProps, {}>
{
	private onHostsSelectChange(hostIds:string[])
	{
		this.props.dispatch(action_updateSelectedHosts(hostIds));
	}

	render()
	{

		const hostList = this.props.serverPage.hosts;
		const selectedIds = this.props.hostFilter.selectedHostIds;
		const selectedHosts:IHostId[] = _.filter(hostList, (h) =>
		{
			return selectedIds.includes(h.id);
		});
		return (
			<RowCol className="bottom2">
				<div className="bottom1">
					<TimeRangeFilter redrName="timeRangeFilter" maxRange={new TimeRange("30 days", 30, 'd')}/>
				</div>

				<Row className="verticalAlign">
					<Col xs={1}>
						Selected Hosts:
					</Col>
					<Col xs={11}>
						<SelectHost itemList={hostList} disabled={false} placeholder="Select Hosts" defaultSelectedTargets={selectedHosts} onSelectionChange={this.onHostsSelectChange.bind(this)}/>
					</Col>
				</Row>
				<hr/>
			</RowCol>
		);
	}
}

export const ServerFilters = connect((state)=> serverPageConnector(state))(ServerFilters_connect);