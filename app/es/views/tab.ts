import {MetricOverview_getDefaultTabState} from "./metricOverview";
import {PerAppMetricView_getDefaultTabState} from "./perAppMetricView";
import {MetricTrendsView_getDefaultTabState} from "./metricTrends";
import {MetricScalabilityView_getDefaultTabState} from "./metricScalability";
import {SlowQueriesView_getDefaultTabState} from "./slowQueriesView";
import {DSTabType} from "../widgets/dsTabs";

export interface IDSTabState {
	type    :DSTabType; //tab type
}


export class Tabs
{
	static getDefaultTabState(tabType:DSTabType): IDSTabState
	{
		switch (tabType)
		{
			case DSTabType.overview:
				return MetricOverview_getDefaultTabState();
			case DSTabType.perapp:
				return PerAppMetricView_getDefaultTabState();
			case DSTabType.trends:
				return MetricTrendsView_getDefaultTabState();
			case DSTabType.scalable:
				return MetricScalabilityView_getDefaultTabState();
			case DSTabType.slowqueries:
				return SlowQueriesView_getDefaultTabState();
			default:
			{
				console.log("ERROR");
				throw "invalid tab";
			}
		}
	}
}