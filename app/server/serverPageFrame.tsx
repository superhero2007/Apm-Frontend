import * as React from "react";
import * as PropTypes from "prop-types";
import * as classNames from "classnames";
import {JSONEncoder} from "../es/routeobj/jsonEncoder";
import {ISer_TimeRange, TimeRange} from "../es/filters/timerange";
import {
	action_updateServerHostList,
	action_updateServerPageTab,
	action_updateServerProcSortType,
	action_updateServerSelectedEntity,
	IHostId,
	IRR_ServerPage,
	ServerProcSortType,
	SvrTab
} from "../reducers/serverPageReducer";
import {connect} from "react-redux";
import {IRR_Filter_TimeRange} from "../reducers/timerangeReducer";
import {action_updateSelectedHosts, IRR_Filter_Host} from "../reducers/hostFilterReducer";
import {Dispatch} from "redux";
import {DripRouter} from "../dripRouter";
import {getRouteParam} from "../utils";
import {action_updateTimeRangeSerialized} from "../reducers/esReducer";
import {ServerListPage} from "./serverListPage";
import {SvrComputePage} from "./computePage";
import {RoutableLoadableComponent} from "../widgets/routableLoadableComponent";
import {Http} from "../http";
import {SvrNetworkPage} from "./networkPage";
import {SvrDiskPage} from "./diskPage";
import {SvrProcessPage} from "./procPage";
import {ServerSeriesUtils} from "./serverCommons";
import {serverPageConnector} from "../reduxConnectors";

export class ServerDripRouter extends DripRouter
{
	constructor(router)
	{
		super(router);
	}

	protected genUrl(encodedJson: string)
	{
		return `/servers/${encodedJson}`;
	}
}


interface IServerRouteProps
{
	timeRange: ISer_TimeRange;
	tab:SvrTab;
	stHosts: string[];
	entity: string;
	procSort: ServerProcSortType;
}

export interface ISvrPageProps
{
	dispatch?       :Dispatch<any>;
	serverPage?: IRR_ServerPage;
	timeRangeFilter?: IRR_Filter_TimeRange;
	hostFilter?: IRR_Filter_Host;
}

interface IProps extends ISvrPageProps {
	children? :any;
}

export function ServerPageTopLevel_getDefaultRouterJSON(): string {
	const routeProps:IServerRouteProps = { timeRange: TimeRange.defaultRange.serialize(), tab:SvrTab.List, stHosts: [], entity: null, procSort: ServerProcSortType.Cpu};
	return JSONEncoder.encode(routeProps);
}

class ServerPageTopLevel_Connected extends RoutableLoadableComponent<IProps, {}>
{
	private router = new ServerDripRouter(this.context.router);

	protected initialState(): {}
	{
		return {};
	}

	protected getHttpRequests(props: IProps): JQueryXHR[]
	{
		return [Http.post("/servers/listSimple")];
	}

	protected getStateFromPostResponse(responseData: any): {}
	{
		const hosts: IHostId[] = responseData[0];

		ServerSeriesUtils.labelHosts(hosts);

		this.props.dispatch(action_updateServerHostList(hosts));

		let initUrl = false;
		let serverJSON = getRouteParam(this.props, "serverJSON");
		if(!serverJSON)
		{
			serverJSON = ServerPageTopLevel_getDefaultRouterJSON();
			initUrl = true;
		}

		this.initReducers(JSONEncoder.decode(serverJSON));
		if(initUrl)
		{
			this.router.updateUrlInitial(serverJSON);
		}
		return {};
	}

	private initReducers(routeProps:IServerRouteProps)
	{
		this.props.dispatch(action_updateServerPageTab(routeProps.tab));
		this.props.dispatch(action_updateTimeRangeSerialized(routeProps.timeRange));
		this.props.dispatch(action_updateSelectedHosts(routeProps.stHosts));
		this.props.dispatch(action_updateServerSelectedEntity(routeProps.entity));
		this.props.dispatch(action_updateServerProcSortType(routeProps.procSort));
	}

	protected renderContent(data: {}): any
	{
		return (
			<div>
				{this.props.children}
			</div>
		);
	}
}

class ServerPageFrame_Connected extends React.Component<ISvrPageProps, {}>
{
	static contextTypes:any = {
		router: PropTypes.any.isRequired
	};

	context:any;

	private router = new ServerDripRouter(this.context.router);


	componentWillReceiveProps(nextProps:IProps)
	{
		const next: IServerRouteProps = ServerPageFrame_Connected.createRouteProps(nextProps);
		const cur: IServerRouteProps = ServerPageFrame_Connected.createRouteProps(this.props);
		this.router.onPropsChange(cur, next);
	}

	private static createRouteProps(props: IProps): IServerRouteProps
	{
		return {timeRange: props.timeRangeFilter.timeRange, tab: props.serverPage.tab, stHosts: props.hostFilter.selectedHostIds, entity: props.serverPage.selectedEntity, procSort: props.serverPage.procSortType };
	}

	private activeCls(tab: SvrTab)
	{
		return classNames({"active": this.props.serverPage.tab == tab});
	}

	private onTabSelect(tab:SvrTab, e)
	{
		e.preventDefault();
		if(tab !== this.props.serverPage.tab)
		{
			this.props.dispatch(action_updateServerPageTab(tab));
		}
	}

	private renderTabLi(tabType:SvrTab, label: string)
	{
		return <li className={this.activeCls(tabType)}><a href="#" onClick={this.onTabSelect.bind(this, tabType)}>{label}</a></li>;
	}

	private renderNavbar()
	{
		return (
			<div>
				<nav className="navbar navbar-default navbar-static-top row navbarStickTop">
					<div className="container-fluid">
						<div className="navbar-collapse">
							<ul className="nav navbar-nav">
								{this.renderTabLi(SvrTab.List, "Server List")}
								{this.renderTabLi(SvrTab.Compute, "Compute")}
								{this.renderTabLi(SvrTab.Network, "Network")}
								{this.renderTabLi(SvrTab.Disk, "Disks")}
								{this.renderTabLi(SvrTab.Process, "Processes")}
							</ul>
						</div>
					</div>
				</nav>
			</div>
		);
	}

	private renderTab()
	{
		switch (this.props.serverPage.tab)
		{
			case SvrTab.List:
				return <ServerListPage/>;
			case SvrTab.Compute:
				return <SvrComputePage/>;
			case SvrTab.Network:
				return <SvrNetworkPage/>;
			case SvrTab.Disk:
				return <SvrDiskPage/>;
			case SvrTab.Process:
				return <SvrProcessPage/>;

			default:
				console.log("error. forgot to put switch for renderTab()");
				break;
		}
	}
	render()
	{
		return (
			<div>
				{this.renderNavbar()}
				{this.renderTab()}
			</div>
		)
	}
}

export const ServerPageTopLevel = connect((state)=> serverPageConnector(state))(ServerPageTopLevel_Connected);
export const ServerPageFrame = connect((state)=> serverPageConnector(state))(ServerPageFrame_Connected);