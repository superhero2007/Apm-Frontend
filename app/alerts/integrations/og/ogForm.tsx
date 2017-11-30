import * as React from "react";
import * as _ from "lodash";
import {updateComponentState} from "../../../utils";
import {RowCol} from "./../../../widgets/rowCol";
import {Http} from "../../../http";
import {IIntegrationSetting} from "./../integrationsPage";
import {IntegrationForm, IGFormState} from "./../integrationForm";
import {FormGroup, ControlLabel, FormControl} from "react-bootstrap";

export interface IOGIntegration extends IIntegrationSetting{
	apiKey  :string;
	teams   :string[];
	tags    :string[];
	recipients  :string[];

}


export interface IOGIntegrationUI {
	apiKey  :string;
	teams   :string;
	tags    :string;
	recipients  :string;
}
interface OGFormState extends IGFormState {
	apiKey      :string;
	teams       :string;
	tags        :string;
	recps       :string;
}
export class OGForm extends IntegrationForm<IOGIntegration, OGFormState>
{
	constructor(props)
	{
		super(props);

		let apiKey = "", teams = "", tags = "", recps = "";
		if(props.defaultSettings)
		{
			apiKey = props.defaultSettings.apiKey;
			teams = props.defaultSettings.teams? props.defaultSettings.teams.join():"";
			tags = props.defaultSettings.tags? props.defaultSettings.tags.join():"";
			recps = props.defaultSettings.recipients? props.defaultSettings.recipients.join():"";

		}

		this.state = {apiKey: apiKey, teams: teams, tags: tags, recps: recps, errorMsg: null};
	}

	private onApiKeyChange(e)
	{
		updateComponentState(this,{apiKey: e.target.value});
	}

	private onTeamsChange(e)
	{
		updateComponentState(this,{teams: e.target.value});
	}

	private onTagsChange(e)
	{
		updateComponentState(this,{tags: e.target.value});
	}

	private onRecpsChange(e)
	{
		updateComponentState(this,{recps: e.target.value});
	}


	protected validate():string
	{
		if(_.isEmpty(this.state.apiKey)) {
			return "Please fill the API key";
		}
		return null;
	}
	protected saveValidatedSettings()
	{
		const settings = this.getSettings();
		const settingsUI:IOGIntegrationUI = {
			apiKey :    settings.apiKey,
			tags   :    settings.tags.join(','),
			teams  :    settings.teams.join(','),
			recipients :    settings.recipients.join(',')
		};
		return Http.post("/integrations/og/update",settingsUI);
	}

	getSettings()  :IOGIntegration
	{
		return {apiKey: this.state.apiKey, teams: OGForm.splitToArray(this.state.teams), tags:   OGForm.splitToArray(this.state.tags), recipients: OGForm.splitToArray(this.state.recps)};
	}

	private static splitToArray(str:string): string[]
	{
		let arr:string[] = [];
		if(!_.isEmpty(str))
		{
			arr = str.split(',');
		}

		return arr;
	}


	renderSettingsForm()
	{
		return (
			<div>
				<RowCol>
					<p>
						<i className="fa fa-lg fa-question-circle" style={{color: "#154D7D"}}/> <a href="https://www.opsgenie.com/docs/integrations/dripstat-integration" target="_blank">Read instructions</a>
					</p>
				</RowCol>
				<RowCol className="top1">
					<FormGroup>
						<ControlLabel>{"API Key"}</ControlLabel>
						<FormControl type="text" value={this.state.apiKey} onChange={this.onApiKeyChange.bind(this)}/>
					</FormGroup>

				</RowCol>
				<RowCol>
					<FormGroup>
						<ControlLabel>{"Teams (Optional)"}</ControlLabel>
						<FormControl type="text" value={this.state.teams} placeholder="Example -  team1, team2" onChange={this.onTeamsChange.bind(this)}/>
					</FormGroup>
				</RowCol>
				<RowCol>
					<FormGroup>
						<ControlLabel>{"Tags (Optional)"}</ControlLabel>
						<FormControl type="text" value={this.state.tags} placeholder="Example -  tag1, tag2" onChange={this.onTagsChange.bind(this)}/>
					</FormGroup>
				</RowCol>
				<RowCol>
					<FormGroup>
						<ControlLabel>{"Recipients (Optional)"}</ControlLabel>
						<FormControl type="text" value={this.state.recps} placeholder="Example -  user1@acme.com, user2@acme.com" onChange={this.onRecpsChange.bind(this)}/>
					</FormGroup>
				</RowCol>
			</div>
		);
	}
}