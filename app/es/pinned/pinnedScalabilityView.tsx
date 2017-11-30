import * as React from "react";
import {IScalabilityGraph} from "../widgets/scalabilityView";
import {connect} from "react-redux";
import {IDSTabView} from "../widgets/dsTabs";
import {GenericScalabilityView} from "../views/generticScalabilityView";
import {IPinnedTxnComponentProps} from "./pinnedTxnList";
import {AbstractPinnedTxnDetailView} from "./abstractPinnedTxnDetailView";
import {pinnedTxnConnector} from "../../reduxConnectors";

interface IState
{
	graph: IScalabilityGraph;
}

class PinnedMetricScalabilityView_connect extends AbstractPinnedTxnDetailView<IPinnedTxnComponentProps, IState> implements IDSTabView
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
		return <GenericScalabilityView graph={data.graph} timeRange={this.props.pinnedTxnRedr.timeRange}/>
	}
}

export const PinnedMetricScalabilityView = connect((state)=> pinnedTxnConnector(state))(PinnedMetricScalabilityView_connect);