import * as React from "react";
import {connect} from "react-redux";
import {IESViewProps} from "../esViews";
import {ISlowQueryInfo} from "./slowQueriesListView";
import {LoadableComponent} from "../../widgets/loadableComponent";
import {Http} from "../../http";
import {QueryRequests} from "../queryRequests";
import {ITraceSampleInfo, QueryTrace} from "../widgets/slowQueryTrace";
import {esDetailConnectorWithProps} from "../../reduxConnectors";


interface IState
{
}

interface IQueryTraceProps
{
	onClose: ()=>void;
	slowQuery: ISlowQueryInfo;
}

type IProps = IQueryTraceProps & IESViewProps;

class QueryTraceView_connect extends LoadableComponent<IProps, IState>
{
	private samples:ITraceSampleInfo[];
	
	protected initialState():IState
	{
		return {};
	}

	protected getHttpRequests(props:IProps) :JQueryXHR[]
	{
		const body = QueryRequests.postBody_traceSampleParams(props.esDetail, props.slowQuery);
		return [Http.postJSON("/xapp/es/slowquery/samples", body)];
	}

	protected getStateFromPostResponse(reponseData:any):IState
	{
		this.samples = reponseData[0];
		return this.initialState();
	}

	protected renderContent(data:IState):any
	{
		return <QueryTrace metricCategory={this.props.esDetail.metricCategory} onClose={this.props.onClose} samples={this.samples} slowQuery={this.props.slowQuery}/>;
	}
}


export const QueryTraceView = connect((state, props: IQueryTraceProps)=> esDetailConnectorWithProps(state,props))(QueryTraceView_connect);
