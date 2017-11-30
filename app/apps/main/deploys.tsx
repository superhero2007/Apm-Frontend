import * as React from "react";
import {connect} from "react-redux";
import {IAppPageProps} from "./applicationPage";
import {LoadableComponent} from "../../widgets/loadableComponent";
import {DSTable} from "../../widgets/dsTable";
import {AlertUtils} from "../../alerts/AlertUtils";
import {accountStatus} from "../../accountStatus";
import {NeedPro} from "../../widgets/needPro";
import {RowCol} from "../../widgets/rowCol";
import {Http} from "../../http";
import {AmplitudeAnalytics} from "../../analytics";
import {appPageConnector} from "../../reduxConnectors";


class App_DeploysPage_connect extends React.Component<IAppPageProps, {}>
{
	constructor(props, context)
	{
		super(props, context);
		AmplitudeAnalytics.track("App - Deployments Page");
	}

	render()
	{
		if(!accountStatus.isPro)
			return <NeedPro pageName={"Deployments"}/>;

		const appInfo = this.props.appInfo;

		return (
			<div>
				<DeployListPage appId={appInfo.app.id}/>
			</div>
		);
	}
}


interface IDeployKey {
	deployTime: number;
	appId     : string;
}

interface IDeploy
{
	id              :IDeployKey;
	description     :string;
	username        :string;
	revision        :string;
}

interface IPartialAccInfo
{
	apiKey: string;
}

interface IDeployListState
{
	deploys: IDeploy[];
	accInfo: IPartialAccInfo;
}

class DeployListPage extends LoadableComponent<{
	appId: string;
}, IDeployListState >
{
	protected initialState(): IDeployListState
	{
		return {deploys: [], accInfo: null};
	}

	protected getStateFromPostResponse(responseData: any): IDeployListState
	{
		return {deploys: responseData[0], accInfo: responseData[1]};
	}

	protected getHttpRequests(props:{appId: string}):JQueryXHR[]
	{
		return [Http.post("/deploys/list", {appId: props.appId}), Http.get("/accountinfo")];
	}

	private renderNoDeploys(data: IDeployListState)
	{
		return (
			<div>
				<RowCol className="bottom2">
					<h3>No deploys recorded</h3>
				</RowCol>

				<RowCol className="bottom2">
					<h4>
						You can record your deploys by calling our REST API.
					</h4>
					<h4>
						<a href="https://chronon.atlassian.net/wiki/display/DRIP/Recording+Deployments" target="_blank">Read documentation</a> for details.
					</h4>
				</RowCol>

				<RowCol>
					<h4>Your API Key is <code>{data.accInfo.apiKey}</code></h4>
				</RowCol>
			</div>
		);
	}

	protected renderContent(data: IDeployListState): any
	{
		const deploys = data.deploys;

		if(deploys.length <= 0)
		{
			return this.renderNoDeploys(data);
		}

		let key = 1;
		return (<div>
			<h4>Recent Deployments</h4>
			<DSTable columnNames={["Deployed At", "User", "Revision", "Description"]}>
				{deploys.map(dep => (
					<tr key={key++}>
						<td>
							{AlertUtils.humanize_unixtime(dep.id.deployTime)}
						</td>
						<td>
							{dep.username}
						</td>
						<td>
							{dep.revision}
						</td>
						<td>
							{dep.description}
						</td>
					</tr>
				))}

			</DSTable>
		</div>);
	}

}

export const App_DeploysPage = connect((state)=> appPageConnector(state))(App_DeploysPage_connect);