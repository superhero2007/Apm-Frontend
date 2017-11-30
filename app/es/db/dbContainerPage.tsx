import * as React from "react";
import {connect} from "react-redux";
import {AbstractContainerPage} from "../abstractContainerPage";
import {getRouteParam} from "../../utils";
import {AbstractDBPage} from "../abstractDBPage";
import {routableEsDetailConnector} from "../../reduxConnectors";


class DBContainerPage_connect extends AbstractContainerPage
{
	constructor(props, context)
	{
		super(props, context);
	}

	protected onStoreChange(encodedJSON: string)
	{
		const db = getRouteParam(this.props, "db");
		this.context.router.replace(`/${AbstractDBPage.getRootRouteName(this.props)}/${db}/${encodedJSON}`);
	}

	protected pageName(): string
	{
		return "Databases";
	}
}

export const DBContainerPage = connect((state, props) => routableEsDetailConnector(state, props))(DBContainerPage_connect);