import * as React from "react";
import {connect} from "react-redux";
import {IAppPageProps} from "./applicationPage";
import {AmplitudeAnalytics} from "../../analytics";
import {InlineInputEditor} from "../../widgets/inlineEditor";
import {updateComponentState} from "../../utils";
import {DSTable} from "../../widgets/dsTable";
import {RowCol} from "../../widgets/rowCol";
import {Http} from "../../http";
import {action_setAppLabel} from "../../reducers/appInfoReducer";
import {IAppInfo} from "../appListPage";
import {Button} from "react-bootstrap";
import {ConfirmDlg} from "../../widgets/confirmDlg";
import {RoutableLoadableComponent} from "../../widgets/routableLoadableComponent";
import {appPageConnector} from "../../reduxConnectors";


class App_SettingsPage_connect extends React.Component<IAppPageProps, {
	posting;
}>
{
	constructor(props, context)
	{
		super(props, context);
		AmplitudeAnalytics.track("App - Settings Page");

		this.state = {posting: false}
	}

	private onLabelChange(labelObj: string)
	{
		updateComponentState(this, {posting: true});

		const app = this.props.appInfo.app;
		Http.post("/updateAppLabel",{appId: app.id, label: labelObj }).then(()=> {
			this.props.dispatch(action_setAppLabel(labelObj));
			updateComponentState(this, {posting: false});
		});
	}

	private validate(label: string): boolean
	{
		if (label.length == 0 || label.length > 120)
			return false;

		return true;
	}

	render()
	{
		const app = this.props.appInfo.app;

		return (
			<div>
				<RowCol xs={4}>
					<DSTable>
						<tr>
							<td>Label</td>
							<td>
								<InlineInputEditor value={app.label} onChange={this.onLabelChange.bind(this)} validate={this.validate.bind(this)} loading={this.state.posting}/>
							</td>
						</tr>
						<tr>
							<td>Name</td>
							<td>{app.name}</td>
						</tr>

					</DSTable>
				</RowCol>
				<RowCol>
					<DeleteApp appId={app.id}/>
				</RowCol>
			</div>
		);
	}
}

interface IState
{
	appData: IAppInfo;
	deleting: boolean;
}

class DeleteApp extends RoutableLoadableComponent<{appId: string}, IState>
{
	protected initialState(): IState
	{
		return {appData: null, deleting: false};
	}

	protected getPostUrl(): string
	{
		return "/appinfo";
	}


	protected getPostData(): any
	{
		return {appId: this.props.appId};
	}

	protected getStateFromPostResponse(responseData: any): IState
	{
		return {appData: responseData, deleting: false};
	}

	private onTryDelete()
	{
		const ref: ConfirmDlg = this.refs["deleteDlg"] as ConfirmDlg;
		ref.showDlg();
	}

	private onConfirmDelete()
	{
		this.update_myStateProps({deleting: true});
		Http.post("/deleteAppData", {appId: this.props.appId}).then(()=> {
			this.context.router.push("/jvms/apps");
		});

	}

	protected renderContent(data: IState): any
	{
		if(data.appData.isOnline)
		{
			return (
				<div>

					<Button disabled={true}>Delete Application</Button>
					<p className="top1"><i>Cannot delete application while it is online</i></p>
				</div>
			);
		}

		if(data.deleting)
		{
			return (<h3>Deleting...</h3>);
		}

		return (
			<div>
				<Button bsStyle="danger" onClick={this.onTryDelete.bind(this)}>Delete Application</Button>
				<ConfirmDlg ref="deleteDlg" onYes={this.onConfirmDelete.bind(this)}/>
			</div>
		);
	}

}

export const App_SettingsPage = connect((state)=> appPageConnector(state))(App_SettingsPage_connect);