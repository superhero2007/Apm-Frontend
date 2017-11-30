import {ISer_TimeRange} from "../es/filters/timerange";
import {updateObj, UPDATE_TIMERANGE, UPDATE_DETAILTAB, UPDATE_DETAILTABSTATE} from "./esReducer";
import {IJVMFilterState} from "../es/pinned/jvmFilters";
import {IDSTabData} from "../es/widgets/dsTabs";

const INIT_PINNEDTXN = "INIT_PINNEDTXN";
const UPDATE_PINNEDTXN = "UPDATE_PINNEDTXN";
export const UPDATE_JVMFILTER = "UPDATE_JVM_FILTER";

export interface IPinnedTxn
{
	appId:      string;
	appName:    string;
	name:       string;
	accountId:  string;
	txnId:      number;
	txnName:    string;
}

export interface IRR_PinnedTxnReducer
{
	txn: IPinnedTxn;
	timeRange: ISer_TimeRange;
	jvmFilter: IJVMFilterState;
	tab: IDSTabData;
}

export function pinnedTxnReducer(state={}, action)
{
	switch (action.type)
	{
		case INIT_PINNEDTXN:
			return updateObj(state, action.pinnedRR);

		case UPDATE_PINNEDTXN:
			return updateObj(state, {txn: action.txn});

		case UPDATE_TIMERANGE:
			return updateObj(state, {timeRange: action.timeRange});

		case UPDATE_JVMFILTER:
			return updateObj(state, {jvmFilter: action.filter});

		case  UPDATE_DETAILTAB:
			return updateObj(state, {tab: action.tab});
		case  UPDATE_DETAILTABSTATE:
		{
			const tab: IDSTabData = {
				state: action.state,
				type: (state as any).tab.type
			};
			return updateObj(state, {tab: tab});
		}

		default:
			return state;
	}
}


export function action_initPinnedTxn(pinnedRR:IRR_PinnedTxnReducer)
{
	return {
		type: INIT_PINNEDTXN,
		pinnedRR
	};
}

export function action_updatePinnedTxn(txn:IPinnedTxn)
{
	return {
		type: UPDATE_PINNEDTXN,
		txn
	};
}

export function action_updateJVMFilter(filter:IJVMFilterState)
{
	return {
		type: UPDATE_JVMFILTER,
		filter
	};
}