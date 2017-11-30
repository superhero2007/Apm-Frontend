import * as React from "react";
import * as _ from "lodash";
import {IAppPageProps} from "./applicationPage";
import {LoadableComponent} from "../../widgets/loadableComponent";
import {TimeRangeFilter} from "../../es/filters/timeRangeFilter";
import {AmplitudeAnalytics} from "../../analytics";
import {action_AppJVM_updateSelectedJVM, IRR_App_JVM} from "../../reducers/appReducer";
import {connect} from "react-redux";
import {IJVMLabel, JVMFilters} from "../../es/pinned/jvmFilters";
import {ChangeDetectionAppRR} from "../../es/pinned/changeDetectRRPinned";
import {Col, ListGroup, ListGroupItem, Row} from "react-bootstrap";
import {Http} from "../../http";
import {QueryRequests} from "../../es/queryRequests";
import {JVMDetail} from "./jvmDetail";
import {IJVMDetail} from "../trace/traceStructs";
import {RowCol} from "../../widgets/rowCol";
import {IJVMEnv, JvmEnvView} from "./jvmEnv";
import {accountStatus} from "../../accountStatus";
import {NeedPro} from "../../widgets/needPro";
import {appJVMConnector} from "../../reduxConnectors";

export interface IAppJVMPageProps extends IAppPageProps
{
	appJVM?: IRR_App_JVM;
}

export function AbstractJVMPage_getDefaultPageState(): IRR_App_JVM
{
	return { metric: null, metricRealName: null };
}

abstract class AbstractJVMPage extends LoadableComponent<IAppJVMPageProps, {}>
{

	constructor(props, context)
	{
		super(props, context);
		AmplitudeAnalytics.track(this.analyticsPageName());
	}


	protected initialState(): {}
	{
		return {};
	}
	protected getStateFromPostResponse(responseData: any): {}
	{
		return {};
	}

	protected renderContent(data: {}): any
	{
		if(!accountStatus.isPro)
		{
			const needPro = this.needProView();
			if(needPro)
				return needPro;
		}

		const jvmId = this.props.appJVM.metricRealName;
		let detail;
		if(jvmId)
		{
			detail = this.detailView();
		}

		return (
			<div>
				<div className="bottom1">
					<TimeRangeFilter redrName="app"/>
				</div>
				<Row>
					<Col xs={3}>
						<JVMList/>
					</Col>
					<Col xs={9}>
						{detail}
					</Col>
				</Row>
			</div>
		);
	}

	abstract analyticsPageName():string;
	abstract detailView();
	abstract needProView();
}



class App_JVMStatsPage_connect extends AbstractJVMPage
{

	needProView()
	{
		return <NeedPro pageName="JVM Stats "/>;
	}

	analyticsPageName(): string
	{
		return "App - JVM Stats Page";
	}

	detailView()
	{
		return <JVMDetailPage/>;
	}
}



class App_EnvPage_connect extends AbstractJVMPage
{
	needProView()
	{
		return null;
	}

	analyticsPageName(): string
	{
		return "App - Env Page";
	}

	detailView()
	{
		return <JVMEnvPage/>;
	}
}

interface IJVMListState
{
	jvms: IJVMLabel[];
}

class JVMList_connect extends LoadableComponent<IAppJVMPageProps, IJVMListState>
{
	protected initialState(): IJVMListState
	{
		return {jvms: []};
	}

	protected getHttpRequests(props:IAppJVMPageProps):JQueryXHR[]
	{
		return [JVMFilters.fetchJvmsForApp(props.appInfo.app.id, props.app.timeRange)];
	}

	protected getStateFromPostResponse(responseData: any): IJVMListState
	{
		const jvms: IJVMLabel[] = responseData[0];

		if(!this.props.appJVM.metricRealName && !_.isEmpty(jvms))
		{
			this.props.dispatch(action_AppJVM_updateSelectedJVM(jvms[0]));
		}

		return {jvms: jvms};
	}

	componentWillReceiveProps(nextProps:IAppJVMPageProps)
	{
		const newRR = nextProps.app;
		const oldRR = this.props.app;

		if (ChangeDetectionAppRR.timeRange(oldRR, newRR))
		{
			this.reloadData(nextProps);
		}
	}

	private onSelect(jvm:IJVMLabel)
	{
		this.props.dispatch(action_AppJVM_updateSelectedJVM(jvm));
	}

	protected renderContent(data: IJVMListState): any
	{
		if(_.isEmpty(data.jvms))
		{
			return <h4>No JVM active in this time range</h4>;
		}

		const selectedJVMId = this.props.appJVM.metricRealName;
		return (
			<div>
				<ListGroup>
					{data.jvms.map(jvm => <ListGroupItem key={jvm.id} onClick={this.onSelect.bind(this, jvm)} active={jvm.id === selectedJVMId}>{jvm.label}</ListGroupItem>)}
				</ListGroup>
			</div>
		);
	}
}

interface IJVMDetailState {
	jvmDetail: IJVMDetail;
}



class JVMDetailPage_connect extends LoadableComponent<IAppJVMPageProps, IJVMDetailState>
{
	protected initialState(): IJVMDetailState
	{
		return {jvmDetail: null};
	}

	protected getStateFromPostResponse(responseData: any): IJVMDetailState
	{
		return {jvmDetail: responseData[0]};
	}

	protected getHttpRequests(props:IAppJVMPageProps):JQueryXHR[]
	{
		const appId = props.appInfo.app.id;
		const unixTimeRange = QueryRequests.restifyTimeRange(props.app.timeRange);
		const jvmId = props.appJVM.metricRealName;
		const params = {
			appId: appId,
			beginTime: unixTimeRange.begin,
			endTime: unixTimeRange.end,
			jvmid: jvmId
		};

		return [Http.post("/getdata", params)];
	}

	componentWillReceiveProps(nextProps:IAppJVMPageProps)
	{
		const newRR = nextProps.app;
		const oldRR = this.props.app;

		if (ChangeDetectionAppRR.timeRange(oldRR, newRR) || ChangeDetectionAppRR.metric(this.props.appJVM, nextProps.appJVM))
		{
			this.reloadData(nextProps);
		}
	}

	protected renderContent(data: IJVMDetailState): any
	{
		return (
			<div>
				<RowCol>
					<JVMDetail jvmDetail={data.jvmDetail} dispatch={this.props.dispatch}/>
				</RowCol>
			</div>
		);
	}
}



interface IJVMEnvState
{
	env: IJVMEnv;
}


class JVMEnvPage_connect extends LoadableComponent<IAppJVMPageProps, IJVMEnvState>
{
	protected initialState(): IJVMEnvState
	{
		return {env: null};
	}

	protected getStateFromPostResponse(responseData: any): IJVMEnvState
	{
		return {env: responseData[0]};
	}

	protected getHttpRequests(props:IAppJVMPageProps):JQueryXHR[]
	{
		const jvmId = props.appJVM.metricRealName;
		const params = {
			jvmid: jvmId
		};

		return [Http.post("/envinfo", params)];
	}

	componentWillReceiveProps(nextProps:IAppJVMPageProps)
	{
		if (ChangeDetectionAppRR.metric(this.props.appJVM, nextProps.appJVM))
		{
			this.reloadData(nextProps);
		}
	}

	protected renderContent(data: IJVMEnvState): any
	{
		return (
			<div>
				<RowCol>
					<JvmEnvView env={data.env}/>
				</RowCol>
			</div>
		);
	}
}

const JVMEnvPage = connect((state)=> appJVMConnector(state))(JVMEnvPage_connect);
const JVMDetailPage = connect((state)=> appJVMConnector(state))(JVMDetailPage_connect);
const JVMList = connect((state)=> appJVMConnector(state))(JVMList_connect);
export const App_JVMStatsPage = connect((state)=> appJVMConnector(state))(App_JVMStatsPage_connect);
export const App_EnvPage = connect((state)=> appJVMConnector(state))(App_EnvPage_connect);