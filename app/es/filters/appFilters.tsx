import * as React from "react";
import * as _ from "lodash";
import {Panel} from "react-bootstrap";
import {connect} from "react-redux";
import {action_updateAppFilter, updateObj} from "../../reducers/esReducer";
import {ITargetApp} from "../../alerts/policies/detail/condition/selectApp";
import {esDetailConnectorWithProps} from "../../reduxConnectors";
import {IESViewProps} from "../esViews";
import {SelectAllOrOnlyApp} from "../../widgets/selectAllOrOnly";

export interface IAppFilterState
{
	isAllApps: boolean;
	appIds_allApps: string[];
	appIds_selectedApps: string[];
}

interface IAppFilterProps
{
	appList: ITargetApp[];
}

type IProps = IAppFilterProps & IESViewProps;


export function AppFilters_defaultAppFilerState(): IAppFilterState
{
	return {isAllApps: true, appIds_allApps: [], appIds_selectedApps: []};
}

class AppFilters_connect extends React.Component<IProps, {}>
{

	private defaultSelected_AllApps: ITargetApp[];
	private defaultSelected_SelectApps: ITargetApp[];

	constructor(props)
	{
		super(props);

		const appFilter = this.props.esDetail.appFilter;

		this.defaultSelected_AllApps = this.selectApps(appFilter.appIds_allApps);
		this.defaultSelected_SelectApps = this.selectApps(appFilter.appIds_selectedApps);
	}

	private selectApps(appIds: string[])
	{
		return _.filter(this.props.appList, (app: ITargetApp) => {
			return appIds.includes(app.id);
		});
	};

	private onRadioChange(isAll: boolean)
	{
		this.updateAppFilter({isAllApps: isAll});
	}

	private onSelectAppsSelectionChange(appIds: string[])
	{
		this.updateAppFilter({appIds_selectedApps: appIds});
	}

	private onAllAppsSelectionChange(appIds: string[])
	{
		this.updateAppFilter({appIds_allApps: appIds});
	}

	private updateAppFilter(newProps: any)
	{
		const appFilter = updateObj(this.props.esDetail.appFilter, newProps);
		this.props.dispatch(action_updateAppFilter(appFilter));
	}

	render()
	{
		const appFilter = this.props.esDetail.appFilter;

		return (
			<Panel style={({borderRadius: 0})}>
				<SelectAllOrOnlyApp onRadioSelection={this.onRadioChange.bind(this)} select_All={appFilter.isAllApps}  itemList={this.props.appList}
				                    default_selectAll={this.defaultSelected_AllApps} default_selectOnly={this.defaultSelected_SelectApps}
				                    onSelectAll_change={this.onAllAppsSelectionChange.bind(this)}  onSelectOnly_change={this.onSelectAppsSelectionChange.bind(this)} />
			</Panel>
		);
	}
}

export const AppFilters = connect((state, props: IAppFilterProps) => esDetailConnectorWithProps(state, props))(AppFilters_connect);