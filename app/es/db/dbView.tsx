import * as React from "react";
import * as PropTypes from "prop-types";
import {getRouteParam, isNotPresent} from "../../utils";
import {AbstractContainerPage} from "../abstractContainerPage";
import {PlainRoute} from "react-router";
import {AbstractDBPage} from "../abstractDBPage";

export class DbView extends React.Component<{
	children?:any;
	routes?: PlainRoute[];
}, {}>
{
	static contextTypes:any = {
		router: PropTypes.any.isRequired
	};

	context:any;

	componentWillMount()
	{
		const db = getRouteParam(this.props,"db");
		const json = getRouteParam(this.props,"filterJSON");
		if(isNotPresent(json))
		{
			this.goToDB(db);
		}
	}
	
	componentWillReceiveProps(nextProps)
	{
		const currDb = getRouteParam(this.props,"db");
		const nextDb= getRouteParam(nextProps,"db");

		if(currDb !== nextDb)
		{
			this.goToDB(nextDb);
		}
	}

	private goToDB(db:any)
	{
		const encodedJSON = AbstractContainerPage.getDefaultRouteObj(Number(db));
		this.context.router.replace(`/${AbstractDBPage.getRootRouteName(this.props)}/${db}/${encodedJSON}`);
	}

	render()
	{
		return (
			<div>
				{this.props.children}
			</div>
		);
	}
}