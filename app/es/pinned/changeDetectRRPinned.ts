import {IRR_PinnedTxnReducer} from "../../reducers/pinnedTxnReducer";
import {IRR_App, ISortSelectable, IRR_App_Txn, IRR_App_ES, ISelectableMetric} from "../../reducers/appReducer";
import {IJVMFilterState} from "./jvmFilters";
import * as _ from "lodash";
import {IRR_Filter_TimeRange} from "../../reducers/timerangeReducer";
import {IRR_Filter_Host} from "../../reducers/hostFilterReducer";

//return true if changed
export class ChangeDetectionPinnedRR
{

	static global(oldRR:IRR_PinnedTxnReducer, newRR: IRR_PinnedTxnReducer): boolean
	{
		if(this.txnAndTimeRange(oldRR, newRR))
			return true;

		if(oldRR.jvmFilter != newRR.jvmFilter)
			return true;

		return false;
	}
	static txnAndTimeRange(oldRR:IRR_PinnedTxnReducer, newRR: IRR_PinnedTxnReducer): boolean
	{
		if ((newRR.txn !== oldRR.txn) || (newRR.timeRange !== oldRR.timeRange))
			return true;

		return false;
	}
}

export class ChangeDetectionServerRR
{
	//return true if changed
	static selectedHostsChanged(oldRR:IRR_Filter_Host, newRR: IRR_Filter_Host)
	{
		if(newRR.selectedHostIds != oldRR.selectedHostIds)
			return true;

		return false;
	}
}
//return true if changed
export class ChangeDetectionAppRR
{
	static timeRange(oldRR:IRR_Filter_TimeRange, newRR:IRR_Filter_TimeRange):boolean
	{
		if ((newRR.timeRange !== oldRR.timeRange))
			return true;

		return false;
	}

	static category(oldRR: IRR_App_ES, newRR: IRR_App_ES)
	{
		if(oldRR.category != newRR.category)
			return true;

		return false;
	}

	static timeRangeAndJVM(oldRR:IRR_App, newRR:IRR_App):boolean
	{
		if(this.timeRange(oldRR, newRR))
			return true;

		if(!this.isJVMFilterSame(oldRR.jvmFilter, newRR.jvmFilter))
			return true;

		return false;
	}

	static sort(oldRR:ISortSelectable, newRR:ISortSelectable):boolean
	{
		if(oldRR.sortType !== newRR.sortType)
			return true;

		return false;
	}

	static txn(oldRR:IRR_App_Txn, newRR: IRR_App_Txn)
	{
		if(oldRR.txnRealName !== newRR.txnRealName)
			return true;

		return false;
	}

	static metric(oldRR:ISelectableMetric, newRR: ISelectableMetric)
	{
		if(oldRR.metricRealName !== newRR.metricRealName)
			return true;

		return false;
	}



	static isJVMFilterSame(oldFilter: IJVMFilterState, newFilter: IJVMFilterState)
	{
		if (oldFilter !== newFilter)
		{
			if(oldFilter && newFilter)
			{
				if(oldFilter.isAll === newFilter.isAll)
				{
					if(_.isEqual(oldFilter.ids_selectedJVMS, newFilter.ids_selectedJVMS) && _.isEqual(oldFilter.ids_allJVMS, newFilter.ids_allJVMS))
					{
						return true;
					}
				}
			}

			return false;
		}

		return true;
	}
}