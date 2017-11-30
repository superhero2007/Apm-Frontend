import * as React from "react";
import {connect} from "react-redux";
import {IDSTabState} from "./tab";
import {ISlowQueryInfo, SlowQueriesListView} from "./slowQueriesListView";
import {QueryTraceView} from "./queryTraceView";
import {DSTabType} from "../widgets/dsTabs";
import {AbstractMetricDetailView} from "./abstractMetricDetailView";
import {IESViewProps} from "../esViews";
import {esDetailConnector} from "../../reduxConnectors";

interface IState
{
	selectedQuery:ISlowQueryInfo;
	slowQueries: ISlowQueryInfo[];
}

export function SlowQueriesView_getDefaultTabState():IDSTabState
{
	return {type: DSTabType.slowqueries};
}

class SlowQueriesView_connect extends AbstractMetricDetailView<IESViewProps, IState>
{
	protected getMetricFetchURLs(): string[]
	{
		return ["/xapp/es/slowqueries"];
	}

	protected initialState(): IState
	{
		return {slowQueries: [], selectedQuery: null};
	}

	protected getStateFromPostResponse(responseData: any): IState
	{
		return {slowQueries: responseData[0], selectedQuery: null};
	}

	private onSelectQuery(queryInfo:ISlowQueryInfo)
	{
		this.update_myStateProps({selectedQuery: queryInfo});
	}

	private onHideSample()
	{
		this.update_myStateProps({selectedQuery: null});
	}

	protected renderContent(data: IState): any
	{
		if (data.selectedQuery)
			return <QueryTraceView slowQuery={data.selectedQuery} onClose={this.onHideSample.bind(this)}/>;
		else
			return <SlowQueriesListView onSelect={this.onSelectQuery.bind(this)} slowQueries={data.slowQueries}/>;
	}
 }

export const SlowQueriesView = connect((state)=> esDetailConnector(state))(SlowQueriesView_connect);
