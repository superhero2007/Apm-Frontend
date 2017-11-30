import * as React from "react";
import {IESViewProps} from "../esViews";
import {ISeriesData} from "../views/metricDetailView";
import {connect} from "react-redux";
import {AbstractMetricDetailView} from "../views/abstractMetricDetailView";
import {ErrRateMultiLineChart} from "../charts/ErrRateMultiLineChart";
import {StackedAreaChart} from "../charts/stackedAreaChart";
import {epmDisplay} from "../metricUtils";
import {esDetailConnector} from "../../reduxConnectors";

interface IState
{
	errRates: ISeriesData[];
	top5: ISeriesData[];
}

class ERROverviewPage_connect extends AbstractMetricDetailView<IESViewProps, IState>
{

	protected getMetricFetchURLs(): string[]
	{
		return ["/xapp/es/err/top/perapp", "/xapp/es/err/top5"];
	}

	protected initialState(): IState
	{
		return {errRates: [], top5: []};
	}


	protected getStateFromPostResponse(reponseData: any): IState
	{
		return {errRates: reponseData[0], top5: reponseData[1]};
	}

	protected renderContent(data: IState): any
	{
		return (
			<div>
				<h3>Top Applications by Error Rate</h3>
				<ErrRateMultiLineChart seriesList={data.errRates} dispatch={this.props.dispatch}/>
				<h3>Top Exceptions</h3>
				<StackedAreaChart seriesList={data.top5} dispatch={this.props.dispatch} displayFunc={epmDisplay}/>
			</div>
		);
	}

}

export const ERROverviewPage = connect((state) => esDetailConnector(state))(ERROverviewPage_connect);
