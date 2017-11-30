import * as React from "react";
import {LoadableComponent} from "../../widgets/loadableComponent";
import {IESViewProps} from "../esViews";
import {QueryRequests} from "../queryRequests";
import {Http} from "../../http";

export abstract class AbstractMetricDetailView<P extends IESViewProps, S> extends LoadableComponent<P,S>
{
	componentWillReceiveProps(nextProps:IESViewProps)
	{
		const newEsDetail = nextProps.esDetail;
		const esDetail = this.props.esDetail;

		if(QueryRequests.filterChanged_detail(newEsDetail, esDetail))
		{
			this.reloadData(nextProps);
		}
	}


	protected getHttpRequests(props:IESViewProps) :JQueryXHR[]
	{
		const body = QueryRequests.postBody_detailFilter(props.esDetail);
		return this.getMetricFetchURLs().map(url => Http.postJSON(url, body));
	}

	protected abstract getMetricFetchURLs(): string[];
}