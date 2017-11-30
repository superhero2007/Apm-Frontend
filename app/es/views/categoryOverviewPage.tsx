import * as React from "react";
import {AbstractMetricDetailView} from "./abstractMetricDetailView";
import {IESViewProps} from "../esViews";
import {Http} from "../../http";
import {QueryRequests} from "../queryRequests";
import {MetricSortType} from "../widgets/sortedMetricList";
import {connect} from "react-redux";
import {getOpsCategory} from "../metricUtils";
import {OpsOverviewPage} from "./opsOverview";
import {TopXView} from "../widgets/topXView";
import {esDetailConnector} from "../../reduxConnectors";

interface IState
{
	respTimes;
	thps;
	slowest;
}


class CategoryOverviewPage_connect extends AbstractMetricDetailView<IESViewProps,IState>
{
	protected getMetricFetchURLs():string[]
	{
		return undefined;
	}

	protected initialState():IState
	{
		return {respTimes: null, thps: null, slowest: null};
	}

	protected getHttpRequests(props:IESViewProps) :JQueryXHR[]
	{
		const respbody = QueryRequests.postBody_overviewFilter(props.esDetail, MetricSortType.TIME_SPENT);
		const thpbody = QueryRequests.postBody_overviewFilter(props.esDetail, MetricSortType.AVG_THROUGHPUT);
		const slowBody = QueryRequests.postBody_overviewFilter(props.esDetail, MetricSortType.AVG_RESPTIME);
		return [Http.postJSON("/xapp/es/overview/top5", respbody), Http.postJSON("/xapp/es/overview/top5", thpbody), Http.postJSON("/xapp/es/overview/top5", slowBody)];
	}

	protected getStateFromPostResponse(reponseData:any):IState
	{
		return { respTimes: reponseData[0], thps: reponseData[1], slowest: reponseData[2]};
	}

	protected renderContent(data:IState):any
	{
		let opsView;
		const opsCategory = getOpsCategory(this.props.esDetail.metricCategory);
		if(opsCategory)
		{
			opsView = <OpsOverviewPage/>;
		}

		return (
			<div>
				<TopXView respTimes={data.respTimes} thps={data.thps} slowest={data.slowest} dispatch={this.props.dispatch}/>
				{opsView}
			</div>
		);
	}

}

export const CategoryOverviewPage = connect((state)=> esDetailConnector(state))(CategoryOverviewPage_connect);
