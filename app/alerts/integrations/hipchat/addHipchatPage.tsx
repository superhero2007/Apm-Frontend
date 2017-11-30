import * as React from 'react';
import {AddIntegrationPage} from "../addIntegrationPage";
import {IntegrationForm} from "../integrationForm";
import {HipchatForm} from "./hipchatForm";


export class AddHipchatPage extends AddIntegrationPage
{
	protected serviceName():string
	{
		return "HipChat";
	}

	protected formClass():IntegrationForm<any, any>
	{
		return HipchatForm as any;
	}
}