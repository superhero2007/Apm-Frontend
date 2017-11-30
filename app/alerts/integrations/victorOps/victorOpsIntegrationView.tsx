import * as React from 'react';
import {IVictorOpsIntegration} from "./../integrationsPage";
import {VictorOpsForm} from './victorOpsForm';
import {DSTable} from './../../../widgets/dsTable';
import {IntegrationView} from "./../integrationView";

export class VictorOpsIntegrationView extends IntegrationView<IVictorOpsIntegration>
{
	protected getFormComponent()
	{
		return VictorOpsForm;
	}

	protected getDisconnectURL():string
	{
		return "/integrations/victorOps/disconnect";
	}

	protected getServiceName():string
	{
		return "VictorOps";
	}

	protected renderSettingsView(settings:IVictorOpsIntegration):any
	{
		return (
			<DSTable columnNames={["Setting","Value"]} >
				<tr>
					<td>API Key</td>
					<td>{settings.apiKey}</td>
				</tr>
				<tr>
					<td>Route Key</td>
					<td>{settings.routeKey}</td>
				</tr>
			</DSTable>
		);
	}
}