import * as React from "react";
import {roundToTwo} from "../metricUtils";
import {DSStandardChart} from "./dsStandardChart";

export interface IPctMetric {
    name:   string;
    value:  number; //raw values. we calc the pcts in chart
}
export class PctBarChart extends DSStandardChart<{
    stats: IPctMetric[];
}, {}>
{
    protected getCustomizedConfig()
    {
        //calc percentage

        const stats = this.props.stats;

        let total = 0;
        for(let s of stats)
            total+=s.value;

        const series = stats.map(s => { return {name: s.name, data:[(s.value * 100)/total]} });
        return {
            chart: {
                type: 'bar',
            },
            xAxis: {
                title: {
                    text: null
                },
                labels: {
                    enabled: false
                }
            },
            yAxis: {
                endOnTick: false,
                reversedStacks: false,
                max:100,
                labels: {
                    formatter: function ()
                    {
                        return this.value + '%';
                    }
                }
            },
            tooltip: {
                formatter: function () {
                    const pct = roundToTwo(this.y);
                    return `<b>${this.series.name}</b><br>Time Spent: <b>${pct}</b>%`;
                }
            },
            colors: ['#B276B2', '#B2912F', '#F17CB0', '#60BD68', '#FAA43A', '#DECF3F'],
            series: series
        };
    }

    protected getChartHeight()
    {
        return 180;
    }

}
