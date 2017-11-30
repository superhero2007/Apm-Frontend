import * as React from "react";
import {connect} from "react-redux";
import {AbstractContainerPage} from "./abstractContainerPage";
import {routableEsDetailConnector} from "../reduxConnectors";


class ESContainerPage_connect extends AbstractContainerPage
{
	constructor(props, context)
	{
		super(props, context);
	}

	protected onStoreChange(encodedJSON: string)
	{
		this.context.router.replace(`/es/${encodedJSON}`);
	}

	protected pageName():string
	{
		return "External Services";
	}
}

export const ESContainerPage = connect((state, props) => routableEsDetailConnector(state, props))(ESContainerPage_connect);