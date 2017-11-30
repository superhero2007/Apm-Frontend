import * as React from "react";
import * as _ from "lodash";
import {LoadableComponent} from "../widgets/loadableComponent";
import {DSTable} from "../widgets/dsTable";
import {Units, roundToTwo} from "../es/metricUtils";
import {humanizeInvoiceHostTime, humanizeInvoiceTime} from "./invoices";


interface IHostInfo
{
	name: string;
	cores: number;
	ram: number;
}

interface IUsageWithCost
{
	interval: string;
	hours: number;
	costCents: number;
}

interface IHostBill
{
	host: IHostInfo;
	size: string;
	usagesWithCost: IUsageWithCost[];
	totalCostCents: number;
}

export interface ITotalBill
{
	totalCostCents: number;
	perSizeCost: any;
	perHostBill: IHostBill[];
}

interface ICurrentBill
{
	bill: ITotalBill;
	invoicePeriod: string;
}
interface IProps
{

}

interface IState
{
	data: ICurrentBill;
}

export class SizeBilling_CurrentUsage extends LoadableComponent<IProps, IState>
{

	protected getPostData(): any
	{
		return null;
	}

	protected getPostUrl(): string
	{
		return "/usagebilling/currentUsage";
	}

	protected initialState(): IState
	{
		return {data: null};
	}

	protected getStateFromPostResponse(responseData: any): IState
	{
		return {data: responseData};
	}

	protected renderContent(data: IState): any
	{
		const bill = data.data.bill;
		const billPeriod = this.parseInterval(data.data.invoicePeriod);

		if(!bill)
			return <div/>;

		const sizeRows = [];

		_.forOwn(bill.perSizeCost, (value, key)=> {
			sizeRows.push(<tr key={key}>
				<td>{key}</td>
				<td>{value/100}</td>
			</tr>)
		});


		let ctr = 0;
		const usgRows = [];
		for(const hostBill of bill.perHostBill)
		{
			for(const ug of hostBill.usagesWithCost)
			{
				const host = hostBill.host;
				const split = ug.interval.split("-");
				const begin = Number(split[0]);
				const end = Number(split[1]);

				usgRows.push(
					<tr key={ctr++}>
						<td>{host.name}</td>
						<td>{roundToTwo(host.ram/Units.GB) +" GB"}</td>
						<td>{hostBill.size}</td>
						<td>{humanizeInvoiceTime(begin)+" - "+humanizeInvoiceTime(end)}</td>
						<td>{ug.hours}</td>
						<td>{"$"+ug.costCents/100}</td>
					</tr>
				);
			}
		}


		return (
			<div>
				<DSTable>
					<tr>
						<td>Billing Period</td>
						<td>{`${humanizeInvoiceTime(billPeriod[0])} - ${humanizeInvoiceTime(billPeriod[1])}`}</td>
					</tr>
					<tr>
						<td>Total</td>
						<td>{"$"+(bill.totalCostCents/100)}</td>
					</tr>
				</DSTable>

				<hr/>
				<h4>Cost by Host Size</h4>
				<DSTable columnNames={["Size", "Total Cost"]}>
					{sizeRows}
				</DSTable>

				<hr/>

				<h4>Usage</h4>
				<DSTable columnNames={["Host", "Ram", "Size", "Interval", "Hours", "Cost"]}>
					{usgRows}
				</DSTable>
			</div>
		);
	}

	private parseInterval(interval: string)
	{
		const split = interval.split("-");
		const begin = Number(split[0]);
		const end = Number(split[1]);

		return [begin, end];
	}

}