import * as React from "react";
import {
	AbstractServerChartSelectableListPage,
	AbstractServerChartView,
	EntityDetailPage,
	HostDataView,
	IEntityDetailPageProps,
	IEntityDetailPageState,
	IEntityProps,
	ServerSeriesUtils,
	SvrNavPage
} from "./serverCommons";
import {connect} from "react-redux";
import {ISvrPageProps} from "./serverPageFrame";
import {ISeriesData, SeriesDataUtils} from "../es/views/metricDetailView";
import {ChartTitle} from "../es/charts/chartTitle";
import {MultiLineChart} from "../es/charts/multiLineChart";
import {byteDisplay, cpuPctDisplay, perSecondDisplay, throughputUnit} from "../es/metricUtils";
import {NwTxMultipleChart} from "./networkPage";
import {RowCol} from "../widgets/rowCol";
import {AmplitudeAnalytics} from "../analytics";
import {serverPageConnector, serverPageConnectorWithProps} from "../reduxConnectors";

export class SvrDiskPage extends SvrNavPage
{
	componentWillMount(): any
	{
		AmplitudeAnalytics.track("Servers - Disk");
		// return super.componentWillMount();
	}

	protected renderHostDataView()
	{
		return <DiskHostView/>;
	}
}

class DiskHostView_Connected extends HostDataView
{
	protected renderSingleHostView()
	{
		return <ServerDiskPage/>;
	}

	protected renderMultipleHostView(): any
	{
		return <ServerDiskMultiPage/>;
	}
}


interface IDiskPageState
{
	diskList: string[];
}


class ServerDiskPage_Connected extends AbstractServerChartSelectableListPage<ISvrPageProps, IDiskPageState>
{
	protected getMetricFetchURLs(): string[]
	{
		return ["/servers/disk/entity/list"];
	}

	protected initialState(): IDiskPageState
	{
		return {diskList: []};
	}

	protected getStateFromPostResponse(responseData: any): IDiskPageState
	{
		const itemList: string[] = responseData[0];

		this.onItemLoad(itemList);

		return {diskList: itemList};
	}

	protected renderDetail(selectedEntity: string, data: IDiskPageState)
	{
		return <DiskIfaceDataPage entity={selectedEntity}/>;
	}

	protected renderContent(data: IDiskPageState): any
	{
		return this.renderListAndDetail(data, data.diskList);
	}


}


interface IDiskIfaceDataState extends IEntityDetailPageState<ISeriesData>
{
	spaceData: ISeriesData[];
}

class DiskIfaceDataPage_Connected extends EntityDetailPage<IEntityDetailPageProps, IDiskIfaceDataState>
{
	protected getMetricFetchURLs(): string[]
	{
		return ["/servers/disk/entity/data","/servers/disk/entity/spaceStats"];
	}

	protected getStateFromPostResponse(responseData: any): IDiskIfaceDataState
	{

		return {data: responseData[0], spaceData: responseData[1]};
	}

	protected renderCharts(data: IDiskIfaceDataState)
	{
		const seriesList = data.data;
		const rxBytes = SeriesDataUtils.toChartSeries(seriesList, "system.disk.bytesread", "Bytes Read");
		const txBytes = SeriesDataUtils.toChartSeries(seriesList, "system.disk.byteswritten", "Bytes Written");

		const readOps = SeriesDataUtils.toChartSeries(seriesList, "system.disk.readops", "Read Ops");
		const writeOps = SeriesDataUtils.toChartSeries(seriesList, "system.disk.writeops", "Write Ops");

		const totalBytes = SeriesDataUtils.toChartSeries(data.spaceData, "system.disk.totalbytes", "Total Disk Space");
		const usedBytes = SeriesDataUtils.toChartSeries(data.spaceData, "system.disk.usedbytes", "Used Disk Space");


		return (
			<div>
				<ChartTitle chartName="Bytes Transferred" bottomSpace={true}/>
				<MultiLineChart dispatch={this.props.dispatch} valueDisplayFunc={perSecondDisplay(byteDisplay)} seriesList={[rxBytes, txBytes]}/>

				<ChartTitle chartName="Disk Operations" bottomSpace={true}/>
				<MultiLineChart dispatch={this.props.dispatch} valueDisplayFunc={perSecondDisplay(throughputUnit)} seriesList={[readOps, writeOps]}/>

				<ChartTitle chartName="Disk Space" bottomSpace={true}/>
				<MultiLineChart dispatch={this.props.dispatch} valueDisplayFunc={byteDisplay} seriesList={[totalBytes, usedBytes]}/>

			</div>
		);
	}
}


class ServerDiskMultiPage_Connected extends AbstractServerChartSelectableListPage<ISvrPageProps, {}>
{
	private readonly listItems: string[] =["Bytes Transferred","Disk Operations", "Disk Space"];


	protected getMetricFetchURLs(): string[]
	{
		return [];
	}
	protected initialState(): {}
	{
		return { };
	}

	protected getStateFromPostResponse(responseData: any): {}
	{
		this.onItemLoad(this.listItems);

		return {};
	}

	protected renderDetail(selectedEntity: string, data: {})
	{
		return <DiskDetailMultiplePage entity={selectedEntity}/>;
	}

	protected renderContent(data: {}): any
	{
		return (
			<div>
				{this.renderListAndDetail(data, this.listItems)}
			</div>
		);
	}
}


interface IDiskMetricStat
{
	r: string;
	w: string;
	displayFunc;
}


class DiskDetailMultiplePage_Connected extends EntityDetailPage<IEntityDetailPageProps, IEntityDetailPageState<ISeriesData>>
{
	private readonly etyToMetric: { [key: string]: IDiskMetricStat} = {
		"Bytes Transferred": {r: "system.disk.bytesread", w: "system.disk.byteswritten", displayFunc: byteDisplay},
		"Disk Operations": {r: "system.disk.readops", w: "system.disk.writeops", displayFunc: throughputUnit},
	};


	protected renderCharts(data: IEntityDetailPageState<ISeriesData>)
	{
	}

	protected getStateFromPostResponse(responseData: any): IEntityDetailPageState<ISeriesData>
	{
		return {data: []};
	}

	protected getMetricFetchURLs(): string[]
	{
		return [];
	}

	protected renderContent(data: IEntityDetailPageState<ISeriesData>): any
	{
		if(this.props.entity == "Disk Space")
		{
			return (
				<div>
					<DiskSpaceMultiplePage/>
				</div>
			);
		}
		const metric = this.etyToMetric[this.props.entity];
		return (
			<div>
				<NwTxMultipleChart title="Read" metricName={metric.r} displayFunc={metric.displayFunc}/>
				<NwTxMultipleChart title="Written" metricName={metric.w} displayFunc={metric.displayFunc}/>
			</div>
		);
	}
}


class DiskSpaceMultiplePage_Connected extends AbstractServerChartView<ISvrPageProps>
{
	protected getMetricFetchURLs(): string[]
	{
		return ["/servers/disk/multiple/spaceStats"];
	}

	private transformSeriesName(series:ISeriesData): ISeriesData
	{
		const split = series.seriesName.split(":");
		const hostId = split[0];
		const diskId = split[1];

		const hostName = ServerSeriesUtils.hostIdToDisplayName(hostId, this.props.serverPage.hosts);

		const name = hostName+ " - "+diskId;

		return {seriesName: name, dataPoints: series.dataPoints};

	}

	protected renderData(seriesList: ISeriesData[])
	{
		const newSeries = seriesList.map(s => this.transformSeriesName(s));
		return (
			<RowCol>
				<ChartTitle chartName="Disk Space" bottomSpace={true}/>
				<MultiLineChart dispatch={this.props.dispatch} valueDisplayFunc={cpuPctDisplay} seriesList={newSeries}/>
			</RowCol>
		);
	}
}

const DiskSpaceMultiplePage =  connect((state)=> serverPageConnector(state))(DiskSpaceMultiplePage_Connected);
const DiskDetailMultiplePage = connect((state, props: IEntityProps)=> serverPageConnectorWithProps(state, props))(DiskDetailMultiplePage_Connected);
const DiskHostView = connect((state)=> serverPageConnector(state))(DiskHostView_Connected);
const ServerDiskPage = connect((state)=> serverPageConnector(state))(ServerDiskPage_Connected);
const DiskIfaceDataPage = connect((state, props: IEntityProps)=> serverPageConnectorWithProps(state, props))(DiskIfaceDataPage_Connected);
const ServerDiskMultiPage = connect((state)=> serverPageConnector(state))(ServerDiskMultiPage_Connected);
