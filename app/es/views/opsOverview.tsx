import * as React from "react";
import {AbstractMetricDetailView} from "./abstractMetricDetailView";
import {IESViewProps} from "../esViews";
import {Http} from "../../http";
import {QueryRequests} from "../queryRequests";
import {connect} from "react-redux";
import {getOpsCategory} from "../metricUtils";
import {IStatsByMetricWithSummary, OpsView} from "../widgets/opsView";
import {esDetailConnector} from "../../reduxConnectors";


interface IState
{
	stats:IStatsByMetricWithSummary;
}


class OpsOverviewPage_connect extends AbstractMetricDetailView<IESViewProps,IState>
{
	protected getMetricFetchURLs():string[]
	{
		return undefined;
	}

	protected initialState():IState
	{
		return {stats: null};
	}

	protected getHttpRequests(props:IESViewProps):JQueryXHR[]
	{
		const opsCategory = getOpsCategory(props.esDetail.metricCategory);
		const body = QueryRequests.postBody_OpsFilter(props.esDetail, opsCategory);
		return [Http.postJSON("/xapp/es/ops", body)];
	}

	protected getStateFromPostResponse(reponseData:any):IState
	{
		return {stats: reponseData[0]};
	}

	protected renderContent(data:IState):any
	{
		return <OpsView category={this.props.esDetail.metricCategory} stats={data.stats} dispatch={this.props.dispatch}/>
	}
}

export const OpsOverviewPage= connect((state)=> esDetailConnector(state))(OpsOverviewPage_connect);
