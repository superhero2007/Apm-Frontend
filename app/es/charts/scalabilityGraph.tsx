import {DSStandardChart} from "./dsStandardChart";
import {responseTimeDisplay, throughputDisplay} from "../metricUtils";
import {IScalabilityGraph} from "../widgets/scalabilityView";
import moment = require('moment');
import Highcharts = require('highcharts');

export class ScalabilityGraph extends DSStandardChart <{
	graphData: IScalabilityGraph
}, {}>
{

	static colorTable = [
		'#470D35',
		'#3E2155',
		'#353575',
		'#2C4996',
		'#235DB6',
		'#1A72D7',
		'#3983B1',
		'#59958C',
		'#79A767',
		'#99B942',
		'#B9CB1D',
		'#CCE118',
		'#D3E916',
		'#DAF115',
		'#B2E61D',
		'#8ADC25',
		'#63D12D',
		'#3BC735',
		'#14BD3E',
		'#33A755',
		'#53916C',
		'#727C83',
		'#92669A',
		'#B251B2'
		];

	private static getColor(time:moment.Moment)
	{ 
		const hour = time.hours();
		return this.colorTable[hour];
	}

	protected getCustomizedConfig()
	{
		const graphData = this.props.graphData;

		const data = graphData.values.map(it => [it.thp,  it.responseTime,  moment(it.timestamp).valueOf(), ScalabilityGraph.getColor(moment(it.timestamp))]);
		const series = [{
				name: "Data",
				keys: ['x', 'y', 'timestamp','color'],
				data: data,
				color: 'red'
		}];
		return {
			chart: {
				type: 'scatter',
				height: 800
			},
			legend: {
				enabled: false
			},
			plotOptions: {
				scatter: {
					turboThreshold: 10000
				},
				series: {
					stacking: null
				}
			},
			yAxis: {
				labels: {
					formatter: function () {
						return responseTimeDisplay(this.value);
					}
				}
			},
			xAxis: {
				labels: {
					formatter: function () {
						return throughputDisplay(this.value);
					}
				},
			},
			tooltip: {
				shared: true,
				formatter: function () {
					var ts = Highcharts.dateFormat('%A %b %d, %H:%M', this.point.timestamp);
					var tsEnd = Highcharts.dateFormat('%H:%M', moment(this.point.timestamp).add('1','h').valueOf());
					const respTime  = responseTimeDisplay(this.y);
					const thp       = throughputDisplay(this.x);
					return `<b>${ts}-${tsEnd}</b><br>Avg Response Time: <b>${respTime}</b><br>Avg Throughput: <b>${thp}</b>`;
				}
			},
			series: series
		};
	}
}