import * as React from "react";
import {connect} from "react-redux";
import {IESViewProps} from "../esViews";
import {LoadableComponent} from "../../widgets/loadableComponent";
import {IAppIdName} from "./errTrendsView";
import {QueryRequests} from "../queryRequests";
import {ErrTraceViewer} from "./errTraceViewer";
import {esDetailConnectorWithProps} from "../../reduxConnectors";

export interface IErrSample
{
	timestamp: number;
	s3ID: string;
}

interface IState
{
	data: IErrSample[];
}

interface IErrTraceViewerProps
{
	app: IAppIdName;
	onClose: () => void;
}

type IProps = IErrTraceViewerProps & IESViewProps;

class ErrTraceViewerPage_connect extends LoadableComponent<IProps, IState>
{

	protected getPostData(): any
	{
		const unixTimeRange = QueryRequests.timeRange(this.props.esDetail);
		return {
			begin: unixTimeRange.begin,
			end: unixTimeRange.end,
			appId: this.props.app.appId,
			metricName: this.props.esDetail.selectedMetricRealName
		};
	}

	protected getPostUrl(): string
	{
		return "/err/trace/list";
	}

	protected initialState(): IState
	{
		return {data: null};
	}

	protected getStateFromPostResponse(reponseData: any): IState
	{
		return {data: reponseData};
	}


	protected renderContent(data: IState): any
	{
		return <ErrTraceViewer data={data.data} app={this.props.app} onClose={this.props.onClose}/>;
	}
}

export const ErrTraceViewerPage = connect((state, props: IErrTraceViewerProps) => esDetailConnectorWithProps(state, props))(ErrTraceViewerPage_connect);