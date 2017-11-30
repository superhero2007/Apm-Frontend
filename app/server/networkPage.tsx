import * as React from "react";
import {ISvrPageProps} from "./serverPageFrame";
import {connect} from "react-redux";
import {
	AbstractServerChartSelectableListPage,
	AbstractServerChartView,
	EntityDetailPage,
	HostDataView,
	IEntityDetailPageProps,
	IEntityDetailPageState,
	IEntityProps,
	SvrNavPage
} from "./serverCommons";
import {ISeriesData, SeriesDataUtils} from "../es/views/metricDetailView";
import {ChartTitle} from "../es/charts/chartTitle";
import {byteDisplay, perSecondDisplay, throughputUnit} from "../es/metricUtils";
import {MultiLineChart} from "../es/charts/multiLineChart";
import {RowCol} from "../widgets/rowCol";
import {QueryRequests} from "../es/queryRequests";
import {Http} from "../http";
import {AmplitudeAnalytics} from "../analytics";
import {serverPageConnector, serverPageConnectorWithProps} from "../reduxConnectors";


export class SvrNetworkPage extends SvrNavPage
{
	componentWillMount(): any
	{
		AmplitudeAnalytics.track("Servers - Network");
		// return super.componentWillMount();
	}

	protected renderHostDataView()
	{
		return <NetworkHostView/>;
	}
}

class NetworkHostView_connect extends HostDataView
{
	protected renderSingleHostView()
	{
		return <ServerNetworkPage/>;
	}


	protected renderMultipleHostView(): any
	{
		return (
			<div>
				<ServerNetworkMultiPage/>
			</div>
		)
	}
}


interface INetworkPageState
{
	ifaceList: string[];
}


class ServerNetworkPage_connect extends AbstractServerChartSelectableListPage<ISvrPageProps, INetworkPageState>
{
	protected getMetricFetchURLs(): string[]
	{
		return ["/servers/network/entity/list"];
	}
	protected initialState(): INetworkPageState
	{
		return { ifaceList: []};
	}

	protected getStateFromPostResponse(responseData: any): INetworkPageState
	{
		const ifaceList: string[] = responseData[0];
		this.onItemLoad(ifaceList);

		return {ifaceList: ifaceList};
	}

	protected renderDetail(selectedEntity: string, data: INetworkPageState)
	{
		return <NetworkIfaceDataPage entity={selectedEntity}/>;
	}

	protected renderContent(data: INetworkPageState): any
	{
		return (
			<div>
				{this.renderListAndDetail(data, data.ifaceList)}
			</div>
		);
	}
}


class ServerNetworkMultiPage_connect extends AbstractServerChartSelectableListPage<ISvrPageProps, {}>
{
	private readonly listItems: string[] =["Bandwidth", "Packets", "Errors", "Dropped"];


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
		return <NetworkDetailMultiplePage entity={selectedEntity}/>;
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


class NetworkIfaceDataPage_connect extends EntityDetailPage<IEntityDetailPageProps, IEntityDetailPageState<ISeriesData>>
{
	protected getMetricFetchURLs(): string[]
	{
		return ["/servers/network/entity/data"];
	}

	protected renderCharts(data: IEntityDetailPageState<ISeriesData>)
	{
		const seriesList = data.data;

		const rxBytes = SeriesDataUtils.toChartSeries(seriesList, "system.network.rxbytes", "Received Data");
		const txBytes = SeriesDataUtils.toChartSeries(seriesList, "system.network.txbytes", "Sent Data");

		const rxPackets = SeriesDataUtils.toChartSeries(seriesList, "system.network.rxpackets", "Received Packets");
		const txPackets = SeriesDataUtils.toChartSeries(seriesList, "system.network.txpackets", "Sent Packets");

		const rxErrors = SeriesDataUtils.toChartSeries(seriesList, "system.network.rxerrs", "Received Errors");
		const txErrors = SeriesDataUtils.toChartSeries(seriesList, "system.network.txerrs", "Sent Errors");

		const rxDrops = SeriesDataUtils.toChartSeries(seriesList, "system.network.rxdrop", "Dropped Receiving");
		const txDrops = SeriesDataUtils.toChartSeries(seriesList, "system.network.txdrop", "Dropped Sending");

		return (
			<div>
				<ChartTitle chartName="Network Traffic" bottomSpace={true}/>
				<MultiLineChart dispatch={this.props.dispatch} valueDisplayFunc={perSecondDisplay(byteDisplay)} seriesList={[rxBytes, txBytes]}/>

				<ChartTitle chartName="Packets" bottomSpace={true}/>
				<MultiLineChart dispatch={this.props.dispatch} valueDisplayFunc={perSecondDisplay(throughputUnit)} seriesList={[rxPackets, txPackets]}/>

				<ChartTitle chartName="Errors" bottomSpace={true}/>
				<MultiLineChart dispatch={this.props.dispatch} valueDisplayFunc={perSecondDisplay(throughputUnit)} seriesList={[rxErrors, txErrors]}/>

				<ChartTitle chartName="Dropped" bottomSpace={true}/>
				<MultiLineChart dispatch={this.props.dispatch} valueDisplayFunc={perSecondDisplay(throughputUnit)} seriesList={[rxDrops, txDrops]}/>

			</div>
		);
	}

}

interface INetorkMetricStat
{
	rx: string;
	tx: string;
	displayFunc;
}


class NetworkDetailMultiplePage_connect extends EntityDetailPage<IEntityDetailPageProps, IEntityDetailPageState<ISeriesData>>
{
	private readonly etyToMetric: { [key: string]: INetorkMetricStat} = {
		"Bandwidth": {rx: "system.network.rxbytes", tx: "system.network.txbytes", displayFunc: byteDisplay},
		"Packets": {rx: "system.network.rxpackets", tx: "system.network.txpackets", displayFunc: throughputUnit},
		"Errors": {rx: "system.network.rxerrs", tx: "system.network.txerrs", displayFunc: throughputUnit},
		"Dropped": {rx: "system.network.rxdrop", tx: "system.network.txdrop", displayFunc: throughputUnit},
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
		const metric = this.etyToMetric[this.props.entity];
		return (
			<div>
				<NwTxMultipleChart title="Received" metricName={metric.rx} displayFunc={metric.displayFunc}/>
				<NwTxMultipleChart title="Sent" metricName={metric.tx} displayFunc={metric.displayFunc}/>
			</div>
		);
	}
}



interface INwMutlipleChartProperties {
	metricName: string;
	title: string;
	displayFunc;
}

type INwMutlipleChartProps = ISvrPageProps & INwMutlipleChartProperties

class NwTxMultipleChart_connect extends AbstractServerChartView<INwMutlipleChartProps >
{
	componentWillReceiveProps(nextProps:INwMutlipleChartProps)
	{
		const oldProps = this.props;

		if(oldProps.metricName != nextProps.metricName || oldProps.title != nextProps.title)
		{
			this.reloadData(nextProps);
			return;
		}

		super.componentWillReceiveProps(nextProps);
	}

	protected getMetricFetchURLs(): string[]
	{
		return [];
	}

	protected getHttpRequests(props: INwMutlipleChartProps): JQueryXHR[]
	{
		const body = QueryRequests.postBody_ServerQueryFilter(props.timeRangeFilter, props.hostFilter);
		body.metricNames = [props.metricName];

		return [Http.postJSON("/servers/network/multiple", body)];
	}

	protected renderData(seriesList: ISeriesData[])
	{
		return (
			<RowCol>
				<ChartTitle chartName={this.props.title} bottomSpace={true}/>
				<MultiLineChart dispatch={this.props.dispatch} valueDisplayFunc={perSecondDisplay(this.props.displayFunc)} seriesList={seriesList}/>
			</RowCol>
		);
	}
}

const NetworkHostView = connect((state)=> serverPageConnector(state))(NetworkHostView_connect);
const ServerNetworkPage = connect((state)=> serverPageConnector(state))(ServerNetworkPage_connect);
const ServerNetworkMultiPage = connect((state)=> serverPageConnector(state))(ServerNetworkMultiPage_connect);
const NetworkIfaceDataPage = connect((state, props: IEntityProps)=> serverPageConnectorWithProps(state, props))(NetworkIfaceDataPage_connect);
const NetworkDetailMultiplePage = connect((state, props: IEntityProps)=> serverPageConnectorWithProps(state, props))(NetworkDetailMultiplePage_connect);
export const NwTxMultipleChart = connect((state, props: INwMutlipleChartProperties)=> serverPageConnectorWithProps(state, props))(NwTxMultipleChart_connect);