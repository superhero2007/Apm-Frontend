import * as React from "react";
import {MetricCategory} from "../../reducers/esReducer";
import {Nav, NavItem} from "react-bootstrap";
import {metricCategoryDisplay} from "../metricUtils";

export class AccountDbTabs extends React.Component<{
	categories: MetricCategory[];
	onSelect: (MetricCategory)=>void;
	selected: MetricCategory;
}, {}>
{
	private onSelectTab(cat: MetricCategory)
	{
		this.props.onSelect(cat);
	}

	private renderCategoryToTab(cat: MetricCategory)
	{
		return <NavItem key={cat} eventKey={cat} className="dsPillTab">{metricCategoryDisplay(cat)}</NavItem>;
	}

	render()
	{
		return (
			<div>
				<Nav bsStyle="pills" onSelect={this.onSelectTab.bind(this)} activeKey={this.props.selected} className="bottom2">
					{this.props.categories.map(c => this.renderCategoryToTab(c))}
				</Nav>

			</div>
		);
	}

}