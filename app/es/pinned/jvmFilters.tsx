import * as React from "react";
import * as _ from "lodash";
import {Panel} from "react-bootstrap";
import {updateObj} from "../../reducers/esReducer";
import {action_updateJVMFilter} from "../../reducers/pinnedTxnReducer";
import {ISer_TimeRange} from "../filters/timerange";
import {QueryRequests} from "../queryRequests";
import {Http} from "../../http";
import {Dispatch} from "redux";
import {SelectAllOrOnlyJVM} from "../../widgets/selectAllOrOnly";


export interface IJVMFilterState
{
	isAll	            :boolean;
	ids_allJVMS	        :string[];
	ids_selectedJVMS	:string[];
}

export interface IJVMLabel {
	id      :string;
	label   :string;
}

interface IProps {
	jvms: IJVMLabel[];
	filters: IJVMFilterState;
	dispatch?   :Dispatch<any>;
}

export class JVMFilters extends React.Component<IProps, {}>
{

	static fetchJvmsForApp(appId: string, timeRange: ISer_TimeRange)
	{
		const unixTimeRange = QueryRequests.restifyTimeRange(timeRange);
		const params = {
			appId: appId,
			begin: unixTimeRange.begin,
			end: unixTimeRange.end
		};

		return Http.post("/app/jvms/list", params);
	}

	static defaultFilterState():IJVMFilterState
	{
		return {isAll: true, ids_allJVMS: [], ids_selectedJVMS: []};
	}


	private defaultSelected_AllJVMS: IJVMLabel[];
	private defaultSelected_SelectJVMS:IJVMLabel[];

	constructor(props)
	{
		super(props);

		const filter = this.props.filters;

		this.defaultSelected_AllJVMS = this.selectJVMS(filter.ids_allJVMS);
		this.defaultSelected_SelectJVMS = this.selectJVMS(filter.ids_selectedJVMS);
	}

	private selectJVMS(jvmIds:string[])
	{
		return _.filter(this.props.jvms, (jvm:IJVMLabel)=>
		{
			return jvmIds.includes(jvm.id);
		});
	};


	private onRadioChange(isAll: boolean)
	{
		this.updateJVMFilter({isAll: isAll});
	}

	private onSelectAppsSelectionChange(jvmIds:string[])
	{
		this.updateJVMFilter({ids_selectedJVMS: jvmIds});
	}

	private onAllAppsSelectionChange(jvmIds:string[])
	{
		this.updateJVMFilter({ids_allJVMS: jvmIds});
	}

	private updateJVMFilter(newProps: any)
	{
		const filter = updateObj(this.props.filters, newProps);
		this.props.dispatch(action_updateJVMFilter(filter));
	}

	render()
	{
		const jvmFilter = this.props.filters;
		return (
			<Panel style={({borderRadius: 0})}>
				<SelectAllOrOnlyJVM onRadioSelection={this.onRadioChange.bind(this)} select_All={jvmFilter.isAll}  itemList={this.props.jvms}
				                    default_selectAll={this.defaultSelected_AllJVMS} default_selectOnly={this.defaultSelected_SelectJVMS}
				                    onSelectAll_change={this.onAllAppsSelectionChange.bind(this)}  onSelectOnly_change={this.onSelectAppsSelectionChange.bind(this)} />

			</Panel>
		);
	}

}