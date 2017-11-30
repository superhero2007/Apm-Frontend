import * as React from 'react';
import {ISlackIntegration} from "./../integrationsPage";
import {SlackForm} from './slackForm';
import {DSTable} from './../../../widgets/dsTable';
import {IntegrationView} from "./../integrationView";

export class SlackIntegrationView extends IntegrationView<ISlackIntegration>
{
	protected getFormComponent()
	{
		return SlackForm;
	}

	protected getDisconnectURL():string
	{
		return "/integrations/slack/delete";
	}

	protected getServiceName():string
	{
		return "Slack";
	}

	protected renderSettingsView(settings:ISlackIntegration):any
	{
		return (
			<DSTable columnNames={["Setting","Value"]} >
				<tr>
					<td>Webhook URL</td>
					<td>{settings.webhookUrl}</td>
				</tr>
				<tr>
					<td>Channel</td>
					<td>{settings.channel}</td>
				</tr>
			</DSTable>
		);
	}
}