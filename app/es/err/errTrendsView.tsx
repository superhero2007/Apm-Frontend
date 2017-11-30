import * as React from "react";
import {AbstractMetricDetailView} from "../views/abstractMetricDetailView";
import {IESViewProps} from "../esViews";
import {connect} from "react-redux";
import {ISeriesData} from "../views/metricDetailView";
import {StackedAreaChart} from "../charts/stackedAreaChart";
import {epmDisplay} from "../metricUtils";
import {RowCol} from "../../widgets/rowCol";
import {DSTable} from "../../widgets/dsTable";
import {ErrTraceViewerPage} from "./errTraceViewerPage";
import {esDetailConnector} from "../../reduxConnectors";

export interface IAppIdName
{
	appName: string;
	appId: string;
}

interface IErrData
{
	seriesList: ISeriesData[];
	appIdInfos: IAppIdName[];
}
interface IState
{
	errData: IErrData;
	selectedApp:IAppIdName;
}

class ErrTrendsView_connect extends AbstractMetricDetailView<IESViewProps, IState>
{
	protected getMetricFetchURLs():string[]
	{
		return ["/xapp/es/err/timeline"];
	}

	protected initialState():IState
	{
		return {errData: null, selectedApp: null};
	}

	protected getStateFromPostResponse(reponseData:any):IState
	{
		return {errData: reponseData[0], selectedApp: null};
	}

	private onAppSelect(app:IAppIdName)
	{
		this.update_myStateProps({selectedApp: app});
	}

	private onCloseTraceViewer()
	{
		this.update_myStateProps({selectedApp: null});
	}


	protected renderContent(data:IState):any
	{
		if(data.selectedApp)
		{
			return <ErrTraceViewerPage onClose={this.onCloseTraceViewer.bind(this)} app={data.selectedApp}/>;
		}
		
		return (
			<div>
				<RowCol>
					<StackedAreaChart seriesList={data.errData.seriesList} dispatch={this.props.dispatch} displayFunc={epmDisplay}/>
				</RowCol>

				<RowCol>
					<h4>See Full Stacktrace samples for:</h4>
					<DSTable>
						{data.errData.appIdInfos.map(app => <tr key={app.appId} onClick={this.onAppSelect.bind(this, app)} className="aLink">
							<td>{app.appName}</td>
						</tr>)}
					</DSTable>
				</RowCol>
			</div>
		);
	}

}


export const ErrTrendsView = connect((state)=> esDetailConnector(state))(ErrTrendsView_connect);
