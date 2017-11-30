import * as React from 'react';
import {AddIntegrationPage} from "../addIntegrationPage";
import {IntegrationForm} from "../integrationForm";
import {DataDogForm} from "./dataDogForm";


export class AddDataDogPage extends AddIntegrationPage
{
	protected serviceName():string
	{
		return "DataDog";
	}

	protected formClass():IntegrationForm<any, any>
	{
		return DataDogForm as any;
	}
}