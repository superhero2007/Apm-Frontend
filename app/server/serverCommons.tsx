import {Http} from "../http";
import * as _ from "lodash";
import {QueryRequests} from "../es/queryRequests";
import {LoadableComponent} from "../widgets/loadableComponent";
import {ISvrPageProps} from "./serverPageFrame";
import {ChangeDetectionAppRR, ChangeDetectionServerRR} from "../es/pinned/changeDetectRRPinned";
import * as React from "react";
import {ServerFilters} from "./serverFilters";
import {Col, Grid, ListGroup, ListGroupItem, Row} from "react-bootstrap";
import {ISeriesData} from "../es/views/metricDetailView";
import {action_updateServerSelectedEntity, IHostId, IRR_ServerPage} from "../reducers/serverPageReducer";
import {RowCol} from "../widgets/rowCol";

export abstract class AbstractServerChartPage<P extends ISvrPageProps, S> extends LoadableComponent<P, S>
{

	componentWillReceiveProps(nextProps:P)
	{
		const oldProps = this.props;
		if (this.hasChanged(oldProps, nextProps))
		{
			this.reloadData(nextProps);
		}
	}

	protected hasChanged(oldProps: P, nextProps: P)
	{
		return ChangeDetectionAppRR.timeRange(oldProps.timeRangeFilter, nextProps.timeRangeFilter) || ChangeDetectionServerRR.selectedHostsChanged(oldProps.hostFilter, nextProps.hostFilter);
	}

	protected getHttpRequests(props:ISvrPageProps) :JQueryXHR[]
	{
		const body = QueryRequests.postBody_ServerQueryFilter(props.timeRangeFilter, props.hostFilter);
		return this.getMetricFetchURLs().map(url => Http.postJSON(url, body));
	}

	protected abstract getMetricFetchURLs(): string[];
}


interface IServerChartViewState
{
	data: ISeriesData[];
}

export abstract class AbstractServerChartView<P extends ISvrPageProps> extends AbstractServerChartPage<P,IServerChartViewState>
{
	protected initialState(): IServerChartViewState
	{
		return {data: null};
	}

	protected getStateFromPostResponse(responseData: any): IServerChartViewState
	{
		return {data: responseData[0]};
	}

	protected renderContent(data: IServerChartViewState ): any
	{
		const seriesList = data.data;

		if(_.isEmpty(seriesList))
			return <h2>No data for this time range</h2>;

		const newSeries = ServerSeriesUtils.convertHostIdsToNames(seriesList, this.props.serverPage);

		return this.renderData(newSeries);
	}

	protected abstract renderData(seriesList: ISeriesData[])
}


export abstract class AbstractServerChartSelectableListPage<P extends ISvrPageProps, S> extends AbstractServerChartPage<P,S>
{
	componentWillUnmount()
	{
		this.props.dispatch(action_updateServerSelectedEntity(null));
		super.componentWillUnmount();
	}

	protected onItemLoad(itemList: string[])
	{
		if (itemList.length > 0 && this.getSelectedEntity() == null)
		{

			this.props.dispatch(action_updateServerSelectedEntity(itemList[0]));
		}
	}

	protected onItemSelect(item: string)
	{
		if (item != this.getSelectedEntity())
		{
			this.props.dispatch(action_updateServerSelectedEntity(item));
		}
	}

	protected getSelectedEntity()
	{
		return this.props.serverPage.selectedEntity;
	}

	protected renderSelectionDetail(data:S)
	{
		const selection = this.getSelectedEntity();
		let detailView;
		if(selection)
		{
			detailView = this.renderDetail(selection, data);
		}

		return detailView;

	}

	protected renderListAndDetail(data: S, itemList: string[]): any
	{
		return (
			<Row>
				<Col xs={2}>
					<EntitySelectableList entities={itemList} onSelect={this.onItemSelect.bind(this)} selectedEntity={this.getSelectedEntity()}/>
				</Col>
				<Col xs={10}>
					<RowCol>
						<h3>{this.getSelectedEntity()}</h3>
						<hr/>
					</RowCol>
					{this.renderSelectionDetail(data)}
				</Col>
			</Row>
		);
	}

	protected abstract renderDetail(selectedEntity: string, data: S);
}

export abstract class HostDataView extends React.Component<ISvrPageProps, {}>
{
	render()
	{
		const hosts = this.props.hostFilter.selectedHostIds;

		if(!hosts || hosts.length ==0)
			return <h2>No Hosts Selected</h2>;

		if(hosts.length == 1)
			return this.renderSingleHostView();

		return this.renderMultipleHostView();
	}

	protected renderMultipleHostView()
	{
		return <h3>Multie Hosts selected</h3>;
	}

	protected abstract renderSingleHostView();
}


export abstract class SvrNavPage extends React.Component<{}, {}>
{
	render()
	{
		return (
			<Grid fluid={true}>
				<ServerFilters/>
				{this.renderHostDataView()}
			</Grid>
		);
	}

	protected abstract renderHostDataView();
}


export class EntitySelectableList extends React.Component<{
	entities: string[]
	onSelect: (entity:string)=>void;
	selectedEntity: string;
}, {}>
{
	private onSelect(entity:string)
	{
		this.props.onSelect(entity);
	}

	render()
	{
		const list = this.props.entities;
		if(_.isEmpty(list))
			return <h3>No data</h3>;

		return (
			<ListGroup>
				{this.props.entities.map(et => <ListGroupItem key={et} onClick={this.onSelect.bind(this, et)} active={this.props.selectedEntity == et}>{et}</ListGroupItem>)}
			</ListGroup>
		)
	}
}

export interface IEntityProps {
	entity: string;
}
export type IEntityDetailPageProps = ISvrPageProps & IEntityProps

export interface IEntityDetailPageState<DataType>
{
	data: DataType[];
}

export abstract class EntityDetailPage<P extends IEntityDetailPageProps, S extends IEntityDetailPageState<DataType>, DataType = ISeriesData> extends AbstractServerChartPage<P, IEntityDetailPageState<DataType>>
{
	protected hasChanged(oldProps: P, nextProps: P): boolean
	{
		let changed = super.hasChanged(oldProps, nextProps);

		if(!changed)
		{
			if(oldProps.entity != nextProps.entity)
				return true;
		}

		return changed;
	}

	protected getHttpRequests(props: P): JQueryXHR[]
	{
		const body = QueryRequests.postBody_ServerQueryFilter(props.timeRangeFilter, props.hostFilter, props.entity);
		return this.getMetricFetchURLs().map(url => Http.postJSON(url, body));
	}


	protected initialState(): IEntityDetailPageState<DataType>
	{
		return {data: []};
	}

	protected getStateFromPostResponse(responseData: any): IEntityDetailPageState<DataType>
	{

		return {data: responseData[0]};
	}

	protected renderContent(data: S): any
	{
		const seriesList = data.data;

		if (_.isEmpty(seriesList))
			return <h2>No data for this time range</h2>;

		return this.renderCharts(data);
	}

	protected abstract renderCharts(data: S);
}

export class ServerSeriesUtils
{
	static convertHostIdsToNames(seriesList: ISeriesData[], svrRR: IRR_ServerPage): ISeriesData[]
	{
		const hosts = svrRR.hosts;
		return seriesList.map(s => ({seriesName: this.hostIdToDisplayName(s.seriesName, hosts), dataPoints: s.dataPoints}));
	}

	public static hostIdToDisplayName(id: string, hosts:IHostId[])
	{
		const host = hosts.find(h => h.id == id);
		if(host)
		{
			return host.label;
		}

		return id;
	}

	public static labelHosts(hostList:IHostId[])
	{
		const hostNameMap= new Map<string, number>();

		for (const hostInfo of hostList)
		{
			let count = hostNameMap.has(hostInfo.name)? 2: 1;
			hostNameMap.set(hostInfo.name, count);

		}

		for (const hostInfo of hostList)
		{
			const count = hostNameMap.get(hostInfo.name);

			let label = hostInfo.name;
			if (count > 1)
			{
				label = hostInfo.fullName;
			}

			hostInfo.label = label;
		}
	}


}