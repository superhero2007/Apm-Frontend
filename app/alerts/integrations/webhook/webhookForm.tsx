import * as React from "react";
import * as _ from "lodash";
import {updateComponentState} from "../../../utils";
import {RowCol} from "./../../../widgets/rowCol";
import {Http} from "../../../http";
import {IWebhookIntegration} from "./../integrationsPage";
import {IGFormState, IntegrationForm} from "./../integrationForm";
import {FormControl, FormGroup, ControlLabel} from "react-bootstrap";

interface IState extends IGFormState {
	url     :string;
}

export class WebhookForm extends IntegrationForm<IWebhookIntegration, IState>
{
	constructor(props)
	{
		super(props);

		let url = null;
		if(props.defaultSettings)
		{
			url = props.defaultSettings.url;
		}

		this.state = {url: url, errorMsg: null};
	}
	private onUrlChange(e)
	{
		updateComponentState(this,{url: e.target.value});
	}

	protected validate():string
	{
		if(_.isEmpty(this.state.url))
			return "Please input all the required fields";

		let url = this.state.url;
		if(!url.startsWith("http://") && !url.startsWith("https://"))
			return "Invalid URL";

		return null;
	}

	protected saveValidatedSettings()
	{
		return Http.post("/integrations/webhook/update",{url: this.state.url});
	}

	protected getSettings():IWebhookIntegration
	{
		return {url: this.state.url};
	}

	protected renderSettingsForm()
	{
		return (
			<div>
				<RowCol>
					<p>
						<i className="fa fa-lg fa-question-circle" style={{color: "#154D7D"}}/> <a href="https://chronon.atlassian.net/wiki/display/DRIP/Webhook+Integration"  target="_blank">Read instructions</a>
					</p>
				</RowCol>
				<RowCol className="top1">
					<FormGroup>
						<ControlLabel>{"Webhook URL"}</ControlLabel>
						<FormControl type="text" value={this.state.url} onChange={this.onUrlChange.bind(this)}/>
					</FormGroup>
				</RowCol>
			</div>
		);
	}
}