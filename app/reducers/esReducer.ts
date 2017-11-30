import {MetricSortType} from "../es/widgets/sortedMetricList";
import {AbstractTimeRange, ISer_TimeRange} from "../es/filters/timerange";
import {IAppFilterState} from "../es/filters/appFilters";
import {IDSTabState} from "../es/views/tab";
import {CatTab} from "../es/widgets/catTabs";

export enum MetricCategory
{
	Rest,
	SQL,
	Mongo,
	Redis,
	CQL,
	Memcached,
	DDB,
	Solr,
	Couchbase,
	Riak,
	S3,
	SQS,
	SNS,
	SES,
	Kinesis,
	ES,
	SQLOPS,
	MongoOps,
	RiakOps,
	DDBOps,
	SQSOPS,
	CQLOPS,
	Exception,
	Txn,
	App,
	OrientDb,
	OrientDbOps,
	Kafka,
	RemoteEJB,
	Custom,
	DocDB,
	DocDBOps,
	AliOSS
}

export interface IRR_ESDETAIL
{
	metricCategory: MetricCategory;
	sortType: MetricSortType;
	appFilter: IAppFilterState;
	timeRange: ISer_TimeRange;
	selectedMetric: string;
	selectedMetricRealName: string;
	tab: IDSTabState;
	catTab: CatTab;
}
const INIT_ES_DETAIL = "INIT_ES_DETAIL";
export const UPDATE_SORT_TYPE = "UPDATE_SORT_TYPE";
export const UPDATE_TIMERANGE = "UPDATE_TIMERANGE";
const UPDATE_APPFILTER = "UPDATE_APPFILTER";
const UPDATE_SELECTEDMETRIC = "UPDATE_SELECTEDMETRIC";
export const UPDATE_DETAILTAB = "UPDATE_DETAILTAB";
export const UPDATE_DETAILTABSTATE = "UPDATE_DETAILTAB_STATE";
export const UPDATE_CATTAB = "UPDATE_CATTAB";


export function action_updateDetailTabState(state: any)
{
	return {
		type: UPDATE_DETAILTABSTATE,
		state
	};
}

export function action_updateDetailTab(tab: IDSTabState)
{
	return {
		type: UPDATE_DETAILTAB,
		tab
	};
}

export function action_updateCatTab(tab: CatTab)
{
	return {
		type: UPDATE_CATTAB,
		tab
	};
}


export function action_updateSelectedMetric(metricName: string, metricRealName: string)
{
	return {
		type: UPDATE_SELECTEDMETRIC,
		metricName,
		metricRealName
	};
}


export function action_updateTimeRangeSerialized(timeRange:ISer_TimeRange)
{
	return {
		type: UPDATE_TIMERANGE,
		timeRange
	};
}

export function action_updateTimeRange(range:AbstractTimeRange)
{
	const timeRange = range.serialize();
	return {
		type: UPDATE_TIMERANGE,
		timeRange
	};
}

export function action_updateAppFilter(appFilter: IAppFilterState)
{
	return {
		type: UPDATE_APPFILTER,
		appFilter
	};
}

export function action_updateSortType(sortType:MetricSortType)
{
	return {
		type: UPDATE_SORT_TYPE,
		sortType
	};
}


export function action_initESDetail(esDetail:IRR_ESDETAIL)
{
	return {
		type: INIT_ES_DETAIL,
		esDetail
	};
}

export function esDetailReducer(state={}, action)
{
	switch (action.type)
	{
		case INIT_ES_DETAIL:
		{
			return updateObj(state, action.esDetail);
		}
		case UPDATE_SORT_TYPE:
		{
			return updateObj(state, {sortType: action.sortType});
		}
		case UPDATE_APPFILTER:
		{
			return updateObj(state, {appFilter: action.appFilter});
		}
		case UPDATE_TIMERANGE:
		{
			return updateObj(state, {timeRange: action.timeRange});
		}
		case  UPDATE_SELECTEDMETRIC:
		{
			return updateObj(state, {selectedMetric: action.metricName, selectedMetricRealName: action.metricRealName, catTab: CatTab.metric});
		}
		case  UPDATE_DETAILTAB:
		{
			return updateObj(state, {tab: action.tab});
		}
		case  UPDATE_CATTAB:
		{
			return updateObj(state, {catTab: action.tab});
		}
		default:
			return state;
	}

}

export function updateObj(obj:any, update:any)
{
	return Object.assign({}, obj, update);
}
