import * as React from "react";
import {RowCol} from "./../widgets/rowCol";
import {connect} from "react-redux";
import {LoadableComponent} from "../widgets/loadableComponent";
import {ITargetApp} from "../alerts/policies/detail/condition/selectApp";
import {AppFilters} from "./filters/appFilters";
import {TimeRangeFilter} from "./filters/timeRangeFilter";
import {IESViewProps} from "./esViews";
import {esDetailConnector} from "../reduxConnectors";


class ESFiltersPage_connect extends LoadableComponent<IESViewProps, {}>
{
	protected appList: ITargetApp[] = [];

	protected initialState(): {}
	{
		return {};
	}

	protected getPostUrl(): string
	{
		return "/alert/targetApps";
	}

	protected getStateFromPostResponse(reponseData: any): {}
	{
		this.appList = reponseData;
		return {};
	}

	protected renderContent(data: {}): any
	{
		return (
			<div className="bottom2">
				<RowCol>
					<TimeRangeFilter redrName="esDetail"/>
				</RowCol>
				<RowCol className="top2">
					<AppFilters appList={this.appList}/>
				</RowCol>
			</div>
		);
	}


}

export const ESFiltersPage = connect((state) => esDetailConnector(state))(ESFiltersPage_connect);
