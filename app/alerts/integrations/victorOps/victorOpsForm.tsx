import * as React from "react";
import * as _ from "lodash";
import {IVictorOpsIntegration} from "./../integrationsPage";
import {IGFormState, IntegrationForm} from "./../integrationForm";
import {Http} from "../../../http";
import {RowCol} from "./../../../widgets/rowCol";
import {updateComponentState} from "../../../utils";
import {FormGroup, ControlLabel, FormControl} from "react-bootstrap";

interface IState extends IGFormState
{
	apiKey  :string;
	routeKey    :string;
}
export class VictorOpsForm extends IntegrationForm<IVictorOpsIntegration,IState>
{
	constructor(props)
	{
		super(props);

		let apiKey = "";
		let routeKey = "";
		if(props.defaultSettings)
		{
			apiKey = props.defaultSettings.apiKey;
			routeKey = props.defaultSettings.routeKey;
		}

		this.state = {apiKey: apiKey, routeKey: routeKey, errorMsg: null};
	}

	protected validate():string
	{
		if (_.isEmpty(this.state.apiKey) || _.isEmpty(this.state.routeKey))
			return "Please input all the required fields";

		return null;
	}

	protected saveValidatedSettings()
	{
		return Http.post("/integrations/victorOps/update", {apiKey: this.state.apiKey, routeKey: this.state.routeKey});
	}

	protected getSettings():IVictorOpsIntegration
	{
		return {apiKey: this.state.apiKey, routeKey: this.state.routeKey};
	}

	private onAPIKeyChange(e)
	{
		updateComponentState(this, {apiKey: e.target.value});
	}

	private onRouteKeyChange(e)
	{
		updateComponentState(this, {routeKey: e.target.value});
	}

	protected renderSettingsForm()
	{
		return (
			<div>
				<RowCol className="top1">
					<FormGroup>
						<ControlLabel>{"API Key"}</ControlLabel>
						<FormControl type="text" value={this.state.apiKey} onChange={this.onAPIKeyChange.bind(this)}/>
					</FormGroup>
				</RowCol>
				<RowCol>
					<FormGroup>
						<ControlLabel>{"Route Key"}</ControlLabel>
						<FormControl type="text" value={this.state.routeKey} onChange={this.onRouteKeyChange.bind(this)}/>
					</FormGroup>
				</RowCol>
			</div>
		);
	}

}