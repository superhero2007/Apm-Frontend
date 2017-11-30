import * as React from "react";
import {Grid} from "react-bootstrap";
import {Http} from "../../http";
import {profile} from "../../profile";
import {SlackIntegrationView} from "./slack/slackIntegrationView";
import {VictorOpsIntegrationView} from "./victorOps/victorOpsIntegrationView";
import {WebhookIntegrationView} from "./webhook/webhookIntegrationView";
import {HipchatIntegrationView} from "./hipchat/hipchatIntegrationView";
import {DataDogIntegrationView} from "./datadog/dataDogIntegrationView";
import {RowCol} from "./../../widgets/rowCol";
import {PDIntegration} from "./pd/pagerDutyIntegration";
import {RoutableLoadableComponent} from "../../widgets/routableLoadableComponent";
import "./integrations.css";
import {IOGIntegration} from "./og/ogForm";
import {OGIntegration} from "./og/ogIntegration";
import {PermissionManager, Permission} from "../../roles";

interface IAccountInfo
{
	accId   :string;
}
export interface IIntegrationSetting {

}
export interface IVictorOpsIntegration extends IIntegrationSetting
{
	apiKey  :string;
	routeKey    :string;
}

export interface IDataDogIntegration extends IIntegrationSetting
{
	apiKey  :string;
}

export interface IPagerDutyIntegration extends IIntegrationSetting
{
	account :string;
	serviceName :string;
	serviceKey  :string;
}
export interface ISlackIntegration extends IIntegrationSetting
{
	webhookUrl  :string;
	channel    :string;
}
export interface IWebhookIntegration extends IIntegrationSetting
{
	url :string;
}

export interface IHipChatIntegration extends IIntegrationSetting
{
	url :string;
}
export interface IIntegrations
{
	pagerDuty   :IPagerDutyIntegration;
	slack       :ISlackIntegration;
	og          :IOGIntegration;
	victorOps   :IVictorOpsIntegration;
	webhook     :IWebhookIntegration;
	hipChat     :IHipChatIntegration;
	dataDog     :IDataDogIntegration;
}

interface IState
{
	pagerDuty   :IPagerDutyIntegration;
	slack       :ISlackIntegration;
	og          :IOGIntegration;
	victorOps   :IVictorOpsIntegration
	webhook     :IWebhookIntegration;
	hipChat     :IHipChatIntegration;
	dataDog     :IDataDogIntegration;
}

export class IntegrationsPage extends RoutableLoadableComponent<{},IState>
{
	private accountInfo:IAccountInfo;

	protected initialState():IState
	{
		return {pagerDuty: null, slack: null, og:null, victorOps: null, webhook: null, hipChat: null, dataDog: null};
	}

	protected getPostUrl():string
	{
		return null;
	}

	protected getStateFromPostResponse(reponseData:any):IState
	{
		this.accountInfo = reponseData[0];
		let integrations:IIntegrations = reponseData[1];

		return {pagerDuty: integrations.pagerDuty, slack: integrations.slack, og: integrations.og, victorOps: integrations.victorOps,
			webhook: integrations.webhook, hipChat: integrations.hipChat, dataDog: integrations.dataDog};
	}


	getPromiseToLoad():Promise<any>
	{
		return Promise.all([Http.get("/accountinfo"), Http.post("/integrations/list")])
	}

	private onDisconnectPD()
	{
		this.update_myStateProps({pagerDuty: null});
	}

	private onDisconnectSlack()
	{
		this.update_myStateProps({slack: null});
	}

	private onDisconnectOG()
	{
		this.update_myStateProps({og: null});
	}

	private onDisconnectVictorOps()
	{
		this.update_myStateProps({victorOps: null});
	}

	private onDisconnectWebhook()
	{
		this.update_myStateProps({webhook: null});
	}

	private onDisconnectHipchat()
	{
		this.update_myStateProps({hipChat: null});
	}

	private onDisconnectDataDog()
	{
		this.update_myStateProps({dataDog: null});
	}



	private onAddSlack()
	{
		this.context.router.push('/alerts/addSlack');
	}

	private onAddOG()
	{
		this.context.router.push('/alerts/addOG');
	}

	private onAddVictorOps()
	{
		this.context.router.push('/alerts/addVictorOps');
	}

	private onAddWebhook()
	{
		this.context.router.push('/alerts/addWebhook');
	}

	private onAddHipChat()
	{
		this.context.router.push('/alerts/addHipChat');
	}

	private onAddDataDog()
	{
		this.context.router.push('/alerts/addDataDog');
	}




	private renderAvailableIntegrations(data:IState)
	{
		let pd = null;
		if(!data.pagerDuty)
		{
			const pdCallbackUrl = profile.restServerUrl + `/integrations/callback/pagerduty/${this.accountInfo.accId}`;
			const encodedCallbackUrl = encodeURIComponent(pdCallbackUrl);
			const pdLinkUrl = `https://connect.pagerduty.com/connect?vendor=91f8399d88d06c54d221&callback=${encodedCallbackUrl}`;

			pd =
				<div className="addIntegrationButton">
					<a href={pdLinkUrl}>
						<img src="assets/img/integrations/pagerduty.png"/>
					</a>
				</div>;
		}

		let slack = null;
		if(!data.slack)
		{
			slack =(
				<div className="addIntegrationButton aLink">
					<img src="assets/img/integrations/slack.png" onClick={this.onAddSlack.bind(this)}/>
				</div>);
		}

		let og = null;
		if(!data.og)
		{
			og =(
				<div className="addIntegrationButton aLink">
					<img src="assets/img/integrations/opsgenie.png" onClick={this.onAddOG.bind(this)}/>
				</div>);
		}

		let victorOps = null;

		if(!data.victorOps)
		{
			victorOps =(
				<div className="addIntegrationButton aLink">
					<img src="assets/img/integrations/victorops.png" onClick={this.onAddVictorOps.bind(this)}/>
				</div>);
		}


		let webhook = null;

		if(!data.webhook)
		{
			webhook =(
				<div className="addIntegrationButton aLink">
					<img src="assets/img/integrations/webhook.png" onClick={this.onAddWebhook.bind(this)} title="Webhook"/>
				</div>);
		}


		let hipchat = null;

		if(!data.hipChat)
		{
			hipchat =(
				<div className="addIntegrationButton aLink">
					<img src="assets/img/integrations/hipchat.png" onClick={this.onAddHipChat.bind(this)}/>
				</div>);
		}


		let datadog = null;

		if(!data.dataDog)
		{
			datadog =(
				<div className="addIntegrationButton aLink">
					<img src="assets/img/integrations/datadog.png" onClick={this.onAddDataDog.bind(this)}/>
				</div>);
		}



		const integrationsAvailable = slack!=null || pd!=null || og!=null || victorOps!=null || webhook!=null || hipchat!=null || datadog!=null;

		if(integrationsAvailable)
		{
			return <div>
				<div>
					<h2>Available Integrations</h2>
					<hr/>
				</div>
				<RowCol>
					{pd}
					{slack}
					{hipchat}
					{og}
					{victorOps}
					{datadog}
					{webhook}
				</RowCol>
			</div>;
		}

		return null;
	}

	private renderConnectedIntegrations(data:IState)
	{
		let pd = null;
		if(data.pagerDuty)
		{
			pd = <RowCol className="top2">
					<PDIntegration defaultSettings={data.pagerDuty} onDisconnect={this.onDisconnectPD.bind(this)}/>
				</RowCol>
		}

		let slack = null;
		if(data.slack)
		{
			slack = <RowCol className="top2">
					<SlackIntegrationView defaultSettings={data.slack} onDisconnect={this.onDisconnectSlack.bind(this)}/>
				</RowCol>;
		}

		let og = null;

		if(data.og)
		{
			og = <RowCol className="top2">
					<OGIntegration defaultSettings={data.og} onDisconnect={this.onDisconnectOG.bind(this)}/>
				</RowCol>;
		}

		let victorOps = null;

		if(data.victorOps)
		{
			victorOps = <RowCol className="top2">
							<VictorOpsIntegrationView defaultSettings={data.victorOps} onDisconnect={this.onDisconnectVictorOps.bind(this)}/>
						</RowCol>;
		}

		let webhook = null;
		if(data.webhook)
		{
			webhook = <RowCol className="top2">
				<WebhookIntegrationView defaultSettings={data.webhook} onDisconnect={this.onDisconnectWebhook.bind(this)}/>
			</RowCol>;

		}

		let hipchat = null;
		if(data.hipChat)
		{
			hipchat = <RowCol className="top2">
				<HipchatIntegrationView defaultSettings={data.hipChat} onDisconnect={this.onDisconnectHipchat.bind(this)}/>
			</RowCol>;

		}

		let dataDog = null;
		if(data.dataDog)
		{
			dataDog = <RowCol className="top2">
				<DataDogIntegrationView defaultSettings={data.dataDog} onDisconnect={this.onDisconnectDataDog.bind(this)}/>
			</RowCol>;

		}

		const integrationsAvailable = slack!=null || pd!=null || og!=null || victorOps!=null || webhook!=null || hipchat!=null || dataDog!=null;

		let heading = null;
		if(integrationsAvailable)
		{
			heading = <div>
				<h2>Connected Integrations</h2>
				<hr/>
			</div>;
		}

		return <div className="top2 bottom2">
			{heading}
			{pd}
			{slack}
			{og}
			{victorOps}
			{hipchat}
			{webhook}
			{dataDog}
		</div>;

	}

	protected renderContent(data:IState):any
	{
		if(!PermissionManager.permissionAvailable(Permission.INTEGRATION_EDIT))
		{
			return <h3>No permission to edit integrations at your user role</h3>;
		}
		return (
			<Grid>
				{this.renderAvailableIntegrations(data)}
				{this.renderConnectedIntegrations(data)}
			</Grid>
		);
	}
}