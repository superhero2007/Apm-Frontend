import * as React from "react";
import {connect} from "react-redux";
import {AbstractMetricDetailView} from "./abstractMetricDetailView";
import {IDSTabState} from "./tab";
import {IESViewProps} from "../esViews";
import {IScalabilityGraph} from "../widgets/scalabilityView";
import {DSTabType} from "../widgets/dsTabs";
import {GenericScalabilityView} from "./generticScalabilityView";
import {esDetailConnector} from "../../reduxConnectors";


interface IState
{
	graph: IScalabilityGraph;
}

export function MetricScalabilityView_getDefaultTabState(): IDSTabState
{
	return {type: DSTabType.scalable};
}

class MetricScalabilityView_connect extends AbstractMetricDetailView<IESViewProps, IState>
{

	protected getMetricFetchURLs():string[]
	{
		return ["/xapp/es/scalability"];
	}

	protected initialState():IState
	{
		return {graph: null};
	}

	protected getStateFromPostResponse(reponseData:any):IState
	{
		return {graph: reponseData[0]};
	}


	protected renderContent(data:IState):any
	{
		return <GenericScalabilityView graph={data.graph} timeRange={this.props.esDetail.timeRange}/>
	}
}

export const MetricScalabilityView= connect((state)=> esDetailConnector(state))(MetricScalabilityView_connect);