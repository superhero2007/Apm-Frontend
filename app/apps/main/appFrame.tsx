import * as React from "react";
import * as PropTypes from "prop-types";
import * as classNames from "classnames";
import {AppDripRouter, IAppUrlObj} from "./applicationPage";
import {IStore} from "../../reduxSetup";
import {connect} from "react-redux";
import {RowCol} from "../../widgets/rowCol";
import {App_OverviewPage, App_OverviewPage_getDefaultPageState, IAppOverviewPageProps} from "./overview";
import {
	action_appTabSwitch,
	action_initApp,
	action_initApp_Err,
	action_initApp_ES,
	action_initApp_JVM,
	action_initApp_Overview,
	action_initApp_Txn,
	EAppTabs,
	IRR_App_Err,
	IRR_App_ES,
	IRR_App_JVM,
	IRR_App_Txn
} from "../../reducers/appReducer";
import {JSONEncoder} from "../../es/routeobj/jsonEncoder";
import {MetricCategory} from "../../reducers/esReducer";
import {App_TxnPage, App_TxnPage_getDefaultPageState} from "./txn";
import {AppAWSPage, AppDBPage, AppDBPage_getDefaultPageState, AppESPage, AppESPage_getDefaultPageState} from "./es";
import {App_ErrPage, App_ErrPage_getDefaultPageState} from "./errors";
import {AbstractJVMPage_getDefaultPageState, App_EnvPage, App_JVMStatsPage} from "./jvmStats";
import {App_DeploysPage} from "./deploys";
import {App_RealtimePage} from "./appRealtime";
import {Alert} from "react-bootstrap";
import {action_dissmissAgentVersionWarning} from "../../reducers/appInfoReducer";
import {App_ProfilerPage} from "./appProfiler";
import {App_SettingsPage} from "./appSettings";
import {appFrameConnector} from "../../reduxConnectors";

export interface IAppFrameProps extends IAppOverviewPageProps
{
	appJSON:    string;
	appTxn: IRR_App_Txn;
	appES:  IRR_App_ES;
	appErr: IRR_App_Err;
	appJVM: IRR_App_JVM;
}

class AppFrame_connect extends React.Component<IAppFrameProps, {}>
{
	static contextTypes:any = {
		router: PropTypes.any.isRequired
	};

	context:any;

	private router = new AppDripRouter(this.context.router, this.props.appInfo.app.id);

	componentWillMount()
	{
		const urlObj:IAppUrlObj = JSONEncoder.decode(this.props.appJSON);
		this.props.dispatch(action_initApp(urlObj.app));

		switch (urlObj.app.tab)
		{
			case EAppTabs.Overview:
				this.props.dispatch(action_initApp_Overview(urlObj.tabRR));
				break;
			case EAppTabs.Txn:
				this.props.dispatch(action_initApp_Txn(urlObj.tabRR));
				break;
			case EAppTabs.ES:
			case EAppTabs.Db:
			case EAppTabs.Aws:
				this.props.dispatch(action_initApp_ES(urlObj.tabRR));
				break;
			case EAppTabs.Err:
				this.props.dispatch(action_initApp_Err(urlObj.tabRR));
				break;
			case EAppTabs.JVM:
			case EAppTabs.Env:
				this.props.dispatch(action_initApp_JVM(urlObj.tabRR));
				break;
			case EAppTabs.Deploys:
			case EAppTabs.Live:
			case EAppTabs.Profiler:
			case EAppTabs.Settings:
				break; //do nothing

			default:
				console.log("missing case", urlObj.app.tab);
				throw "missing case";
		}

	}

	componentWillReceiveProps(nextProps:IAppFrameProps)
	{
		const next:IAppUrlObj =  {app: nextProps.app, tabRR: this.getReducerForTab(nextProps)};
		const cur:IAppUrlObj = {app: this.props.app, tabRR: this.getReducerForTab(this.props)};

		this.router.onPropsChange(cur, next);
	}

	private getReducerForTab(props: IAppFrameProps): any
	{
		const tab = props.app.tab;
		switch (tab)
		{
			case EAppTabs.Overview:
				return props.appOverview;

			case EAppTabs.Txn:
				return props.appTxn;

			case EAppTabs.ES:
			case EAppTabs.Db:
			case EAppTabs.Aws:
				return props.appES;
			case EAppTabs.Err:
				return props.appErr;
			case EAppTabs.JVM:
			case EAppTabs.Env:
				return props.appJVM;
			case EAppTabs.Deploys:
			case EAppTabs.Live:
			case EAppTabs.Profiler:
			case EAppTabs.Settings:
				return {};

			default:
			{
				return props.appOverview;
			}
		}
	}

	private dbCatToUrlSegment(cat: MetricCategory): string
	{
		if(cat == MetricCategory.Couchbase)
			return "couch";

		return MetricCategory[cat].toLowerCase();
	}

	private renderNavbar()
	{
		const app = this.props.appInfo.app;
		const appId = app.id;

		const style = {
			marginLeft: "-15px",
			marginRight: "-15px",
			marginTop: "-20px",
			backgroundColor: "white"
		};

		const appTab = this.props.app.tab;
		return (
			<RowCol>
				<div className="navbar navbar-default navbar-static-top" style={style}>
					<div className="container-fluid">

						<div className="navbar-header">
							<a className="navbar-brand">{app.label}</a>
						</div>

						<div className="navbar-collapse">

							<ul className="nav navbar-nav">
								<li className={classNames({"active": appTab === EAppTabs.Live})}><a href="#" onClick={this.onTabSelect.bind(this, EAppTabs.Live)}>Live</a></li>
								<li className={classNames({"active": appTab === EAppTabs.Overview})}><a href="#" onClick={this.onTabSelect.bind(this, EAppTabs.Overview)}>Overview</a></li>
								<li className={classNames({"active": appTab === EAppTabs.Txn})}><a href="#" onClick={this.onTabSelect.bind(this, EAppTabs.Txn)}>Transactions</a></li>
								<li className={classNames({"active": appTab === EAppTabs.ES})}><a href="#" onClick={this.onTabSelect.bind(this, EAppTabs.ES)}>External Services</a></li>
								<li className={classNames({"active": appTab === EAppTabs.Db})}><a href="#" onClick={this.onTabSelect.bind(this, EAppTabs.Db)}>Database</a></li>
								<li className={classNames({"active": appTab === EAppTabs.Aws})}><a href="#" onClick={this.onTabSelect.bind(this, EAppTabs.Aws)}>AWS</a></li>
								<li className={classNames({"active": appTab === EAppTabs.Err})}><a href="#" onClick={this.onTabSelect.bind(this, EAppTabs.Err)}>Errors</a></li>
								<li className={classNames({"active": appTab === EAppTabs.JVM})}><a href="#" onClick={this.onTabSelect.bind(this, EAppTabs.JVM)}>JVM Stats</a></li>
								<li className={classNames({"active": appTab === EAppTabs.Env})}><a href="#" onClick={this.onTabSelect.bind(this, EAppTabs.Env)}>Environment</a></li>
								<li className={classNames({"active": appTab === EAppTabs.Deploys})}><a href="#" onClick={this.onTabSelect.bind(this, EAppTabs.Deploys)}>Deployments</a></li>
								<li className={classNames({"active": appTab === EAppTabs.Profiler})}><a href="#" onClick={this.onTabSelect.bind(this, EAppTabs.Profiler)}>Profiler</a></li>
							</ul>
							<ul className="nav navbar-nav navbar-right">
								<li className={classNames({"active": appTab === EAppTabs.Settings})}><a href="#" onClick={this.onTabSelect.bind(this, EAppTabs.Settings)}><span className="glyphicon glyphicon-cog"> </span> Settings</a></li>
							</ul>
						</div>

					</div>
				</div>
			</RowCol>

		);
	}


	private onTabSelect(tab:EAppTabs, e)
	{
		e.preventDefault();
		if(tab !== this.props.app.tab)
		{
			switch (tab)
			{
				case EAppTabs.Overview:
					this.props.dispatch(action_initApp_Overview(App_OverviewPage_getDefaultPageState()));
					break;

				case EAppTabs.Txn:
					this.props.dispatch(action_initApp_Txn(App_TxnPage_getDefaultPageState()));
					break;

				case EAppTabs.ES:
					this.props.dispatch(action_initApp_ES(AppESPage_getDefaultPageState()));
					break;
				case EAppTabs.Db:
				case EAppTabs.Aws:
					this.props.dispatch(action_initApp_ES(AppDBPage_getDefaultPageState()));
					break;
				case EAppTabs.Err:
					this.props.dispatch(action_initApp_Err(App_ErrPage_getDefaultPageState()));
					break;
				case EAppTabs.JVM:
				case EAppTabs.Env:
					this.props.dispatch(action_initApp_JVM(AbstractJVMPage_getDefaultPageState()));
					break;
				case EAppTabs.Deploys:
				case EAppTabs.Live:
				case EAppTabs.Profiler:
				case EAppTabs.Settings:
					break; //do nothing
				default:
					throw "Missing case statement for "+tab;
			}


			this.props.dispatch(action_appTabSwitch(tab));
		}
	}

	private renderAgentVersionWarning()
	{
		const appInfo = this.props.appInfo;
		const agentInfo = appInfo.agentInfo;

		if(agentInfo.jvms.length > 0 && !appInfo.versionWarningDismissed)
		{
			return (
				<div>
					<RowCol>
						<Alert bsStyle="warning" onDismiss={this.onVersionAlertDismiss.bind(this)}>
							<p>
							{"Your DripStat Agent is out of date. Please update to "}
							<strong>{` version ${agentInfo.currentAgentVersion}`}</strong>
							{" to get the latest features."}
							</p>
							<p>
							<a href="https://chronon.atlassian.net/wiki/display/DRIP/Upgrading+DripStat+Agent" target="_blank" style={({marginRight:"1em"})}>Upgrade Instructions</a>
								{"  |  "}
							<a href="https://chronon.atlassian.net/wiki/display/DRIP/Changelog" target="_blank" style={({marginLeft:"1em"})}>Changelog</a>
							</p>
						</Alert>
					</RowCol>
				</div>
			)
		}

	}

	private onVersionAlertDismiss()
	{
		this.props.dispatch(action_dissmissAgentVersionWarning());
	}

	render()
	{
		const tab = this.props.app.tab;
		let view;
		if(tab == EAppTabs.Overview)
			view = <App_OverviewPage/>;
		else if(tab == EAppTabs.Txn)
			view = <App_TxnPage/>;
		else if(tab == EAppTabs.ES)
			view = <AppESPage/>;
		else if(tab == EAppTabs.Db)
			view = <AppDBPage/>;
		else if(tab == EAppTabs.Aws)
			view = <AppAWSPage/>;
		else if(tab == EAppTabs.Err)
			view = <App_ErrPage/>;
		else if(tab == EAppTabs.JVM)
			view = <App_JVMStatsPage/>;
		else if(tab == EAppTabs.Env)
			view = <App_EnvPage/>;
		else if(tab == EAppTabs.Deploys)
			view = <App_DeploysPage/>;
		else if(tab == EAppTabs.Live)
			view = <App_RealtimePage/>;
		else if(tab == EAppTabs.Profiler)
			view = <App_ProfilerPage/>;

		else if(tab == EAppTabs.Settings)
			view = <App_SettingsPage/>;

		return (
			<div>
				{this.renderNavbar()}
				{this.renderAgentVersionWarning()}
				{view}
			</div>
		);
	}
}


export const AppFrame = connect((state, props)=> appFrameConnector(state,props))(AppFrame_connect);