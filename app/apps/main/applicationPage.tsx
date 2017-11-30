import * as React from "react";
import {IStore} from "../../reduxSetup";
import {connect} from "react-redux";
import {action_reset, action_setAgentInfo, action_setAppFeatures, action_setAppInfo, action_setDeploys, IAgentVersionInfo, IRR_AppInfo} from "../../reducers/appInfoReducer";
import {EAppTabs, IRR_App, IRR_AppOverview} from "../../reducers/appReducer";
import {TimeRange} from "../../es/filters/timerange";
import {JVMFilters} from "../../es/pinned/jvmFilters";
import {Http} from "../../http";
import {getRouteParam} from "../../utils";
import {RoutableLoadableComponent} from "../../widgets/routableLoadableComponent";
import {JSONEncoder} from "../../es/routeobj/jsonEncoder";
import {DripRouter} from "../../dripRouter";
import {App_OverviewPage_getDefaultPageState} from "./overview";
import {Dispatch} from "redux";
import {appIdConnector} from "../../reduxConnectors";

export interface IAppPageProps
{
	dispatch?       :Dispatch<any>;
	appInfo?        :IRR_AppInfo;
	app?            :IRR_App;
}




interface IProps extends IAppPageProps
{
	appId: string;
	children?: any;
}

export interface IAppUrlObj
{
	app: IRR_App;
	tabRR;
}

export class AppDripRouter extends DripRouter
{
	constructor(router, private appId: string)
	{
		super(router);
	}

	protected genUrl(encodedJson: string)
	{
		return `/app/${this.appId}/${encodedJson}`;
	}
}

class ApplicationPage_connect extends RoutableLoadableComponent<IProps, {}>
{
	private router = new AppDripRouter(this.context.router, this.props.appId);

	protected initialState():{}
	{
		return {};
	}

	protected getStateFromPostResponse(reponseData:any):{}
	{
		const appInfo = reponseData[0];
		const deploys = reponseData[1];
		let features = reponseData[2];
		let oldAgentInfo:IAgentVersionInfo =reponseData[3];

		if(!features)
			features = [];

		this.props.dispatch(action_setAppInfo(appInfo));
		this.props.dispatch(action_setDeploys(deploys));
		this.props.dispatch(action_setAppFeatures(features));
		this.props.dispatch(action_setAgentInfo(oldAgentInfo));

		const appJSON = getRouteParam(this.props, "appJSON");
		if(!appJSON)
		{
			//default value
			const rr:IRR_App = {timeRange: TimeRange.defaultRange.serialize(), jvmFilter: JVMFilters.defaultFilterState(), tab: EAppTabs.Overview};
			const page: IRR_AppOverview = App_OverviewPage_getDefaultPageState();
			const urlObj:IAppUrlObj = {app: rr, tabRR: page};
			this.router.updateUrlInitial(JSONEncoder.encode(urlObj));
		}

		return {};
	}


	componentWillUnmount()
	{
		this.props.dispatch(action_reset());
		super.componentWillUnmount();
	}

	protected getHttpRequests(props:IAppPageProps) :JQueryXHR[]
	{
		const params = {appId: this.props.appId};
		const paramsLower = {appid: this.props.appId};
		return [Http.post("/appinfo",params), Http.post("/deploys/list5", params), Http.post("/app/features", paramsLower), Http.post("/oldagents", params)];
	}


	protected renderContent(data:{})
	{
		return (
			<div>
				{this.props.children}
			</div>
		);
	}
}

export const ApplicationPage = connect((state,props)=> appIdConnector(state,props))(ApplicationPage_connect);