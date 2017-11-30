import {AbstractTimeRange, ISer_TimeRange, UnixTimeRange} from "./filters/timerange";
import {IRR_ESDETAIL, MetricCategory} from "../reducers/esReducer";
import {MetricSortType} from "./widgets/sortedMetricList";
import {IAppFilterState} from "./filters/appFilters";
import {isNotPresent} from "../utils";
import {ISlowQueryInfo} from "./views/slowQueriesListView";
import {IRR_PinnedTxnReducer} from "../reducers/pinnedTxnReducer";
import {MetricType} from "../apps/metricStructs";
import {IJVMFilterState} from "./pinned/jvmFilters";
import {IRR_App, IRR_App_Err, IRR_App_ES, IRR_App_Txn} from "../reducers/appReducer";
import {IRR_AppInfo} from "../reducers/appInfoReducer";
import {IRR_Filter_TimeRange} from "../reducers/timerangeReducer";
import {IRR_Filter_Host} from "../reducers/hostFilterReducer";
import {ISvrPageProps} from "../server/serverPageFrame";


interface IServerQueryFilter
{
    timeRange: UnixTimeRange;
    hostIds: string[];
    entity?: string;
    metricNames?: string[];
}

interface IR_IDFilter {
    isAll: boolean;
    selectedIds: string[];
}

interface IR_AppFilter extends IR_IDFilter {

}
interface IR_JVMFilter extends IR_IDFilter {

}

interface IR_Filters {
    appFilter?: IR_AppFilter;
    jvmFilter?: IR_JVMFilter;
    timeRange: UnixTimeRange;
    category:  string;
    metricType?: string;
    appId?   :string;
    sortType? :string;
}

interface IR_SortFiler extends IR_Filters
{

}

interface IR_DetailFiler extends IR_Filters
{
    metricName: string;
    parentName?: string;
}

export interface IR_TraceSampleParams extends IR_Filters
{
    sqlId: number;
}

interface IR_OverviewFilter extends IR_Filters
{
    sortType: string;
}
export class QueryRequests
{
    public static postBody_sortFilter(esDetail: IRR_ESDETAIL): IR_SortFiler
    {
        const unixTimeRange = this.timeRange(esDetail);
        const appFilter = this.appFilter(esDetail.appFilter);
        const metricSortType: string = MetricSortType[esDetail.sortType];

        return {
            timeRange: unixTimeRange,
            appFilter: appFilter,
            sortType: metricSortType,
            category: this.getMetricCategory(esDetail)
        };
    }

    private static getMetricCategory(esDetail:IRR_ESDETAIL)
    {
        let category = esDetail.metricCategory;
        if(isNotPresent(category))
            category = MetricCategory.Rest; //rest by default

        return MetricCategory[category];
	}


    public static postBody_traceSampleParams(esDetail: IRR_ESDETAIL, slowQuery:ISlowQueryInfo): IR_TraceSampleParams
    {
        const unixTimeRange = this.timeRange(esDetail);
        const appFilter = this.appFilter(esDetail.appFilter);

        return {
            timeRange: unixTimeRange,
            appFilter: appFilter,
            category: this.getMetricCategory(esDetail),
            appId: slowQuery.appId,
            sqlId: slowQuery.sqlId
        };
    }

    public static postBody_overviewFilter(esDetail: IRR_ESDETAIL, sortType:MetricSortType): IR_OverviewFilter
    {
        return {
            timeRange: this.timeRange(esDetail),
            appFilter: this.appFilter(esDetail.appFilter),
            category: this.getMetricCategory(esDetail),
            sortType: MetricSortType[sortType]
        };
    }

    public static postBody_OpsFilter(esDetail: IRR_ESDETAIL, category:MetricCategory): IR_Filters
    {
        return {
            timeRange: this.timeRange(esDetail),
            appFilter: this.appFilter(esDetail.appFilter),
            category: MetricCategory[category]
        };
    }


    public static postBody_App_Txn_Filter(rdr: IRR_App, rdrAppInfo: IRR_AppInfo, txnRR: IRR_App_Txn): IR_DetailFiler
    {
        const metricSortType: string = MetricSortType[txnRR.sortType];
        return {
            timeRange: this.restifyTimeRange(rdr.timeRange),
            jvmFilter: this.jvmFilter(rdr.jvmFilter),
            metricName: txnRR.txnRealName,
            parentName: null,
            metricType: MetricType[MetricType.TXN],
            category: MetricCategory[MetricCategory.Txn],
            appId:  rdrAppInfo.app.id,
            sortType: metricSortType
        };
    }
    public static postBody_App_ES_Filter(rdr: IRR_App, rdrAppInfo: IRR_AppInfo, esRR: IRR_App_ES): IR_DetailFiler
    {
        const metricSortType: string = MetricSortType[esRR.sortType];
        return {
            timeRange: this.restifyTimeRange(rdr.timeRange),
            jvmFilter: this.jvmFilter(rdr.jvmFilter),
            metricName: esRR.metricRealName,
            parentName: null,
            metricType: MetricType[MetricType.GLOBAL],
            category: MetricCategory[esRR.category],
            appId:  rdrAppInfo.app.id,
            sortType: metricSortType
        };
    }

    public static postBody_App_Err_Filter(rdr: IRR_App, rdrAppInfo: IRR_AppInfo, errRR: IRR_App_Err): IR_DetailFiler
    {
        return {
            timeRange: this.restifyTimeRange(rdr.timeRange),
            jvmFilter: this.jvmFilter(rdr.jvmFilter),
            metricName: errRR.metricRealName,
            parentName: null,
            metricType: MetricType[MetricType.ERROR],
            category: MetricCategory[MetricCategory.Exception],
            appId:  rdrAppInfo.app.id
        };
    }

    public static postBody_App_detailFilter(rdr: IRR_App, rdrAppInfo: IRR_AppInfo): IR_DetailFiler
    {
        return {
            timeRange: this.restifyTimeRange(rdr.timeRange),
            jvmFilter: this.jvmFilter(rdr.jvmFilter),
            metricName: "App/txns",
            parentName: "App",
            metricType: MetricType[MetricType.SCOPED],
            category: MetricCategory[MetricCategory.App],
            appId:  rdrAppInfo.app.id
        };
    }

    public static postBody_ServerQueryFilter (tr: IRR_Filter_TimeRange, hosts: IRR_Filter_Host, entity?:string): IServerQueryFilter
    {
        return {
            timeRange: this.restifyTimeRange(tr.timeRange),
            hostIds: hosts.selectedHostIds,
            entity: entity
        };
    }

    public static postBody_Pinned_detailFilter(rdr: IRR_PinnedTxnReducer): IR_DetailFiler
    {
        return {
            timeRange: this.restifyTimeRange(rdr.timeRange),
            jvmFilter: this.jvmFilter(rdr.jvmFilter),
            metricName: rdr.txn.txnName,
            metricType: MetricType[MetricType.TXN],
            category: MetricCategory[MetricCategory.Txn],
            appId:  rdr.txn.appId
        };
    }

    public static postBody_detailFilter(esDetail: IRR_ESDETAIL): IR_DetailFiler
    {
        const unixTimeRange = this.timeRange(esDetail);
        const appFilter = this.appFilter(esDetail.appFilter);
        const metricName = esDetail.selectedMetricRealName;

        return {
            timeRange: unixTimeRange,
            appFilter: appFilter,
            metricName: metricName,
            metricType: MetricType[MetricType.GLOBAL],
            category: this.getMetricCategory(esDetail)
        };
    }

    public static timeRange(esDetail:IRR_ESDETAIL)
    {
	    const range = esDetail.timeRange;
        return this.restifyTimeRange(range);
    }

    public static restifyTimeRange(range:ISer_TimeRange) {
            return AbstractTimeRange.deserialize(range).toUnix();
    }


    public static filterChanged_pinnedTxn(newDetail:IRR_PinnedTxnReducer, curDetail:IRR_PinnedTxnReducer)
    {
        if(newDetail.timeRange !== curDetail.timeRange)
            return true;

        if(newDetail.txn !== curDetail.txn)
            return true;

        return false;
    }


    public static filterChanged_detail(newDetail:IRR_ESDETAIL, curDetail:IRR_ESDETAIL)
    {
        if(this.filterChanged_global(newDetail, curDetail))
            return true;

        if(newDetail.selectedMetric !== curDetail.selectedMetric)
            return true;

        return false;
    }


	public static filterChanged_procSort(newDetail:ISvrPageProps, curDetail:ISvrPageProps)
	{
	    if(newDetail.timeRangeFilter.timeRange != curDetail.timeRangeFilter.timeRange)
	        return true;

		if(newDetail.serverPage.procSortType !== curDetail.serverPage.procSortType)
			return true;


		return false;
	}
    public static filterChanged_sort(newDetail:IRR_ESDETAIL, curDetail:IRR_ESDETAIL)
    {
        if(this.filterChanged_global(newDetail, curDetail))
            return true;

        if(newDetail.sortType !== curDetail.sortType)
            return true;


        return false;
    }

    private static filterChanged_global(newDetail:IRR_ESDETAIL, curDetail:IRR_ESDETAIL)
    {
        if(newDetail.timeRange !== curDetail.timeRange)
            return true;

        if(newDetail.appFilter !== curDetail.appFilter)
            return true;

        return false;
    }

    private static jvmFilter(filter:IJVMFilterState): IR_AppFilter
    {
        let appIds = filter.isAll ? filter.ids_allJVMS : filter.ids_selectedJVMS;

        return {
            isAll: filter.isAll,
            selectedIds: appIds
        };
    }

    private static appFilter(appFilter:IAppFilterState): IR_AppFilter
    {
        let appIds = appFilter.isAllApps ? appFilter.appIds_allApps : appFilter.appIds_selectedApps;

        return {
            isAll: appFilter.isAllApps,
            selectedIds: appIds
        };
    }
}
