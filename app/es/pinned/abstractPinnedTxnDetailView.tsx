import * as React from "react";
import {LoadableComponent} from "../../widgets/loadableComponent";
import {QueryRequests} from "../queryRequests";
import {IPinnedTxnComponentProps} from "./pinnedTxnList";
import {Http} from "../../http";
import {ChangeDetectionPinnedRR} from "./changeDetectRRPinned";

export abstract class AbstractPinnedTxnDetailView<P extends IPinnedTxnComponentProps, S> extends LoadableComponent<P,S>
{
	componentWillReceiveProps(nextProps:IPinnedTxnComponentProps)
	{
		const newRR = nextProps.pinnedTxnRedr;
		const oldRR = this.props.pinnedTxnRedr;

		if(ChangeDetectionPinnedRR.global(oldRR, newRR))
		{
			this.reloadData(nextProps);
		}
	}


	protected getHttpRequests(props:IPinnedTxnComponentProps) :JQueryXHR[]
	{
		const body = QueryRequests.postBody_Pinned_detailFilter(props.pinnedTxnRedr);
		return this.getMetricFetchURLs().map(url => Http.postJSON(url, body));
	}

	protected abstract getMetricFetchURLs(): string[];
}