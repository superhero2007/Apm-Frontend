import * as React from "react";
import {IESViewProps} from "../esViews";
import {connect} from "react-redux";
import {action_updateDetailTab, MetricCategory} from "../../reducers/esReducer";
import {MetricOverview} from "./metricOverview";
import {MetricTrendsView} from "./metricTrends";
import {PerAppMetricView} from "./perAppMetricView";
import {isNotPresent} from "../../utils";
import {Tabs} from "./tab";
import {MetricScalabilityView} from "./metricScalability";
import {SlowQueriesView} from "./slowQueriesView";
import {DSTabs, DSTabType, TabStyle} from "../widgets/dsTabs";
import {esDetailConnector} from "../../reduxConnectors";

export interface IDataPoint {
    t: string; //timestamp
    v: number; //value
}

export interface IMetricStats {
    avgResponseTimes: IDataPoint[];
    throughputs: IDataPoint[];
}
export interface ISeriesData {
    seriesName: string;
    dataPoints: IDataPoint[];
}

export class SeriesDataUtils
{
    public static toChartSeries(seriesList:ISeriesData[], seriesName: string, chartSeriesName: string): ISeriesData
    {
        const series = seriesList.find(it => it.seriesName === seriesName);
        return {seriesName: chartSeriesName, dataPoints: series.dataPoints};
    }
}

class MetricDetailView_connect extends React.Component<IESViewProps, {}>
{
    private onSelectTab(tab:DSTabType)
    {
        this.props.dispatch(action_updateDetailTab(Tabs.getDefaultTabState(tab)));
    }

    private getTabContents(activeTab:DSTabType)
    {
        switch (activeTab)
        {
            case DSTabType.overview:
            {
                return <MetricOverview/>;
            }
            case DSTabType.perapp:
            {
                return <PerAppMetricView/>;
            }
            case DSTabType.trends:
            {
                return <MetricTrendsView/>;
            }
            case DSTabType.scalable:
            {
                return <MetricScalabilityView/>;
            }
            case DSTabType.slowqueries:
            {
                return <SlowQueriesView/>;
            }
        }
    }

    private getActiveTabType():DSTabType
    {
        let activeTab = this.props.esDetail.tab.type;
        if(isNotPresent(activeTab))
            activeTab = DSTabType.overview;

        return activeTab;
    }

    public render()
    {
        const detail = this.props.esDetail;

        const activeTab =   this.getActiveTabType();
        let tabContent =    this.getTabContents(activeTab);

        if(isNotPresent(detail.selectedMetricRealName))
        {
            return <div></div>;
        }

        let tabs:DSTabType[] = [DSTabType.overview, DSTabType.perapp];
        if((detail.metricCategory === MetricCategory.SQL) || (detail.metricCategory === MetricCategory.CQL))
        {
            tabs.push(DSTabType.slowqueries);
        }

        tabs.push(DSTabType.trends);
        tabs.push(DSTabType.scalable);

        return (
            <div>
                <h2>{detail.selectedMetric}</h2>
                <hr/>
                <div className="bottom2">
                    <DSTabs activeTab={activeTab} tabs={tabs} onSelect={this.onSelectTab.bind(this)} style={TabStyle.tabs}/>
                </div>
                {tabContent}
            </div>
        );
    }
    
}
export const MetricDetailView = connect((state)=> esDetailConnector(state))(MetricDetailView_connect);