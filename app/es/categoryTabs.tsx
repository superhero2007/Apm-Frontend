import * as React from "react";
import {connect} from "react-redux";
import {IESViewProps} from "./esViews";
import {CategoryTabsWidget} from "./widgets/catTabs";
import {esDetailConnector} from "../reduxConnectors";

class CategoryTabs_connect extends React.Component<IESViewProps, {}>
{
	render()
	{
		const esDetail = this.props.esDetail;

		 return <CategoryTabsWidget activeTab={esDetail.catTab} selectedMetric={esDetail.selectedMetric} dispatch={this.props.dispatch} metricCategory={esDetail.metricCategory}/>;
	}
}

export const CategoryTabs = connect((state)=> esDetailConnector(state))(CategoryTabs_connect);
