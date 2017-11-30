import * as React from "react";
import {MetricCategory} from "../../reducers/esReducer";
import {AbstractDBPage} from "../abstractDBPage";
import {AmplitudeAnalytics} from "../../analytics";
import {dbCategories} from "../metricUtils";


export class DBPage extends AbstractDBPage
{
	constructor(props, context)
	{
		super(props, context);
		AmplitudeAnalytics.track("XApp - Database");
	}
	
	protected noCategoriesMsg()
	{
		return "No Databases";
	}

	protected getProPageName()
	{
		return "Databases";
	}

	protected getSupportedCategories():MetricCategory[]
	{
		return dbCategories();
	}
}
