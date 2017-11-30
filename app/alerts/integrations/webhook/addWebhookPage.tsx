import * as React from 'react';
import {AddIntegrationPage} from "../addIntegrationPage";
import {IntegrationForm} from "../integrationForm";
import {WebhookForm} from "./webhookForm";


export class AddWebhookPage extends AddIntegrationPage
{
	protected serviceName():string
	{
		return "Webhook";
	}

	protected formClass():IntegrationForm<any, any>
	{
		return WebhookForm as any;
	}

}