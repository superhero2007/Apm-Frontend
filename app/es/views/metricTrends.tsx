import * as React from "react";
import {connect} from "react-redux";
import {AbstractMetricDetailView} from "./abstractMetricDetailView";
import {IDSTabState} from "./tab";
import {Http} from "../../http";
import {IESViewProps} from "../esViews";
import {QueryRequests} from "../queryRequests";
import {updateObj} from "../../reducers/esReducer";
import {DSTabType} from "../widgets/dsTabs";
import {IMetricTrendContainer, ITimeOfDayContainer, MetricTrends} from "../widgets/metricTrends";
import {esDetailConnector} from "../../reduxConnectors";

declare var require:any;
var jstz = require('jstimezonedetect');

interface IState
{
	trends:IMetricTrendContainer;
	dayOfWeek:  ITimeOfDayContainer;
	timeOfDay:  ITimeOfDayContainer;
}

export function MetricTrendsView_getDefaultTabState(): IDSTabState
{
	return {type: DSTabType.trends};
}

class MetricTrendsView_connect extends AbstractMetricDetailView<IESViewProps, IState>
{
	protected getMetricFetchURLs():string[]
	{
		return [];
	}

	protected getHttpRequests(props:IESViewProps) :JQueryXHR[]
	{
		const tz = jstz.determine().name();
		const body = QueryRequests.postBody_detailFilter(props.esDetail);
		const bodyWTimezone = updateObj(body, {timezone: tz});

		return [Http.postJSON("/xapp/es/trends", body),Http.postJSON("/xapp/es/dayofweek", bodyWTimezone),Http.postJSON("/xapp/es/timeofday", bodyWTimezone)];
	}

	protected initialState():IState
	{
		return {trends:null, dayOfWeek: null, timeOfDay: null};
	}

	protected getStateFromPostResponse(responseData:any):IState
	{
		return {trends: responseData[0], dayOfWeek: responseData[1], timeOfDay: responseData[2]};
	}



	protected renderContent(data:IState):any
	{
		return <MetricTrends trends={data.trends} dayOfWeek={data.dayOfWeek} timeOfDay={data.timeOfDay}/>;
	}
}

export const MetricTrendsView = connect((state)=> esDetailConnector(state))(MetricTrendsView_connect);