import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {IPagerDutyIntegration} from "./../integrationsPage";
import {DSTable} from "../../../widgets/dsTable";
import {IntegrationView} from "./../integrationView";

export class PDIntegration extends IntegrationView<IPagerDutyIntegration>
{
	protected getFormComponent()
	{
		return null;
	}

	protected getDisconnectURL():string
	{
		return "/integrations/pagerduty/disconnect";
	}

	protected getServiceName():string
	{
		return "PagerDuty";
	}


	protected canEditSettings():boolean
	{
		return false;
	}

	protected renderSettingsView(pd:IPagerDutyIntegration):any
	{
		return (
			<DSTable columnNames={["Setting","Value"]}>
				<tr>
					<td>Account</td>
					<td>{pd.account}.pagerduty.com</td>
				</tr>
				<tr>
					<td>Service Name</td>
					<td>{pd.serviceName}</td>
				</tr>
				<tr>
					<td>Service Key</td>
					<td>{pd.serviceKey}</td>
				</tr>
			</DSTable>
		);
	}
}