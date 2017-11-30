import * as React from "react";
import Highcharts = require('highcharts');
import ReactHighCharts = require('react-highcharts');

export abstract class DSChart<P,S> extends React.Component<P, S>
{
	abstract getChartConfig();

	render()
	{
		const config = this.getChartConfig();
		return (
			<div>
				<ReactHighCharts config={config} ref="chart"/>
			</div>
		);
	}
}