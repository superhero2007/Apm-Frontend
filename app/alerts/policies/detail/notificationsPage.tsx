import * as React from "react";
import * as _ from "lodash";
import {RoutableLoadableComponent} from "../../../widgets/routableLoadableComponent";
import {Grid, Row, Checkbox} from "react-bootstrap";
import {SelectUserEmail} from "./notification/selectUserEmail";
import {getRouteParam} from "../../../utils";
import {Http} from "../../../http";
import {IIntegrations} from "../../integrations/integrationsPage";
import {PromiseButton} from "../../../widgets/promseButton";
import {Permission, PermissionManager} from "../../../roles";
import {NotAllowedDlg} from "../../../widgets/notAllowed";

export interface IUser
{
	fName       :string;
	lastName    :string;
	email       :string;
	confirmed   :boolean;
}

interface IEmailSettings {
	userEmails  :string[];
}

export interface ISimpleEnableSettings {
	enabled: boolean;
}
interface IPagerDutySettings extends ISimpleEnableSettings {}
interface ISlackSettings extends ISimpleEnableSettings {}
interface IOGSettings   extends ISimpleEnableSettings {}
interface IVictorOpsSettings extends ISimpleEnableSettings {}
interface IWebhookSettings extends ISimpleEnableSettings {}
interface IHipchatSettings extends ISimpleEnableSettings {}
interface IDataDogSettings extends ISimpleEnableSettings {}

export interface INotificationSettings {
	email       :IEmailSettings;
	pagerDuty   :IPagerDutySettings;
	slack       :ISlackSettings;
	og          :IOGSettings;
	victorOps   :IVictorOpsSettings;
	webhook     :IWebhookSettings;
	hipChat     :IHipchatSettings;
	dataDog     :IDataDogSettings;
}

interface ISettingsUpdate {
	policyId    :string;
	emails      :string[];
	pagerDutyEnabled    :boolean;
	slackEnabled        :boolean;
	ogEnabled           :boolean;
	victorOpsEnabled    :boolean;
	webhookEnabled      :boolean;
	hipChatEnabled      :boolean;
	dataDogEnabled      :boolean;
}

interface IState
{
	showSavedSnack  :boolean;
	pdEnabled       :boolean;
	slackEnabled    :boolean;
	ogEnabled       :boolean;
	victorOpsEnabled    :boolean;
	webhookEnabled  :boolean;
	hipChatEnabled  :boolean;
	dataDogEnabled      :boolean;
}
export class NotificationSettingsPage extends RoutableLoadableComponent<{},IState>
{
	private allUsers        :IUser[];
	private storedSettings  :INotificationSettings;
	private integrations    :IIntegrations;

	refs:any;

	protected initialState():IState
	{
		return {showSavedSnack: false, pdEnabled: false, slackEnabled: false, ogEnabled: false, victorOpsEnabled: false, webhookEnabled: false, hipChatEnabled: false, dataDogEnabled: false};
	}

	protected getPostUrl():string
	{
		return null;
	}

	getPromiseToLoad():Promise<any>
	{
		const policyId = getRouteParam(this.props, "policyId");

		let data = {policyId: policyId};

		return Promise.all([Http.post("/users/list"), Http.post("/alert/policy/notifications/list", data), Http.post("/integrations/list")]);
	}

	private onSaveClick()
	{
		if(!PermissionManager.permissionAvailable(Permission.ALERT_POLICY_EDIT))
		{
			(this.refs["nadlg"] as NotAllowedDlg).showDlg();
			return null;
		}

		const selectedEmails = this.refs.emailSelect.getSelectedEmails();
		const policyId = getRouteParam(this.props, "policyId");


		const myState = this.getMyState();

		const updateObj:ISettingsUpdate = {
			policyId:           policyId,
			emails:             selectedEmails,
			pagerDutyEnabled:   myState.pdEnabled,
			slackEnabled:       myState.slackEnabled,
			ogEnabled:          myState.ogEnabled,
			victorOpsEnabled:   myState.victorOpsEnabled,
			webhookEnabled:     myState.webhookEnabled,
			hipChatEnabled:     myState.hipChatEnabled,
			dataDogEnabled:     myState.dataDogEnabled
		};

		return Http.postJSON("/alert/policy/notifications/update", updateObj);
	}

	private onSaveDone(data)
	{
		this.updateMyState(Object.assign({},this.getMyState(), {showSavedSnack: true}));
	}

	protected getStateFromPostResponse(reponseData:any):IState
	{
		const userList:IUser[] = reponseData[0];
		this.storedSettings = reponseData[1];
		this.integrations = reponseData[2];


		this.allUsers = _.filter(userList, {confirmed: true});

		let pdEnabled = NotificationSettingsPage.isSettingEnabled(this.storedSettings.pagerDuty);
		let slackEnabled = NotificationSettingsPage.isSettingEnabled(this.storedSettings.slack);
		let ogEnabled = NotificationSettingsPage.isSettingEnabled(this.storedSettings.og);
		let victorOpsEnabled = NotificationSettingsPage.isSettingEnabled(this.storedSettings.victorOps);
		let webhookEnabled = NotificationSettingsPage.isSettingEnabled(this.storedSettings.webhook);
		let hipChatEnabled = NotificationSettingsPage.isSettingEnabled(this.storedSettings.hipChat);
		let dataDogEnabled = NotificationSettingsPage.isSettingEnabled(this.storedSettings.dataDog);

		return {showSavedSnack: false, pdEnabled: pdEnabled, slackEnabled: slackEnabled, ogEnabled: ogEnabled, victorOpsEnabled: victorOpsEnabled, webhookEnabled: webhookEnabled,
			hipChatEnabled: hipChatEnabled, dataDogEnabled: dataDogEnabled};
	}

	private static isSettingEnabled(settings:ISimpleEnableSettings )
	{
		if(settings != null && settings.enabled === true)
			return true;

		return false;
	}


	private onPDEnableChange(e)
	{
		let value = e.currentTarget.checked;
		this.update_myStateProps({pdEnabled: value});
	}

	private onSlackEnableChange(e)
	{
		let value = e.currentTarget.checked;
		this.update_myStateProps({slackEnabled: value});
	}

	private onOGEnableChange(e)
	{
		let value = e.currentTarget.checked;
		this.update_myStateProps({ogEnabled: value});
	}

	private onVictorOpsEnableChange(e)
	{
		let value = e.currentTarget.checked;
		this.update_myStateProps({victorOpsEnabled: value});
	}


	private onWebhookEnableChange(e)
	{
		let value = e.currentTarget.checked;
		this.update_myStateProps({webhookEnabled: value});
	}

	private onHipchatEnableChange(e)
	{
		let value = e.currentTarget.checked;
		this.update_myStateProps({hipChatEnabled: value});
	}

	private onDataDogEnableChange(e)
	{
		let value = e.currentTarget.checked;
		this.update_myStateProps({dataDogEnabled: value});
	}



	private renderPagerDuty(data:IState)
	{
		if(this.integrations.pagerDuty)
		{
			return <Row className="top1">
				<Checkbox checked={data.pdEnabled} onChange={this.onPDEnableChange.bind(this)}>{"PagerDuty"}</Checkbox>
			</Row>;
		}

		return null;
	}

	private renderSlack(data:IState)
	{
		if(this.integrations.slack)
		{
			return <Row className="top1">
				<Checkbox checked={data.slackEnabled} onChange={this.onSlackEnableChange.bind(this)}>{"Slack"}</Checkbox>
			</Row>;
		}

		return null;
	}

	private renderOG(data:IState)
	{
		if(this.integrations.og)
		{
			return <Row className="top1">
				<Checkbox checked={data.ogEnabled} onChange={this.onOGEnableChange.bind(this)}>{"OpsGenie"}</Checkbox>
			</Row>;
		}

		return null;
	}

	private renderVictorOps(data:IState)
	{
		if(this.integrations.victorOps)
		{
			return <Row className="top1">
				<Checkbox checked={data.victorOpsEnabled} onChange={this.onVictorOpsEnableChange.bind(this)}>{"VictorOps"}</Checkbox>
			</Row>;
		}

		return null;
	}


	private renderWebhook(data:IState)
	{
		if(this.integrations.webhook)
		{
			return <Row className="top1">
				<Checkbox checked={data.webhookEnabled} onChange={this.onWebhookEnableChange.bind(this)}>{"Webhook"}</Checkbox>
			</Row>;
		}

		return null;
	}

	private renderHipChat(data:IState)
	{
		if(this.integrations.hipChat)
		{
			return <Row className="top1">
				<Checkbox checked={data.hipChatEnabled} onChange={this.onHipchatEnableChange.bind(this)}>{"HipChat"}</Checkbox>
			</Row>;
		}

		return null;
	}

	private renderDataDog(data:IState)
	{
		if(this.integrations.dataDog)
		{
			return <Row className="top1">
				<Checkbox checked={data.dataDogEnabled} onChange={this.onDataDogEnableChange.bind(this)}>{"DataDog"}</Checkbox>
			</Row>;
		}

		return null;
	}




	protected renderContent(data:IState):any
	{
		let defaultUserSelection:IUser[] = null;

		if(this.storedSettings.email!=null)
		{
			const storedEmails = this.storedSettings.email.userEmails;
			if(!_.isEmpty(storedEmails))
			{
				defaultUserSelection = this.allUsers.filter((user:IUser)=>
				{
					return storedEmails.indexOf(user.email) > -1;
				});
			}
		}

		return (
			<Grid>
				<Row>
					<h5>Email:</h5>
					<SelectUserEmail allUsers={this.allUsers} placeholder="Select Users.." ref="emailSelect" defaultSelectedUsers={defaultUserSelection}/>
				</Row>
				{this.renderPagerDuty(data)}
				{this.renderSlack(data)}
				{this.renderHipChat(data)}
				{this.renderOG(data)}
				{this.renderVictorOps(data)}
				{this.renderWebhook(data)}
				{this.renderDataDog(data)}
				<Row className="top1">
					<PromiseButton bsStyle="success" text="Save" promiseCreator={this.onSaveClick.bind(this)} onPromiseDone={this.onSaveDone.bind(this)}/>
				</Row>
				<NotAllowedDlg ref="nadlg"/>
			</Grid>
		);
	}

}
