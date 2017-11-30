import * as React from "react";
import {AbstractDBPage} from "../abstractDBPage";
import {MetricCategory} from "../../reducers/esReducer";
import {AmplitudeAnalytics} from "../../analytics";
import {awsCategories} from "../metricUtils";


export class AWSPage extends AbstractDBPage
{
	constructor(props, context)
	{
		super(props, context);
		AmplitudeAnalytics.track("XApp - AWS");
	}

	protected noCategoriesMsg()
	{
		return "No AWS Metrics found";
	}

	protected getProPageName()
	{
		return "AWS";
	}

	protected getSupportedCategories():MetricCategory[]
	{
		return awsCategories();
	}
}