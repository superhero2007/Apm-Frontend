import * as React from "react";
import {NeedPro} from "../../widgets/needPro";
import {accountStatus} from "../../accountStatus";
import {AmplitudeAnalytics} from "../../analytics";
import {IAppPageProps} from "./applicationPage";
import {connect} from "react-redux";
import {LoadableComponent} from "../../widgets/loadableComponent";
import {Http} from "../../http";
import {IAgentVersionInfo} from "../../reducers/appInfoReducer";
import {IJVMLabel} from "../../es/pinned/jvmFilters";
import {Col, ListGroup, ListGroupItem, Row} from "react-bootstrap";
import {PromiseButton} from "../../widgets/promseButton";
import {AlertUtils} from "../../alerts/AlertUtils";
import {DSTable} from "../../widgets/dsTable";
import {RowCol} from "../../widgets/rowCol";
import * as Select from "react-select";
import {Option, ReactSelectClass} from "react-select";
import {SampledProfileViewer} from "./profileViewer";
import {appPageConnector} from "../../reduxConnectors";


class App_ProfilerPage_connect extends React.Component<IAppPageProps, {}>
{
	constructor(props, context)
	{
		super(props, context);
		AmplitudeAnalytics.track("App - Profiler Page");
	}

	render()
	{
		if (!accountStatus.isPro)
			return <NeedPro pageName={"JVM Profiler"}/>;

		const appInfo = this.props.appInfo;

		return (
			<div>
				<ProfilerPage/>
			</div>
		);
	}
}

export interface IProfilingSession
{
	id: string;
	jvmid: string;
	begintime: number;
	endtime: number;
	username: string;
	host: string;
	durationms: number;
}
interface IProfilerPageState
{
	oldAgentInfo: IAgentVersionInfo;
	jvms: IJVMLabel[];
	selectedJVM: IJVMLabel;
	openProfilingSessions: IProfilingSession[];
	profilingSessions: IProfilingSession[];
	profileDuration: number;

	selectedProfile: IProfilingSession;
}


class ProfilerPage_connect extends LoadableComponent<IAppPageProps, IProfilerPageState>
{
	private timerId;

	protected initialState(): IProfilerPageState
	{
		return {oldAgentInfo: null, jvms: [], selectedJVM: null, openProfilingSessions: [], profilingSessions: [], profileDuration: 5, selectedProfile: null};
	}


	protected getHttpRequests(props: IAppPageProps): JQueryXHR[]
	{
		const params = {appId: props.appInfo.app.id};
		return [Http.post("/oldagents", params), Http.post("/app/jvms/current", params),
			Http.post("/profiler/session/open/list", params), Http.post("/profiler/session/list", params)];
	}

	protected getStateFromPostResponse(responseData: any): IProfilerPageState
	{
		const currentJVMs: IJVMLabel[] = responseData[1];

		const jvmsPresent = currentJVMs.length > 0;
		let selectedJVM = jvmsPresent ? currentJVMs[0] : null;

		if (jvmsPresent)
		{
			this.timerId = setInterval(this.refreshData.bind(this), 5000);
		}
		return {oldAgentInfo: responseData[0], jvms: currentJVMs, openProfilingSessions: responseData[2], selectedJVM: selectedJVM, profilingSessions: responseData[3],
			profileDuration: 5, selectedProfile: null};
	}

	componentWillUnmount()
	{
		if (this.timerId)
		{
			clearInterval(this.timerId);
			this.timerId = null;
		}
		super.componentWillUnmount();
	}

	private onSelect(jvm: IJVMLabel)
	{
		this.update_myStateProps({selectedJVM: jvm});
	}

	private onProfile()
	{
		const params = {appId: this.props.appInfo.app.id, jvmId: this.getMyState().selectedJVM.id, durationMins: this.getMyState().profileDuration};
		return Http.post("/profiler/session/start", params);
	}

	private onProfilingStartDone(data: IProfilingSession)
	{
		const sessions = this.getMyState().openProfilingSessions.slice(0);
		sessions.push(data);
		this.update_myStateProps({openProfilingSessions: sessions});
	}

	private onProfileSelect(session:IProfilingSession)
	{
		if(!AlertUtils.hasNotEnded(session.endtime))
		{
			this.update_myStateProps({selectedProfile: session});
		}
	}

	private isOldAgent(data: IProfilerPageState, jvm:IJVMLabel)
	{
		for(const oldAgentJVM of data.oldAgentInfo.jvms)
		{
			if(oldAgentJVM.id === jvm.id)
			{
				const majorVersion = oldAgentJVM.version.split(".")[0];
				if(Number(majorVersion) < 10)
					return true;
			}
		}

		return false;
	}


	private renderJVMProfileScreen(data: IProfilerPageState)
	{
		const jvm = data.selectedJVM;

		const openSession = this.isProfiling(data, jvm);
		if (openSession)
		{
			return (
				<div>
					<h3>{"Profiling..."}</h3>
					<h4>{`Started by ${openSession.username} at ${AlertUtils.humanize_unixtime(openSession.begintime)}`}</h4>
				</div>
			);
		}
		else if(this.isOldAgent(data, jvm))
		{
			return (
				<div>
					<h3>Agent Update Needed</h3>
					<h4>Update to Agent 10 or higher to enable Profiling</h4>
				</div>
			);
		}
		else
		{

			let Select2:any = Select;
			let Select3:ReactSelectClass = Select2;

			return (
				<div>
					<Row>
						<div className="verticalAlign">
							<Col xs={3}>
								<h4>Select Duration:</h4>
							</Col>
							<Col xs={4}>
								<div>
								<Select3
									name="profileDuration"
									value={{value: data.profileDuration, label: data.profileDuration + ` ${this.minsString(data.profileDuration)}`} as any}
									options={this.getDurationOptions()}
									clearable={false}
									searchable={false}
									multi={false}
									onChange={this.onProfileDurationChange.bind(this)}
								/>
								</div>
							</Col>
						</div>
					</Row>
					<Row className="top2">
						<Col xs={4}>
							<PromiseButton text="> Start Profiling" promiseCreator={this.onProfile.bind(this)} onPromiseDone={this.onProfilingStartDone.bind(this)} bsSize="large" bsStyle="success"/>
						</Col>
					</Row>
				</div>
			);
		}
	}

	private onProfileDurationChange(e:Option)
	{
		this.update_myStateProps({profileDuration: Number(e.value)});
	}

	private minsString(mins: number)
	{
		if(mins == 1)
			return "Minute";
		else
			return "Minutes";
	}

	private getDurationOptions()
	{
		let options = [];
		for (let i = 1; i <= 10; i++) {
			options.push({label: i +` ${this.minsString(i)}`, value: i})
		}

		return options;
	}

	private isProfiling(data: IProfilerPageState, jvm: IJVMLabel)
	{
		return data.openProfilingSessions.find(it => it.jvmid === jvm.id);
	}

	private refreshData()
	{
		if (this.timerId)
		{
			const params = {appId: this.props.appInfo.app.id};
			Promise.all([Http.post("/profiler/session/open/list", params), Http.post("/profiler/session/list", params)]).then((data) =>
			{
				if(this.timerId)
				{
					this.update_myStateProps({openProfilingSessions: data[0], profilingSessions: data[1]});
				}
			});
		}
	}

	private renderSessionList(data: IProfilerPageState)
	{
		return (
			<DSTable columnNames={["Began","Ended", "Duration", "Host","Started By"]} classes="top3">
				{data.profilingSessions.map((session) =>
					<tr key={session.id} onClick={this.onProfileSelect.bind(this, session)} className="aLink">
						<td>{AlertUtils.humanize_unixtime(session.begintime)}</td>
						<td>{AlertUtils.humanize_unixtime(session.endtime)}</td>
						<td>{`${session.durationms/60000} ${this.minsString(session.durationms/60000)}`}</td>
						<td>{session.host}</td>
						<td>{session.username}</td>
					</tr>
				)}
			</DSTable>
		);
	}

	private onCloseProfile()
	{
		this.update_myStateProps({selectedProfile: null});
	}

	protected renderContent(data: IProfilerPageState): any
	{
		if(data.selectedProfile)
		{
			return <SampledProfileViewer profileSession={data.selectedProfile} onClose={this.onCloseProfile.bind(this)}/>;
		}

		let jvmData;
		if (data.jvms.length == 0)
		{
			jvmData = <h3>No Active JVMs</h3>;
		}
		else
		{

			jvmData = (
				<Row>
					<Col xs={4}>
						<ListGroup>
							{
								data.jvms.map(jvm => <ListGroupItem key={jvm.id}
								                                    onClick={this.onSelect.bind(this, jvm)}
								                                    active={data.selectedJVM?(jvm.id === data.selectedJVM.id): false}>
									{
										this.isProfiling(data, jvm) ? <span>{`${jvm.label} `}<i className="fa fa-cog fa-spin fa-fw"/></span>: <span>{`${jvm.label}`}</span>
									}
								</ListGroupItem>)
							}
						</ListGroup>
					</Col>
					<Col xs={4}>
						{this.renderJVMProfileScreen(data)}
					</Col>
				</Row>
			);
		}

		return (
			<div>
				{jvmData}
				<RowCol>
					{this.renderSessionList(data)}
				</RowCol>
			</div>
		);
	}

}

export const App_ProfilerPage = connect((state)=> appPageConnector(state))(App_ProfilerPage_connect);
const ProfilerPage = connect((state)=> appPageConnector(state))(ProfilerPage_connect);