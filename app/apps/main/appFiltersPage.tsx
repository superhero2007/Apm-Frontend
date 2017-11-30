import * as React from "react";
import {LoadableComponent} from "../../widgets/loadableComponent";
import {IAppPageProps} from "./applicationPage";
import {IJVMLabel, JVMFilters} from "../../es/pinned/jvmFilters";
import {action_updateJVMFilter} from "../../reducers/pinnedTxnReducer";
import {ChangeDetectionAppRR} from "../../es/pinned/changeDetectRRPinned";
import {TimeRangeFilter} from "../../es/filters/timeRangeFilter";

export interface IAppJVMFilterState {
	jvms:IJVMLabel[];
}


export abstract class AppFiltersPage<T extends IAppPageProps> extends LoadableComponent<T, IAppJVMFilterState>
{
	constructor(props, context)
	{
		super(props, context);
	}

	protected initialState():IAppJVMFilterState
	{
		return {jvms: null};
	}

	protected getStateFromPostResponse(reponseData:any):IAppJVMFilterState
	{
		const jvms = reponseData[0];
		this.props.dispatch(action_updateJVMFilter(JVMFilters.defaultFilterState()));

		return {jvms: jvms};
	}


	protected getHttpRequests(props:IAppPageProps):JQueryXHR[]
	{
		return [JVMFilters.fetchJvmsForApp(props.appInfo.app.id, props.app.timeRange)];
	}

	componentWillReceiveProps(nextProps:IAppPageProps)
	{
		const newRR = nextProps.app;
		const oldRR = this.props.app;

		if (ChangeDetectionAppRR.timeRange(oldRR, newRR))
		{
			this.reloadData(nextProps);
		}
	}

	protected renderContent(data: IAppJVMFilterState): any
	{
		return (
			<div>
				<div className="bottom1">
					<TimeRangeFilter redrName="app"/>
				</div>

				<JVMFilters jvms={data.jvms} filters={this.props.app.jvmFilter} dispatch={this.props.dispatch}/>
				<hr/>
				{this.doRender(data)}
			</div>
		);
	}

	protected abstract doRender(data: IAppJVMFilterState);
}