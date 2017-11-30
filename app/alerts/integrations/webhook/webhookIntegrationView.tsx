import * as React from 'react';
import {IWebhookIntegration} from "./../integrationsPage";
import {DSTable} from './../../../widgets/dsTable';
import {IntegrationView} from "./../integrationView";
import {WebhookForm} from "./webhookForm";

export class WebhookIntegrationView extends IntegrationView<IWebhookIntegration>
{
	protected getFormComponent()
	{
		return WebhookForm;
	}

	protected getDisconnectURL():string
	{
		return "/integrations/webhook/disconnect";
	}

	protected getServiceName():string
	{
		return "Webhook";
	}

	protected renderSettingsView(settings:IWebhookIntegration):any
	{
		return (
			<DSTable columnNames={["Setting","Value"]} >
				<tr>
					<td>URL</td>
					<td>{settings.url}</td>
				</tr>
			</DSTable>
		);
	}
}