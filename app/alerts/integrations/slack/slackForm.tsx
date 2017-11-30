import * as React from "react";
import * as _ from "lodash";
import {updateComponentState} from "../../../utils";
import {RowCol} from "./../../../widgets/rowCol";
import {Http} from "../../../http";
import {ISlackIntegration} from "./../integrationsPage";
import {IGFormState, IntegrationForm} from "./../integrationForm";
import {FormGroup, ControlLabel, FormControl} from "react-bootstrap";

interface SlackFormState extends IGFormState {
	url     :string;
	channel :string;
}

export class SlackForm extends IntegrationForm<ISlackIntegration, SlackFormState>
{
	constructor(props)
	{
		super(props);

		let url = "";
		let channel = "";
		if(props.defaultSettings)
		{
			url = props.defaultSettings.webhookUrl;
			channel = props.defaultSettings.channel;
		}

		this.state = {url: url, channel: channel, errorMsg: null};
	}
	private onUrlChange(e)
	{
		updateComponentState(this,{url: e.target.value});
	}
	private onChannelChange(e)
	{
		updateComponentState(this,{channel: e.target.value});
	}

	protected validate():string
	{
		if(_.isEmpty(this.state.url) || _.isEmpty(this.state.channel))
			return "Please input all the required fields";

		return null;
	}

	protected saveValidatedSettings()
	{
		return Http.post("/integrations/slack/update",{webhook: this.state.url, channel: this.state.channel});
	}

	protected getSettings():ISlackIntegration
	{
		return {webhookUrl: this.state.url, channel:    this.state.channel};
	}

	protected renderSettingsForm()
	{
		return (
			<div>
				<RowCol>
					<p>
						<i className="fa fa-lg fa-question-circle" style={{color: "#154D7D"}}/> <a href="https://chronon.atlassian.net/wiki/display/DRIP/Slack+Integration"  target="_blank">Read instructions</a>
					</p>
				</RowCol>
				<RowCol className="top1">
					<FormGroup>
						<ControlLabel>{"Slack Webhook Url"}</ControlLabel>
						<FormControl type="text" value={this.state.url} onChange={this.onUrlChange.bind(this)}/>
					</FormGroup>
				</RowCol>
				<RowCol>
					<FormGroup>
						<ControlLabel>{"Slack Channel Name"}</ControlLabel>
						<FormControl type="text" value={this.state.channel} placeholder="Example -  #devops" onChange={this.onChannelChange.bind(this)}/>
					</FormGroup>

				</RowCol>
			</div>
		);
	}
}