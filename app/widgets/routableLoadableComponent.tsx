import * as React from "react";
import * as PropTypes from "prop-types";
import {LoadableComponent} from "./loadableComponent";

export abstract class RoutableLoadableComponent<P, S> extends LoadableComponent<P,S>
{
	static contextTypes:any = {
		router: PropTypes.any.isRequired
	};

	context:any;

	constructor(props, context)
	{
		super(props, context);
	}
}