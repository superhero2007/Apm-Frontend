import * as React from "react";
import * as _ from "lodash";
import {LoadableComponent} from "../widgets/loadableComponent";
import {DSTable} from "../widgets/dsTable";
import {byteDisplay, Units} from "../es/metricUtils";
import {Grid} from "react-bootstrap";


enum EHostSize {
	S,M,L
}

interface IJVMIDData
{
	host: string;
	ram: number;
}

interface IAccInfo
{
	numJVMs: number;
	hostData: IJVMIDData[]
}

interface IProps
{}


interface IState
{
	accInfo: IAccInfo;
}

export class AccHostInfo extends LoadableComponent<IProps, IState>
{
	protected initialState(): IState
	{
		return {accInfo: null};
	}


	protected getPostData(): any
	{
		return {};
	}

	protected getPostUrl(): string
	{
		return "/app/jvms/account/data";
	}

	protected getStateFromPostResponse(responseData: any): IState
	{
		return {accInfo: responseData};
	}

	private getHostSize(ram: number)
	{
		if(ram <= (5*Units.GB))
		{
			return EHostSize.S;
		}
		else if(ram<= (10* Units.GB))
		{
			return EHostSize.M;
		}

		return EHostSize.L;
	}

	private priceForSize(size: EHostSize)
	{
		switch (size)
		{
			case EHostSize.S:
				return 0;
			case EHostSize.M:
				return 40;
			case EHostSize.L:
				return 60;
		}
		console.log("error", size);
	}

	protected renderContent(data: IState): any
	{
		const hostData = data.accInfo.hostData;

		const sortedHosts = _.reverse(_.sortBy(hostData, h => h.ram));

		const ramGroups = _.groupBy(hostData, h => h.ram);

		const ramRows = [];
		_.forOwn(ramGroups, (hostData: IJVMIDData[], ram) => {
			ramRows.push((
				<tr key={ram}>
					<td>{byteDisplay(Number(ram))}</td>
					<td>{hostData.length}</td>
					<td>{EHostSize[this.getHostSize(Number(ram))]}</td>
				</tr>
			));
		});


		const priceRows = [];
		const sizeGroups = _.groupBy(hostData, h => this.getHostSize(h.ram));
		_.forOwn(sizeGroups, (hostData: IJVMIDData[], size:string) => {
			priceRows.push((
				<tr key={size}>
					<td>{EHostSize[size]}</td>
					<td>{hostData.length}</td>
				</tr>
			));
		});

		const currentCost = hostData.length * 20;

		let totalNewCost = 0;
		for (let host of hostData)
		{
			const hostSize = this.getHostSize(host.ram);
			const price = this.priceForSize(hostSize);

			totalNewCost+= price;
		}

		return (
			<Grid>
				<DSTable>
					<tr>
						<td>Total JVMs</td>
						<td>{`${data.accInfo.numJVMs} JVMs`}</td>
					</tr>
					<tr>
						<td>Total Hosts</td>
						<td>{`${hostData.length} Hosts`}</td>
					</tr>
				</DSTable>

				<DSTable columnNames={["Size", "Count"]}>
					{priceRows}
				</DSTable>
				<DSTable columnNames={["RAM", "Count","Size"]}>
					{ramRows}
				</DSTable>

				<DSTable columnNames={["Name", "RAM", "Size"]}>
					{sortedHosts.map(host => <tr key={host.host}>
						<td>{host.host}</td>
						<td>{byteDisplay(host.ram)}</td>
						<td>{EHostSize[this.getHostSize(host.ram)]}</td>
					</tr>)}

				</DSTable>
			</Grid>
		);
	}

}