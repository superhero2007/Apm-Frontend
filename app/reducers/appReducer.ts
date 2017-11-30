import {IJVMFilterState, IJVMLabel} from "../es/pinned/jvmFilters";
import {updateObj, UPDATE_TIMERANGE, UPDATE_SORT_TYPE, UPDATE_CATTAB, MetricCategory} from "./esReducer";
import {UPDATE_JVMFILTER} from "./pinnedTxnReducer";
import {IDSTabData} from "../es/widgets/dsTabs";
import {MetricSortType, ISortedListItem} from "../es/widgets/sortedMetricList";
import {IDSTabState} from "../es/views/tab";
import {CatTab} from "../es/widgets/catTabs";
import {IRR_Filter_TimeRange} from "./timerangeReducer";

export enum EAppTabs
{
	Live,
	Overview,
	Txn,
	ES,
	Db,
	Aws,
	Err,
	JVM,
	Env,
	Deploys,
	Profiler,
	Settings
}

export interface IRR_App extends IRR_Filter_TimeRange
{
	jvmFilter: IJVMFilterState;
	tab: EAppTabs;
}



export function appReducer(state={}, action)
{
	switch (action.type)
	{
		case INIT_APP:
			return updateObj(state, action.app);
		case APP_TAB_SWITCH:
			return updateObj(state, {tab: action.tab});

		case UPDATE_TIMERANGE:
			return updateObj(state, {timeRange: action.timeRange});

		case UPDATE_JVMFILTER:
			return updateObj(state, {jvmFilter: action.filter});

		default:
			return state;
	}

}

const INIT_APP = "INIT_APP";
const APP_TAB_SWITCH = "APP_TAB_SWITCH";

export function action_initApp(app: IRR_App)
{
	return {
		type: INIT_APP,
		app
	};
}

export function action_appTabSwitch(tab: EAppTabs)
{
	return {
		type: APP_TAB_SWITCH,
		tab
	};
}

export interface IRR_AppOverview
{
	tab: IDSTabData;
}

export function appOverviewReducer(state = {}, action)
{
	switch (action.type)
	{
		case INIT_APP_OVERVIEW:
			return updateObj(state, action.app_ovr);

		case  UPDATE_DETAILTAB_APPOVR:
			return updateObj(state, {tab: action.tab});
		case  UPDATE_DETAILTAB_STATE_APPOVR:
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

const INIT_APP_OVERVIEW = "INIT_APP_OVERVIEW";
const UPDATE_DETAILTAB_APPOVR = "UPDATE_DETAILTAB_APPOVR";
const UPDATE_DETAILTAB_STATE_APPOVR = "UPDATE_DETAILTAB_STATE_APPOVR";

export function action_initApp_Overview(app_ovr: IRR_AppOverview)
{
	return {
		type: INIT_APP_OVERVIEW,
		app_ovr
	};
}

export function action_updateDetailTabState_AppOvr(state: any)
{
	return {
		type: UPDATE_DETAILTAB_STATE_APPOVR,
		state
	};
}

export function action_updateDetailTab_AppOvr(tab: IDSTabState)
{
	return {
		type: UPDATE_DETAILTAB_APPOVR,
		tab
	};
}

export interface ISortSelectable {
	sortType: MetricSortType;

}
export interface ITabbedDetail
{
	tab: IDSTabData;
	catTab: CatTab;
}

export interface ISelectableMetric
{
	metric: string;
	metricRealName: string;
}

export interface IRR_App_Txn extends ISortSelectable, ITabbedDetail
{
	txn: string;
	txnRealName: string;
}

export function appTxnReducer(state = {}, action)
{
	switch (action.type)
	{
		case INIT_APP_TXN:
			return updateObj(state, action.app_txn);

		case UPDATE_SORT_TYPE:
			return updateObj(state, {sortType: action.sortType});

		case  APP_TXN_UPDATE_SELECTION:
			return updateObj(state, {txn: action.txn, txnRealName: action.txnRealName, catTab: CatTab.metric});

		case  APP_TXN_UPDATE_DETAILTAB:
			return updateObj(state, {tab: action.tab});
		case  APP_TXN_UPDATE_DETAILTABSTATE:
		{
			const tab: IDSTabData = {
				state: action.state,
				type: (state as any).tab.type
			};
			return updateObj(state, {tab: tab});
		}
		case  UPDATE_CATTAB:
		{
			return updateObj(state, {catTab: action.tab});
		}

		default:
			return state;
	}
}

const INIT_APP_TXN = "INIT_APP_TXN";
const APP_TXN_UPDATE_SELECTION = "APP_TXN_UPDATE_SELECTION";
const APP_TXN_UPDATE_DETAILTAB = "APP_TXN_UPDATE_DETAILTAB";
const APP_TXN_UPDATE_DETAILTABSTATE = "APP_TXN_UPDATE_DETAILTAB_STATE";

export function action_initApp_Txn(app_txn: IRR_App_Txn)
{
	return {
		type: INIT_APP_TXN,
		app_txn
	};
}

export function action_updateSelectedTxn(item: ISortedListItem)
{
	return {
		type: APP_TXN_UPDATE_SELECTION,
		txn: item.name,
		txnRealName: item.realName
	};
}

export function action_appTxn_updateDetailTab(tab: IDSTabState)
{
	return {
		type: APP_TXN_UPDATE_DETAILTAB,
		tab
	};
}

export function action_apptxn_updateDetailTabState(state: any)
{
	return {
		type: APP_TXN_UPDATE_DETAILTABSTATE,
		state
	};
}


export interface IRR_App_ES extends ISortSelectable, ITabbedDetail, ISelectableMetric
{
	category: MetricCategory;
}

const INIT_APP_ES = "INIT_APP_ES";
const APP_ES_UPDATE_SELECTION = "APP_ES_UPDATE_SELECTION";
const APP_ES_UPDATE_DETAILTAB = "APP_ES_UPDATE_DETAILTAB";
const APP_ES_UPDATE_DETAILTABSTATE = "APP_ES_UPDATE_DETAILTAB_STATE";
const APP_ES_UPDATE_CATEGORY = "APP_ES_UPDATE_CATEGORY";


export function appESReducer(state = {}, action)
{
	switch (action.type)
	{
		case INIT_APP_ES:
			return updateObj(state, action.app_txn);

		case UPDATE_SORT_TYPE:
			return updateObj(state, {sortType: action.sortType});

		case  APP_ES_UPDATE_SELECTION:
			return updateObj(state, {metric: action.metric, metricRealName: action.metricRealName, catTab: CatTab.metric});

		case  APP_ES_UPDATE_DETAILTAB:
			return updateObj(state, {tab: action.tab});
		case  APP_ES_UPDATE_CATEGORY:
			return updateObj(state, {category: action.category});

		case  APP_ES_UPDATE_DETAILTABSTATE:
		{
			const tab: IDSTabData = {
				state: action.state,
				type: (state as any).tab.type
			};
			return updateObj(state, {tab: tab});
		}
		case  UPDATE_CATTAB:
		{
			return updateObj(state, {catTab: action.tab});
		}

		default:
			return state;
	}
}

export function action_initApp_ES(app_txn: IRR_App_ES)
{
	return {
		type: INIT_APP_ES,
		app_txn
	};
}

export function action_updateSelectedES(item: ISortedListItem)
{
	return {
		type: APP_ES_UPDATE_SELECTION,
		metric: item.name,
		metricRealName: item.realName
	};
}

export function action_appES_updateCategory(category: MetricCategory)
{
	return {
		type: APP_ES_UPDATE_CATEGORY,
		category
	};
}

export function action_appES_updateDetailTab(tab: IDSTabState)
{
	return {
		type: APP_ES_UPDATE_DETAILTAB,
		tab
	};
}

export function action_appES_updateDetailTabState(state: any)
{
	return {
		type: APP_ES_UPDATE_DETAILTABSTATE,
		state
	};
}


export interface IRR_App_Err extends ISelectableMetric, ITabbedDetail
{

}

export function appErrReducer(state = {}, action)
{
	switch (action.type)
	{
		case INIT_APP_ERR:
			return updateObj(state, action.app_txn);

		case  APP_ERR_UPDATE_SELECTION:
			return updateObj(state, {metric: action.metric, metricRealName: action.metricRealName, catTab: CatTab.metric});

		case  UPDATE_CATTAB:
			return updateObj(state, {catTab: action.tab});

		case  APP_ERR_UPDATE_DETAILTAB:
			return updateObj(state, {tab: action.tab});

		default:
			return state;
	}
}


const INIT_APP_ERR = "INIT_APP_ERR";
const APP_ERR_UPDATE_SELECTION = "APP_ERR_UPDATE_SELECTION";
const APP_ERR_UPDATE_DETAILTAB = "APP_ERR_UPDATE_DETAILTAB";

export function action_initApp_Err(app_txn: IRR_App_Err)
{
	return {
		type: INIT_APP_ERR,
		app_txn
	};
}

export function action_updateSelectedERR(item: ISortedListItem)
{
	return {
		type: APP_ERR_UPDATE_SELECTION,
		metric: item.name,
		metricRealName: item.realName
	};
}

export function action_appERR_updateDetailTab(tab: IDSTabState)
{
	return {
		type: APP_ERR_UPDATE_DETAILTAB,
		tab
	};
}

export interface IRR_App_JVM extends ISelectableMetric
{

}

const INIT_APP_JVM = "INIT_APP_JVM";
const APP_JVM_UPDATE_SELECTION = "APP_JVM_UPDATE_SELECTION";

export function appJVMReducer(state = {}, action)
{
	switch (action.type)
	{
		case INIT_APP_JVM:
			return updateObj(state, action.app_txn);

		case  APP_JVM_UPDATE_SELECTION:
			return updateObj(state, {metric: action.metric, metricRealName: action.metricRealName});

		default:
			return state;
	}
}

export function action_initApp_JVM(app_txn: IRR_App_JVM)
{
	return {
		type: INIT_APP_JVM,
		app_txn
	};
}

export function action_AppJVM_updateSelectedJVM(item: IJVMLabel)
{
	return {
		type: APP_JVM_UPDATE_SELECTION,
		metric: item.label,
		metricRealName: item.id
	};
}
