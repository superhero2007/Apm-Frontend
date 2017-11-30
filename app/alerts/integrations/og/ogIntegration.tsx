import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {DSTable} from "../../../widgets/dsTable";
import {IOGIntegration} from "./ogForm";
import {OGForm} from './ogForm';
import {IntegrationView} from "./../integrationView";

export class OGIntegration extends IntegrationView<IOGIntegration>
{
	protected getDisconnectURL():string
	{
		return "/integrations/og/delete";
	}

	protected getServiceName():string
	{
		return "OpsGenie";
	}

	protected renderSettingsView(og:IOGIntegration):any
	{
		return <DSTable columnNames={["Setting","Value"]}>
			<tr>
				<td>API Key</td>
				<td>{og.apiKey}</td>
			</tr>
			<tr>
				<td>Teams</td>
				<td>{og.teams? og.teams.join():""}</td>
			</tr>
			<tr>
				<td>Tags</td>
				<td>{og.tags? og.tags.join():""}</td>
			</tr>
			<tr>
				<td>Recipients</td>
				<td>{og.recipients? og.recipients.join():""}</td>
			</tr>
		</DSTable>;
	}

	protected getFormComponent()
	{
		return OGForm;
	}

}