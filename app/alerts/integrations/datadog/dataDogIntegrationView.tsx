import * as React from 'react';
import {IHipChatIntegration, IDataDogIntegration} from "./../integrationsPage";
import {DSTable} from './../../../widgets/dsTable';
import {IntegrationView} from "./../integrationView";
import {DataDogForm} from "./dataDogForm";

export class DataDogIntegrationView extends IntegrationView<IDataDogIntegration>
{
	protected getFormComponent()
	{
		return DataDogForm;
	}

	protected getDisconnectURL():string
	{
		return "/integrations/datadog/disconnect";
	}

	protected getServiceName():string
	{
		return "DataDog";
	}

	protected renderSettingsView(settings:IDataDogIntegration):any
	{
		return (
			<DSTable columnNames={["Setting","Value"]} >
				<tr>
					<td>API Key</td>
					<td>{settings.apiKey}</td>
					</tr>
			</DSTable>
		);
	}
}