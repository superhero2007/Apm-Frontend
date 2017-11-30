import * as React from "react";
import {DSStandardChart} from "../es/charts/dsStandardChart";
import {ICSChartSeriesData} from "../es/charts/columnAndSplineChart";
import {responseTimeDisplay, throughputDisplay, throughputUnit} from "../es/metricUtils";
import {DSTable} from "../widgets/dsTable";
import {ITooltipSharedPoint, SharedTooltip} from "../es/charts/tooltips/sharedTooltip";
import {RowCol} from "../widgets/rowCol";
import {IMetricTrend, ITimeOfDayStats, ITimeOfDayContainer} from "../es/widgets/metricTrends";
import {isNumeric} from "../utils";

interface ITrendChild
{
	name    :string;
	avgResponseTime:    number;
}

interface IMetricTrendWithChildren
{
	trend: IMetricTrend;
	children:   ITrendChild[];
}

export interface IMetricTrendContainerWithChildren
{
	last24hrs   :IMetricTrendWithChildren;
	prev24hrs   :IMetricTrendWithChildren;
	prev7days   :IMetricTrendWithChildren;
	prev30days  :IMetricTrendWithChildren;
}

export interface ISegmentTimeOfDayStats {
	name:   string; //name of segment
	stats: ITimeOfDayStats[];
}

export interface ITxnCalendarTrends
{
	txnStats: ITimeOfDayContainer;
	segmentStats: ISegmentTimeOfDayStats[];
}

export class TxnTrendsOverviewView extends React.Component<{
	trendOverview: IMetricTrendContainerWithChildren;
},{}>
{

	private copyTrend(trendWChild:IMetricTrendWithChildren): IMetricTrendWithChildren
	{
		return {
			trend: trendWChild.trend,
			children: [this.calcJavaTime(trendWChild)].concat(trendWChild.children)
		};
	}

	render()
	{
		const newTrendOverview:IMetricTrendContainerWithChildren = {
			last24hrs: this.copyTrend(this.props.trendOverview.last24hrs),
			prev24hrs: this.copyTrend(this.props.trendOverview.prev24hrs),
			prev7days: this.copyTrend(this.props.trendOverview.prev7days),
			prev30days: this.copyTrend(this.props.trendOverview.prev30days)
		};

		const trendItems = TxnTrendsOverviewView.getTrendItems(newTrendOverview);
		const trendNames = TxnTrendsOverviewView.getTrendNames();

		let categories = new Set<string>();

		for(let trend of trendItems)
		{
			for(let child of trend.children)
			{
				categories.add(child.name);
			}
		}

		return (
			<div>
				<TrendOverviewChart  trendOverview={newTrendOverview} categories={categories}/>
				<DSTable columnNames={["Time Range","Avg Response Time", "Avg Throughput", "Total Calls"].concat(Array.from(categories))}>
					{trendNames.map((trend, i) => TxnTrendsOverviewView.renderTableRow(trendItems[i], trend, categories))}
				</DSTable>
			</div>
		);
	}

	private calcJavaTime(trendWChild: IMetricTrendWithChildren): ITrendChild
	{
		let avgTime = trendWChild.trend.avgTime;

		for (let c of trendWChild.children)
		{
			avgTime -= c.avgResponseTime;
		}

		return {name: "Java Code", avgResponseTime: avgTime};
	}

	static getTrendItems(trends: IMetricTrendContainerWithChildren): IMetricTrendWithChildren[]
	{
		return [trends.last24hrs, trends.prev24hrs, trends.prev7days, trends.prev30days];
	}

	static getTrendNames():string[]
	{
		return ["Last 24 hrs", "Prev 24 hrs", "Prev 7 days", "Prev 30 Days"];
	}

	private static renderTableRow(trendWChild:IMetricTrendWithChildren, name:string, categories:Set<string>)
	{
		let childRows = [];
		categories.forEach(cat =>
		{

			let respTime = TxnTrendsOverviewView.getCategoryValue(trendWChild, cat);
			childRows.push(<td key={cat+name}>{responseTimeDisplay(respTime)}</td>);
		});

		return (
			<tr key={name}>
				<td><b>{name}</b></td>
				<td>{responseTimeDisplay(trendWChild.trend.avgTime)}</td>
				<td>{throughputDisplay(trendWChild.trend.avgThp)}</td>
				<td>{throughputUnit(trendWChild.trend.totalCalls)}</td>
				{childRows}
			</tr>
		);
	}

	static getCategoryValue(trendWChild:IMetricTrendWithChildren, category: string)
	{
		const child = trendWChild.children.find(it => it.name === category);
		if(child)
		{
			return child.avgResponseTime;
		}

		return 0;
	}
}

export class TxnTrendsView extends React.Component<{
	trendOverview: IMetricTrendContainerWithChildren;
	txnDayOfWeek: ITxnCalendarTrends;
	txnTimeOfDay: ITxnCalendarTrends;
}, {}>
{

	render()
	{
		return (
			<div>
				<TxnTrendsOverviewView trendOverview={this.props.trendOverview}/>

				<hr/>

				<RowCol className="bottom2">
					<h3>Day of Week Trend</h3>
					<h5>(Using aggregated data from last 90 days)</h5>
				</RowCol>
				<TxnTimeOfDayTrendChart trendData={this.props.txnDayOfWeek}/>

				<hr/>
				<RowCol className="bottom2">
					<h3>Time of Day Trend</h3>
					<h5>(Using aggregated data from last 90 days)</h5>
				</RowCol>
				<div className="bottom2">
					<TxnTimeOfDayTrendChart trendData={this.props.txnTimeOfDay}/>
				</div>
			</div>
		);
	}
}

interface ISCSChartSeries {
	data: number[];
	name: string;
	yAxis: number;
	type: string;
}

abstract class AbstractTxnTrendsChart<P,S> extends  DSStandardChart<P, S>
{

	protected abstract thpSeriesName():string;
	protected abstract getXAxisCategories(): string[];
	protected abstract getSplineSeriesData(): ICSChartSeriesData;
	protected abstract getColumnSeriesData(): ISCSChartSeries[];
	protected abstract showThpUnit(): boolean;

	protected getCustomizedConfig()
	{

		const columnSeriesData:any[] = this.getColumnSeriesData();
		const splineSeriesData = this.getSplineSeriesData();

		const thpColor = '#0d1234';

		const tooltipGenerator = new TxnTrendChartTooltip(this.thpSeriesName(), this.showThpUnit());

		let series =[
			{
				name: splineSeriesData.name,
				type: 'spline',
				data: splineSeriesData.values,
				color: thpColor,
				yAxis: 1
			}
		];

		series = columnSeriesData.concat(series);

		return {
			xAxis: {
				categories: this.getXAxisCategories()
			},
			yAxis: [{
				title: {
					text: null
				},
				labels: {
					formatter: function () {
						return responseTimeDisplay(this.value);
					}
				},
				min: 0
			},
				{
					title: {
						text: null
					},
					labels: {
						formatter: function () {
							return splineSeriesData.valueDisplayFunc(this.value);
						},

					},
					opposite: true
				}
			],
			plotOptions: {
				series: {
					stacking: "normal"
				}
			},
			colors: DSStandardChart.defaultStackColors,
			tooltip: {
				shared: true,
				formatter: function () {
					return tooltipGenerator.generateStr(this);
				}
			},
			series: series
		};
	}
}


class TrendOverviewChart extends AbstractTxnTrendsChart<{
	trendOverview: IMetricTrendContainerWithChildren;
	categories: Set<string>;
},{}>
{
	protected thpSeriesName():string
	{
		return "Avg Throughput";
	}

	protected showThpUnit(): boolean
	{
		return true;
	}

	protected getColumnSeriesData()
	{
		const trendItems = TxnTrendsOverviewView.getTrendItems(this.props.trendOverview);
		trendItems.reverse();

		let series = [];
		this.props.categories.forEach(cat => {
			const val: number[] = trendItems.map(t => TxnTrendsOverviewView.getCategoryValue(t, cat));
			series.push({
				data: val,
				name: cat,
				yAxis: 0,
				type: 'column'
			});
		});
		return series;
	}


	protected getSplineSeriesData():ICSChartSeriesData
	{
		const trendItems = TxnTrendsOverviewView.getTrendItems(this.props.trendOverview);
		trendItems.reverse();

		return {
			name: "Avg Throughput",
			valueDisplayFunc: throughputDisplay,
			values: trendItems.map(it => it.trend.avgThp)
		};
	}

	protected getXAxisCategories():string[]
	{
		const catgs = TxnTrendsOverviewView.getTrendNames();
		catgs.reverse();
		return catgs;
	}
}


class TxnTrendChartTooltip extends SharedTooltip
{
	constructor(private thpSeriesName: string, private showThpUnit: boolean)
	{
		super(null);
	}

	generateStr(point:ITooltipSharedPoint): string
	{
		const tPt = this.getPointByName(point, this.thpSeriesName);


		let str = "";
		let total = 0;
		for (let pt of point.points)
		{
			if(pt.series.name !== this.thpSeriesName)
			{
				total += pt.y;
				str += `<br/>${pt.series.name}: <b>${responseTimeDisplay(pt.y)}</b>`;
			}
		}

		str += `<br/>Avg Response Time: <b>${responseTimeDisplay(total)}</b>`;

		if(tPt)
			str += `<br/>${this.thpSeriesName}: <b>${ this.showThpUnit? throughputDisplay(tPt.y): throughputUnit(tPt.y)}</b>`;

		let header;
		if(!isNumeric(point.x))
		{
			header= point.x;
		}
		else {
			const begin = Number(point.x);
			const end = begin + 1;
			header = `${("0" + begin).slice(-2)}:00-${("0" + end).slice(-2)}:00`;
		}
		return `<b>${header}</b>${str}`;
	}
}

export class TxnTimeOfDayTrendChart extends AbstractTxnTrendsChart<{
	trendData: ITxnCalendarTrends;
},{}>
{
	protected thpSeriesName():string
	{
		return "Total Calls";
	}

	protected showThpUnit(): boolean
	{
		return false;
	}

	protected getColumnSeriesData():any[]
	{

		return this.props.trendData.segmentStats.map(seg => ({
			yAxis: 0,
			type: 'column',
			name: seg.name,
			data: seg.stats.map(stat=> stat.avgResponseTime)
		}));
	}


	protected getSplineSeriesData():ICSChartSeriesData
	{

		return {
			name: "Total Calls",
			valueDisplayFunc: throughputUnit,
			values: this.props.trendData.txnStats.values.map(it => it.totalCalls)
		};
	}

	protected getXAxisCategories():string[]
	{
		return this.props.trendData.txnStats.values.map(it => it.time);
	}
}

