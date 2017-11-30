import * as React from "react";
import {MetricCategory, action_updateCatTab} from "../../reducers/esReducer";
import {Nav, NavItem} from "react-bootstrap";
import {metricCategoryDisplay} from "../metricUtils";
import "./catTabs.css";

export enum CatTab {
	overview,
	metric
}

export class CategoryTabsWidget extends React.Component<{
	activeTab: CatTab;
	selectedMetric: string;
	dispatch: any;
	metricCategory: MetricCategory;
},{}>
{
	private onSelect(key:CatTab)
	{
		this.props.dispatch(action_updateCatTab(key));
	}

	render()
	{
		let activeTab = this.props.activeTab;
		if(!activeTab)
			activeTab = CatTab.overview;

		let metricName = this.props.selectedMetric;
		let metricSelected = true;
		if(!metricName)
		{
			metricName = "(Select metric on left)";
			metricSelected = false;
		}


		return (
			<div>
				<Nav bsStyle="pills" onSelect={this.onSelect.bind(this)} activeKey={activeTab} className="dsCatTabs">
					<NavItem eventKey={CatTab.overview}>{`${metricCategoryDisplay(this.props.metricCategory)} Overview`}</NavItem>
					<NavItem eventKey={CatTab.metric} disabled={!metricSelected}>{metricName}</NavItem>
				</Nav>
			</div>
		);
	}

}