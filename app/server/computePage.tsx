import * as React from "react";
import * as _ from "lodash";
import {ISeriesData, SeriesDataUtils} from "../es/views/metricDetailView";
import {connect} from "react-redux";
import {RowCol} from "../widgets/rowCol";
import {ChartTitle} from "../es/charts/chartTitle";
import {StackedAreaChart} from "../es/charts/stackedAreaChart";
import {byteDisplay, cpuPctDisplay, loadAvgDisplay, throughputUnit} from "../es/metricUtils";
import {MultiLineChart} from "../es/charts/multiLineChart";
import {ISvrPageProps} from "./serverPageFrame";
import {AbstractServerChartPage, AbstractServerChartView, HostDataView, SvrNavPage} from "./serverCommons";
import {AmplitudeAnalytics} from "../analytics";
import {serverPageConnector} from "../reduxConnectors";


interface IComputePageState
{
	data: ISeriesData[];
}



export class SvrComputePage extends SvrNavPage
{
	componentWillMount(): any
	{
		AmplitudeAnalytics.track("Servers - Compute");
		// return super.componentWillMount();
	}

	protected renderHostDataView()
	{
		return <ComputeHostView/>;
	}
}

class ComputeHostView_Connect extends HostDataView
{
	protected renderSingleHostView()
	{
		return <ServerComputePage/>;
	}

	protected renderMultipleHostView(): any
	{
		return (
			<div>
				<ServerMemoryMultiplePage/>
				<ServerComputeMultiplePage/>
				<ServerLoadAvgMultiplePage/>
			</div>
		);
	}
}

class ServerComputePage_Connect extends AbstractServerChartPage<ISvrPageProps,IComputePageState>
{
	protected getMetricFetchURLs(): string[]
	{
		return ["/servers/serverdata"];
	}

	protected initialState(): IComputePageState
	{
		return {data: null};
	}

	protected getStateFromPostResponse(responseData: any): IComputePageState
	{
		return {data: responseData[0]};
	}

	protected renderContent(data: IComputePageState): any
	{
		const seriesList = data.data;

		if(_.isEmpty(seriesList))
			return <h2>No data for this time range</h2>;

		const used = SeriesDataUtils.toChartSeries(seriesList, "system.memory.used", "Used Memory");
		const free = SeriesDataUtils.toChartSeries(seriesList, "system.memory.free", "Free Memory");

		const load1 = SeriesDataUtils.toChartSeries(seriesList, "system.load1", "Load1");
		const load5 = SeriesDataUtils.toChartSeries(seriesList, "system.load1", "Load5");
		const load15 = SeriesDataUtils.toChartSeries(seriesList, "system.load1", "Load15");

		const cpuUser = SeriesDataUtils.toChartSeries(seriesList, "system.cpu.user", "User");
		const cpuIO = SeriesDataUtils.toChartSeries(seriesList, "system.cpu.iowait", "IO Wait");
		const cpuSys = SeriesDataUtils.toChartSeries(seriesList, "system.cpu.system", "System");

		return (
			<RowCol>
				<ChartTitle chartName="Memory" bottomSpace={true}/>
				<StackedAreaChart dispatch={this.props.dispatch} displayFunc={byteDisplay} seriesList={[free, used]}/>

				<ChartTitle chartName="CPU" bottomSpace={true}/>
				<StackedAreaChart dispatch={this.props.dispatch} displayFunc={cpuPctDisplay} seriesList={[cpuUser, cpuSys, cpuIO]}/>

				<ChartTitle chartName="Load Average" bottomSpace={true}/>
				<MultiLineChart dispatch={this.props.dispatch} valueDisplayFunc={loadAvgDisplay} seriesList={[load1, load5, load15]}/>
			</RowCol>
		);
	}
}


class ServerComputeMultiplePage_Connect extends AbstractServerChartView<ISvrPageProps>
{
	protected getMetricFetchURLs(): string[]
	{
		return ["/servers/compute/multiple"];
	}

	protected renderData(seriesList: ISeriesData[])
	{
		return (
			<RowCol>
				<ChartTitle chartName="CPU" bottomSpace={true}/>
				<MultiLineChart dispatch={this.props.dispatch} valueDisplayFunc={cpuPctDisplay} seriesList={seriesList}/>
			</RowCol>
		);
	}
}



class ServerMemoryMultiplePage_Connect extends AbstractServerChartView<ISvrPageProps>
{
	protected getMetricFetchURLs(): string[]
	{
		return ["/servers/memory/multiple"];
	}

	protected renderData(seriesList: ISeriesData[])
	{
		return (
			<RowCol>
				<ChartTitle chartName="Memory" bottomSpace={true}/>
				<MultiLineChart dispatch={this.props.dispatch} valueDisplayFunc={cpuPctDisplay} seriesList={seriesList}/>
			</RowCol>
		);
	}
}


class ServerLoadAvgMultiplePage_Connect extends AbstractServerChartView<ISvrPageProps>
{
	protected getMetricFetchURLs(): string[]
	{
		return ["/servers/load/multiple"];
	}

	protected renderData(seriesList: ISeriesData[])
	{
		return (
			<RowCol>
				<ChartTitle chartName="Load Average" bottomSpace={true}/>
				<MultiLineChart dispatch={this.props.dispatch} valueDisplayFunc={throughputUnit} seriesList={seriesList}/>
			</RowCol>
		);
	}
}


const ComputeHostView = connect((state)=> serverPageConnector(state))(ComputeHostView_Connect);
const ServerLoadAvgMultiplePage = connect((state)=> serverPageConnector(state))(ServerLoadAvgMultiplePage_Connect);
const ServerMemoryMultiplePage = connect((state)=> serverPageConnector(state))(ServerMemoryMultiplePage_Connect);
const ServerComputePage = connect((state)=> serverPageConnector(state))(ServerComputePage_Connect);
const ServerComputeMultiplePage = connect((state)=> serverPageConnector(state))(ServerComputeMultiplePage_Connect);