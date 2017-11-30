import * as React from "react";
import {AbstractServerChartPage, EntityDetailPage, HostDataView, IEntityDetailPageProps, IEntityDetailPageState, IEntityProps, ServerSeriesUtils, SvrNavPage} from "./serverCommons";
import {ISvrPageProps} from "./serverPageFrame";
import {connect} from "react-redux";
import {ISortedListItem, MetricSortType, SortedMetricList} from "../es/widgets/sortedMetricList";
import {Col, Row} from "react-bootstrap";
import {RowCol} from "../widgets/rowCol";
import {action_updateServerProcSortType, action_updateServerSelectedEntity, ServerProcSortType} from "../reducers/serverPageReducer";
import {ChartTitle} from "../es/charts/chartTitle";
import {ISeriesData, SeriesDataUtils} from "../es/views/metricDetailView";
import {SingleLineChart} from "../es/charts/lineChart";
import {byteDisplay, cpuPctDisplay, perSecondDisplay, throughputUnit} from "../es/metricUtils";
import {MultiLineChart} from "../es/charts/multiLineChart";
import {AmplitudeAnalytics} from "../analytics";
import {ProcSortSelect} from "./procSortSelect";
import {QueryRequests} from "../es/queryRequests";
import {Http} from "../http";
import * as _ from "lodash";
import * as classNames from "classnames";
import {serverPageConnector, serverPageConnectorWithProps} from "../reduxConnectors";

export class SvrProcessPage extends SvrNavPage
{
	componentWillMount(): any
	{
		AmplitudeAnalytics.track("Servers - Processes");
		// return super.componentWillMount();
	}

	protected renderHostDataView()
	{
		return <ProcessView/>;
	}
}

class ProcessView_connect extends HostDataView
{
	protected renderSingleHostView()
	{
		return <ProcessListView/>;
	}

	protected renderMultipleHostView()
	{
		return <ProcessMultiHostViewParent/>;
	}

	componentWillUnmount()
	{
		this.props.dispatch(action_updateServerSelectedEntity(null));
		// super.componentWillUnmount(); //TODO potential call to super
	}

}


class ProcessMultiHostViewParent_connect extends React.Component<ISvrPageProps, {}>
{
	protected getSelectedEntity()
	{
		return this.props.serverPage.selectedEntity;
	}

	render()
	{
		const entity = this.getSelectedEntity();

		if(_.isEmpty(entity))
		{
			return (
				<div>
					<h3>Selected a Process in Single-Host view</h3>
				</div>
			);
		}

		return <ProcessMultiHostView entity={entity}/>;
	}
}

interface IPerMetricMultiHostSeriesData {
	metricName: string;
	seriesDataList: ISeriesData[];
}
interface IPMHVState extends IEntityDetailPageState<IPerMetricMultiHostSeriesData> {

}

class ProcessMultiHostView_connect extends EntityDetailPage<IEntityDetailPageProps, IPMHVState, IPerMetricMultiHostSeriesData>
{
	protected getMetricFetchURLs(): string[]
	{
		return ["/servers/ps/multiple/stats"];
	}


	protected renderCharts(data: IPMHVState)
	{
		const cpu = this.extractSeries(data.data, "system.pid.cpupct");
		const threadCount = this.extractSeries(data.data, "system.pid.threadcount");
		const instanceCount = this.extractSeries(data.data, "system.pid.instancecount");
		const fdUsed = this.extractSeries(data.data, "system.pid.fdused");
		const memory = this.extractSeries(data.data, "system.pid.memres");

		const diskRead = this.extractSeries(data.data, "system.pid.readbytes");
		const diskWrite = this.extractSeries(data.data, "system.pid.writebytes");

		return (
			<RowCol>
				<Row>
					<Col xs={4}>
						<div className={classNames("txnListBar", "progress",{"active":true})}>
							<div className="txnName">
								{this.props.entity}
							</div>
							<div className="progress-bar" style={{width:"100%"}}/>
						</div>
					</Col>
					<Col xs={8}>
						<ChartTitle chartName="CPU" bottomSpace={true}/>
						<MultiLineChart dispatch={this.props.dispatch} valueDisplayFunc={cpuPctDisplay} seriesList={cpu}/>

						<ChartTitle chartName="Memory" bottomSpace={true}/>
						<MultiLineChart dispatch={this.props.dispatch} valueDisplayFunc={byteDisplay} seriesList={memory}/>


						<ChartTitle chartName="Thread Count" bottomSpace={true}/>
						<MultiLineChart dispatch={this.props.dispatch} valueDisplayFunc={throughputUnit} seriesList={threadCount}/>

						<ChartTitle chartName="Running Instances" bottomSpace={true}/>
						<MultiLineChart dispatch={this.props.dispatch} valueDisplayFunc={throughputUnit} seriesList={instanceCount}/>

						<ChartTitle chartName="File Descriptors Used" bottomSpace={true}/>
						<MultiLineChart dispatch={this.props.dispatch} valueDisplayFunc={throughputUnit} seriesList={fdUsed}/>

						<ChartTitle chartName="Disk Read" bottomSpace={true}/>
						<MultiLineChart dispatch={this.props.dispatch} valueDisplayFunc={perSecondDisplay(byteDisplay)} seriesList={diskRead}/>

						<ChartTitle chartName="Disk Write" bottomSpace={true}/>
						<MultiLineChart dispatch={this.props.dispatch} valueDisplayFunc={perSecondDisplay(byteDisplay)} seriesList={diskWrite}/>

					</Col>
				</Row>
			</RowCol>
		);

	}


	private extractSeries(data: IPerMetricMultiHostSeriesData[], metricName)
	{
		const multiHostData = data.find(it => it.metricName === metricName);
		return ServerSeriesUtils.convertHostIdsToNames(multiHostData.seriesDataList, this.props.serverPage);
	}
}

interface IPLVState
{
	list: ISortedListItem[];
}

function procSortTypeToMetric(sortType: ServerProcSortType)
{
	switch (sortType)
	{
		case ServerProcSortType.Cpu:
			return "system.pid.cpupct";
		case ServerProcSortType.Mem:
			return "system.pid.memres";
		case ServerProcSortType.ThreadCount:
			return "system.pid.threadcount";
		case ServerProcSortType.InstanceCount:
			return "system.pid.instancecount";
		case ServerProcSortType.FDLimit:
			return "system.pid.fdlimit";
		case ServerProcSortType.FDUsed:
			return "system.pid.fdused";
		case ServerProcSortType.DiskRead:
			return "system.pid.readbytes";
		case ServerProcSortType.DiskWrite:
			return "system.pid.writebytes";
		default:
			console.log("procSortTypeToMetric() - Forgot to put switch for ServerProcType case");
	}

}

class ProcessListView_connect extends AbstractServerChartPage<ISvrPageProps, IPLVState>
{


	protected getHttpRequests(props:ISvrPageProps) :JQueryXHR[]
	{
		const body = QueryRequests.postBody_ServerQueryFilter(props.timeRangeFilter, props.hostFilter);
		body.metricNames = [procSortTypeToMetric(props.serverPage.procSortType)];
		return this.getMetricFetchURLs().map(url => Http.postJSON(url, body));
	}

	protected getMetricFetchURLs(): string[]
	{
		return ["/servers/ps/list"];
	}

	componentWillReceiveProps(nextProps:ISvrPageProps)
	{
		if(QueryRequests.filterChanged_procSort(nextProps, this.props))
		{
			this.reloadData(nextProps);
		}
	}

	protected initialState(): IPLVState
	{
		return {list: []};
	}

	protected getStateFromPostResponse(responseData: any): IPLVState
	{
		const itemList:ISortedListItem[] = responseData[0];
		const entity = this.getSelectedEntity();
		let selectedItem = null;
		if(entity != null)
		{
			selectedItem = itemList.find(it => it.name == entity);
		}

		//if length is 0, then we dont change selected entity
		//if length > 0, then something must be selected
		//check if there is no selection: either no selection in reducer (entity), or no item in list matching current selection
		//if no selection, then select first item
		if (itemList.length > 0)
		{
			if(entity == null || selectedItem == null)
			{
				this.props.dispatch(action_updateServerSelectedEntity(itemList[0].name));
			}
		}

		return {list: itemList};
	}

	private onSelectMetric(it:ISortedListItem)
	{
		this.props.dispatch(action_updateServerSelectedEntity(it.name));
	}

	protected getSelectedEntity()
	{
		return this.props.serverPage.selectedEntity;
	}


	private onSelectSort(sort:ServerProcSortType)
	{
		this.props.dispatch(action_updateServerProcSortType(sort));
	}

	private getMetricSortType(sortType: ServerProcSortType)
	{
		switch (sortType)
		{
			case ServerProcSortType.Cpu:
				return MetricSortType.ERR_RATE;
			case ServerProcSortType.Mem:
			case ServerProcSortType.ThreadCount:
			case ServerProcSortType.InstanceCount:
			case ServerProcSortType.FDLimit:
			case ServerProcSortType.FDUsed:
			case ServerProcSortType.DiskRead:
			case ServerProcSortType.DiskWrite:
				return MetricSortType.THROUGHPUT_CUSTOM_UNIT;
			default:
				console.log("getMetricSortType() - Forgot to put switch for ServerProcType case");
		}
	}

	private getMetricDisplayFunc(sortType: ServerProcSortType)
	{
		switch (sortType)
		{
			case ServerProcSortType.Mem:
				return byteDisplay;
			case ServerProcSortType.DiskRead:
			case ServerProcSortType.DiskWrite:
				return perSecondDisplay(byteDisplay);
			case ServerProcSortType.ThreadCount:
			case ServerProcSortType.InstanceCount:
			case ServerProcSortType.FDLimit:
			case ServerProcSortType.FDUsed:

				return throughputUnit;
			default:
				return null;
		}
	}
	protected renderContent(data: IPLVState): any
	{
		if (data.list.length == 0)
		{
			return (<h3>No data</h3>);
		}

		const entity = this.getSelectedEntity();
		const selectedItem = data.list.find(it => it.name == entity);
		const sortType = this.props.serverPage.procSortType;

		return (
				<Row>
					<Col xs={4}>
						<RowCol className="bottom2">
							<ProcSortSelect onSelection={this.onSelectSort.bind(this)} selected={sortType}/>
						</RowCol>
						<RowCol>
							<SortedMetricList listItems={data.list} sortType={this.getMetricSortType(sortType)}
							                  onSelectMetric={this.onSelectMetric.bind(this)} selectedItem={selectedItem} customDisplayFunc={this.getMetricDisplayFunc(sortType)}/>
						</RowCol>
					</Col>
					<Col xs={8}>
						<RowCol>
							<h3>{this.getSelectedEntity()}</h3>
							<hr/>
							<ProcessStatsView entity={selectedItem.name}/>
						</RowCol>
					</Col>
				</Row>
		);
	}
}

interface IPSVState extends IEntityDetailPageState<ISeriesData>
{
	rateData: ISeriesData[];
}


class ProcessStatsView_connect extends EntityDetailPage<IEntityDetailPageProps, IPSVState>
{
	protected getMetricFetchURLs(): string[]
	{
		return ["/servers/ps/stats", "/servers/ps/rateStats"];
	}

	protected getStateFromPostResponse(responseData: any): IPSVState
	{
		return {data: responseData[0], rateData: responseData[1]};
	}

	protected renderCharts(data: IPSVState)
	{
		const read = SeriesDataUtils.toChartSeries(data.rateData, "system.pid.readbytes", "Read");
		const write = SeriesDataUtils.toChartSeries(data.rateData, "system.pid.writebytes", "Write");

		const fdUsed = SeriesDataUtils.toChartSeries(data.data, "system.pid.fdlimit", "Limit");
		const fdLimit = SeriesDataUtils.toChartSeries(data.data, "system.pid.fdused", "Used");

		return (
			<div>
				{this.renderStat(data.data, "system.pid.cpupct", "CPU", cpuPctDisplay)}
				{this.renderStat(data.data, "system.pid.memres", "Memory", byteDisplay)}
				{this.renderStat(data.data, "system.pid.threadcount", "Thread Count", throughputUnit)}
				{this.renderStat(data.data, "system.pid.instancecount", "Running Instances", throughputUnit)}

				<RowCol>
					<ChartTitle chartName="Disk IO" bottomSpace={true}/>
					<MultiLineChart dispatch={this.props.dispatch} seriesList={[read, write]} valueDisplayFunc={perSecondDisplay(byteDisplay)}/>
				</RowCol>

				<RowCol>
					<ChartTitle chartName="File Descriptors" bottomSpace={true}/>
					<MultiLineChart dispatch={this.props.dispatch} seriesList={[fdUsed, fdLimit]} valueDisplayFunc={throughputUnit}/>
				</RowCol>
			</div>
		);
	}

	private renderStat(seriesList:ISeriesData[], seriesName: string, chartSeriesName: string, displayFunc)
	{
		const series = SeriesDataUtils.toChartSeries(seriesList, seriesName, chartSeriesName);

		return (
			<RowCol>
				<ChartTitle chartName={series.seriesName} bottomSpace={true}/>
				<SingleLineChart dispatch={this.props.dispatch} dataPoints={series.dataPoints} valueDisplayFunc={displayFunc} seriesName={series.seriesName}/>
			</RowCol>
		);
	}

}

const ProcessView = connect((state)=> serverPageConnector(state))(ProcessView_connect);
const ProcessListView = connect((state)=> serverPageConnector(state))(ProcessListView_connect);
const ProcessMultiHostViewParent = connect((state)=> serverPageConnector(state))(ProcessMultiHostViewParent_connect);
const ProcessMultiHostView = connect((state, props: IEntityProps)=> serverPageConnectorWithProps(state, props))(ProcessMultiHostView_connect);
const ProcessStatsView = connect((state, props: IEntityProps)=> serverPageConnectorWithProps(state, props))(ProcessStatsView_connect);