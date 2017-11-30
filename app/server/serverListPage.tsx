import {DSEntityTable, DSEntityTableBody, DSEntityTableEntityRow, DSEntityTableHeader, SortDirection} from "../widgets/dsEntityTable";
import {LoadableComponent} from "../widgets/loadableComponent";
import {RowCol} from "../widgets/rowCol";
import * as React from "react";
import {CSSProperties} from "react";
import * as _ from "lodash";
import {updateComponentState} from "../utils";
import {action_updateServerHostList, action_updateServerPageTab, IHostId, SvrTab} from "../reducers/serverPageReducer";
import {connect} from "react-redux";
import {ISvrPageProps} from "./serverPageFrame";
import {action_updateSelectedHosts} from "../reducers/hostFilterReducer";
import {Col, Grid, Row} from "react-bootstrap";
import {Link} from "react-router";
import {ServerSeriesUtils} from "./serverCommons";
import {AmplitudeAnalytics} from "../analytics";
import {Http} from "../http";
import {roundToTwo} from "../es/metricUtils";
import {serverPageConnector} from "../reduxConnectors";
import {Dispatch} from "redux";
import {IViolation} from "../alerts/policies/detail/violationsListPage";
import {InlineViolationsList} from "../apps/appListPage";

export interface IHostMetricList {
	hostId: string;
	metrics: {[key: string]: number};
}

interface IHostListItem extends IHostId
{
	online: boolean;
}

interface IServerListPageProps extends ISvrPageProps
{

}

interface IServerListPageState
{
	list: IHostListItem[];
	metricsList: IHostMetricList[];
	violationData: IViolationData;
}

interface HostToValue {
	[hostId: string]: string;
}

interface IViolationData
{
	hostToSeverity: HostToValue;
	violations: IViolation[];
}

class ServerListPage_Connected extends LoadableComponent<IServerListPageProps, IServerListPageState>
{
	componentWillMount(): any
	{
		AmplitudeAnalytics.track("Servers - List");
		return super.componentWillMount();
	}

	protected initialState(): IServerListPageState
	{
		return {list: [], metricsList: [], violationData: null};
	}


	protected getHttpRequests(props:ISvrPageProps) :JQueryXHR[]
	{
		return this.getMetricFetchURLs().map(url => Http.post(url));
	}

	protected getMetricFetchURLs(): string[]
	{
		return ["/servers/list", "/servers/listServerStats", "/servers/listViolations"];
	}


	protected getStateFromPostResponse(responseData: any): IServerListPageState
	{
		const hosts:IHostListItem[] = responseData[0];
		ServerSeriesUtils.labelHosts(hosts);
		this.props.dispatch(action_updateServerHostList(hosts));
		const violationData: IViolationData = responseData[2];

		for (let vtn of violationData.violations)
		{
			const host = hosts.find(it => it.id === vtn.targetName);
			if(host)
			{
				vtn.appName = host.label;
			}
		}

		return {list: hosts, metricsList: responseData[1], violationData: violationData};
	}

	private extractHostStats(hostData: IHostMetricList) {

		let cpu =0, mem = 0, diskPct = 0;
		if(hostData)
		{
			const cpuval = hostData.metrics["system.cpu.total"];
			if(cpuval)
				cpu = roundToTwo(cpuval);

			const memUsed = hostData.metrics["system.memory.used"];
			const memFree = hostData.metrics["system.memory.free"];

			const disk = hostData.metrics["highestDiskUsagePct"];
			if(disk)
				diskPct = roundToTwo(disk);

			if(memUsed && memFree)
			{
				const memTotal = memUsed +memFree;
				mem = roundToTwo((memUsed/memTotal) * 100);
			}
		}

		return {cpu, mem, diskPct};
	}

	protected renderContent(data: IServerListPageState): any
	{
		if(data.list.length == 0)
		{
			const style:CSSProperties = {
				"marginTop": "200px",
				"fontSize": "40px",
				"white-space": "normal"
			};

			const subStyle:CSSProperties = {
				"fontSize": "25px",
				"fontWeight": 800,
				"color": "green"
			};
			return (
				<Grid fluid={true}>
					<div className="text-center">
						<Link to="/addserver" className="btn btn-success btn-lg" style={style}><i className="fa fa-plus-circle"/> Add Server</Link>
						<div>
							<a style={subStyle} href="http://blog.dripstat.com/dripstat-infra-now-free-leave-no-server-unmonitored" target="_blank" >{"100% FREE"}</a>
						</div>
					</div>
				</Grid>
			);
		}

		const hostDataList: IHostLineData[] =  data.list.map(host => {
			return {
				hostId: host.id,
				info: host,
				metrics: this.extractHostStats(data.metricsList.find(it => it.hostId == host.id))
			}
		});

		const subLinkStyle: CSSProperties = {
			"color": "green",
			"fontStyle": "italic",
		};

		const hasViolations = data.violationData.violations.length > 0;

		let violationsView;

		if(hasViolations)
		{
			violationsView = (
				<Col xs={3}>
					<InlineViolationsList violations={data.violationData.violations}/>
				</Col>
			);
		}
		return (
			<Grid fluid={true}>
				<RowCol xs={12} className="bottom1 pull-right">
					<div className="text-center">
						<Link to="/addserver" className="btn btn-success"><i className="fa fa-plus-circle"/> Add Server</Link>
						<div>
							<a href="http://blog.dripstat.com/dripstat-infra-now-free-leave-no-server-unmonitored" target="_blank" style={subLinkStyle}>{"100% FREE"}</a>
						</div>
					</div>
				</RowCol>
				<Row>
					<Col xs = {hasViolations? 9: 12}>
						<ServerList hostDataList={hostDataList} violationData={data.violationData} dispatch={this.props.dispatch}/>
					</Col>
					{violationsView}
				</Row>
			</Grid>
		);
	}

}

interface IServerListProps
{
	hostDataList: IHostLineData[];
	violationData: IViolationData;
	dispatch       :Dispatch<any>;
}

interface IHostMetrics {
	cpu,
	mem,
	diskPct
}

interface IHostLineData {
	hostId: string;
	info: IHostListItem;
	metrics: IHostMetrics;
}

class ServerList extends React.Component<IServerListProps, {
	sortColumn: string;
	sortDirection: SortDirection;

}>
{
	constructor(props, context)
	{
		super(props, context);
		this.state = {sortColumn: "Status", sortDirection: SortDirection.DESC};
	}

	private onSortChange(column: string, direction: SortDirection)
	{
		updateComponentState(this, {sortColumn: column, sortDirection: direction});
	}

	private getHostStatusClass(host:IHostListItem)
	{
		if (!host.online)
			return "offline";

		const vsev = this.props.violationData.hostToSeverity[host.id];

		if(vsev === "Critical")
			return "err";

		if(vsev === "Warning")
			return "warn";

		return "online"
	}

	private getSortStatusPriority(host:IHostListItem): number
	{
		return DSEntityTableBody.sortStatusPriority(this.getHostStatusClass(host));
	}

	private sortHosts(hostList:IHostLineData[])
	{
		let sortingOrder: string = null;
		switch (this.state.sortDirection)
		{
			case SortDirection.ASC:
				sortingOrder = "asc";
				break;
			case SortDirection.DESC:
				sortingOrder = "desc";
				break;
		}


		const nameField = "info.label";
		const cpuField = "metrics.cpu";
		const memField = "metrics.mem";
		const diskField = "metrics.diskPct";

		let sortField: string = null;

		switch (this.state.sortColumn)
		{
			case "Host":
				sortField = nameField; break;
			case "Status":
				sortField = "status"; break;
			case "CPU":
				sortField = cpuField; break;
			case "Memory":
				sortField = memField; break;
			case "Fullest Disk":
				sortField = diskField; break;
		}

		if(sortField === "status")
		{
			return _.orderBy(hostList, [host => this.getSortStatusPriority(host.info), nameField], [sortingOrder, "asc"]);
		}

		if(sortField === nameField)
		{
			return _.orderBy(hostList, [sortField, host => this.getSortStatusPriority(host.info)], [sortingOrder, "desc"]);
		}


		return _.orderBy(hostList, [sortField, host => this.getSortStatusPriority(host.info), nameField], [sortingOrder, "desc", "asc"]);
	}

	private onHostClick(host:IHostLineData)
	{
		this.props.dispatch(action_updateSelectedHosts([host.hostId]));
		this.props.dispatch(action_updateServerPageTab(SvrTab.Compute));
	}


	render()
	{
		const sortedHosts = this.sortHosts(this.props.hostDataList);

		const rows = sortedHosts.map(it => <DSEntityTableEntityRow key={it.hostId} onClick={this.onHostClick.bind(this, it)} statusCssClass={this.getHostStatusClass(it.info)}
		                                                           columnValues={[it.info.label, String(it.metrics.cpu)+"%", String(it.metrics.mem)+"%", String(it.metrics.diskPct)+"%"]}/> );
		return (
			<DSEntityTable>
				<DSEntityTableHeader columnNames={["Status","Host", "CPU", "Memory", "Fullest Disk"]} onSortChange={this.onSortChange.bind(this)}
				                     sortDirection={this.state.sortDirection} sortColumn={this.state.sortColumn}/>
				<DSEntityTableBody>
					{rows}
				</DSEntityTableBody>
			</DSEntityTable>
		);
	}
}

export const ServerListPage = connect((state)=> serverPageConnector(state))(ServerListPage_Connected);
