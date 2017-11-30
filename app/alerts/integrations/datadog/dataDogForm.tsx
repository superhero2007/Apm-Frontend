import * as React from "react";
import * as _ from "lodash";
import {updateComponentState} from "../../../utils";
import {RowCol} from "./../../../widgets/rowCol";
import {Http} from "../../../http";
import {IDataDogIntegration} from "./../integrationsPage";
import {IGFormState, IntegrationForm} from "./../integrationForm";
import {FormGroup, ControlLabel, FormControl} from "react-bootstrap";

interface IState extends IGFormState {
	apiKey     :string;
}

export class DataDogForm extends IntegrationForm<IDataDogIntegration, IState>
{
	constructor(props)
	{
		super(props);

		let apiKey = "";
		if(props.defaultSettings)
		{
			apiKey = props.defaultSettings.apiKey;
		}

		this.state = {apiKey: apiKey, errorMsg: null};
	}

	private onApiKeyChange(e)
	{
		updateComponentState(this,{apiKey: e.target.value});
	}

	protected validate():string
	{
		if(_.isEmpty(this.state.apiKey))
			return "Please input all the required fields";

		return null;
	}

	protected saveValidatedSettings()
	{
		return Http.post("/integrations/datadog/update",{apiKey: this.state.apiKey});
	}

	protected getSettings():IDataDogIntegration
	{
		return {apiKey: this.state.apiKey};
	}

	protected renderSettingsForm()
	{
		return (
			<div>

				<RowCol className="top1">
					<FormGroup>
						<ControlLabel>{"DataDog API Key"}</ControlLabel>
						<FormControl type="text" value={this.state.apiKey} onChange={this.onApiKeyChange.bind(this)}/>
					</FormGroup>
				</RowCol>
			</div>
		);
	}
}