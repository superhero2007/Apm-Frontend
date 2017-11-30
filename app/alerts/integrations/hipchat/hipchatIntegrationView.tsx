import * as React from 'react';
import {IHipChatIntegration} from "./../integrationsPage";
import {DSTable} from './../../../widgets/dsTable';
import {IntegrationView} from "./../integrationView";
import {HipchatForm} from "./hipchatForm";

export class HipchatIntegrationView extends IntegrationView<IHipChatIntegration>
{
	protected getFormComponent()
	{
		return HipchatForm;
	}

	protected getDisconnectURL():string
	{
		return "/integrations/hipchat/disconnect";
	}

	protected getServiceName():string
	{
		return "HipChat";
	}

	protected renderSettingsView(settings:IHipChatIntegration):any
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