import * as React from "react";
import * as _ from "lodash";
import {LoadableComponent} from "../widgets/loadableComponent";
import {DSTable} from "../widgets/dsTable";
import {roundToTwo, Units} from "../es/metricUtils";
import {AlertUtils} from "../alerts/AlertUtils";
import {RoutableLoadableComponent} from "../widgets/routableLoadableComponent";
import {getRouteParam} from "../utils";
import {RowCol} from "../widgets/rowCol";
import {Grid} from "react-bootstrap";
import "./invoice.css";
import {ITotalBill} from "./sizeBilling";

interface IPersistableTotalBill {
	totalCostCents: number;
	perSizeCost: any;
	perHostBill: IPersistableHostBill[];
}

interface IPersistableHostBill {
	host: IPersistableHostInfo;
	size: string;
	totalCostCents: number;
	usagesWithCost: IPersistableUsage[];
}

interface IPersistableHostInfo {
	name: string;
	cores: number;
	ram: number;
}

interface IPersistableUsage {
	beginTime: number; // in millis
	endTime: number;  // in millis
	hours: number;
	costCents: number;
}

interface IInvoiceInfo
{
	periodBegin: number;
	periodEnd: number;
	hours: number;
	ratePerHour: string;

	stripeInvoiceId: string;

	billingAddress: string;
	company: string;
	vatId: string;

	totalBill: IPersistableTotalBill;
}

interface IProps
{

}

interface IState
{
	invoices: IInvoiceInfo[];
}


export class InvoiceListPage extends LoadableComponent<IProps, IState>
{
	protected initialState(): IState
	{
		return {invoices: []};
	}


	protected getPostUrl(): string
	{
		return "/billing/prevInvoices";
	}

	protected getStateFromPostResponse(responseData: any): IState
	{
		return {invoices: responseData.invoices};
	}

	protected renderContent(data: IState): any
	{
		const invoices = data.invoices;
		if(!invoices)
			return <h2>No Invoices</h2>;
		return (
			<div>
				<DSTable columnNames={["Begin","End","Total"]}>
					{invoices.map((inv) => <tr key={inv.periodBegin}>
						<td>{humanizeInvoiceTime(inv.periodBegin)}</td>
						<td>{humanizeInvoiceTime(inv.periodEnd)}</td>
						<td>{"$"+calcInvTotal(inv)}</td>
						<td><a href={`#/account/invoicedetails/${inv.periodEnd}`}>Usage Details</a></td>
						<td><a href={`#/account/invoiceview/${inv.periodEnd}`}>View Invoice</a></td>
				</tr>)}
				</DSTable>
			</div>
		);
	}
}

export function humanizeInvoiceTime(timestamp: number)
{
	return AlertUtils.humanize_unixtime_custom(timestamp/1000, "MMM DD YYYY")
}

export function humanizeInvoiceHostTime(timestamp: number)
{
	return AlertUtils.humanize_unixtime_custom(timestamp/1000, "HH:mm DD MMM")
}
function calcInvTotal(inv: IInvoiceInfo)
{
	if(inv.totalBill)
	{
		return inv.totalBill.totalCostCents/100;
	}

	return roundToTwo(inv.hours * parseFloat(inv.ratePerHour));
}

interface IUsage
{
	host:string;
	hours: number;
	begin: number;
	end: number;
}

interface IInvUsageData extends IInvoiceInfo
{
	usages: IUsage[];
}

interface IInvoiceUsageDetailsState
{
	invData: IInvUsageData;
}

interface IInvoiceUsageDetailsProps
{
}

export class InvoiceUsageDetailsPage extends RoutableLoadableComponent<IInvoiceUsageDetailsProps, IInvoiceUsageDetailsState>
{

	protected getPostData(): any
	{
		const periodEnd = getRouteParam(this.props, "periodEnd");
		return {periodEnd: periodEnd};
	}

	protected getPostUrl(): string
	{
		return "/billing/prevInvoiceDetails";
	}

	protected initialState(): IInvoiceUsageDetailsState
	{
		return {invData: null};
	}

	protected getStateFromPostResponse(responseData: any): IInvoiceUsageDetailsState
	{
		return {invData: responseData.invoices[0]};
	}

	protected renderContent(data: IInvoiceUsageDetailsState): any
	{
		const inv = data.invData;
		if(inv.totalBill) {

			let sizeCostRows = [];

			for(const size in inv.totalBill.perSizeCost) {
				sizeCostRows.push((<tr>
					<td>{size}</td>
					<td>{`$${inv.totalBill.perSizeCost[size]/100}`}</td>
				</tr>));
			}

			let usageRows = [];


			for(const hostBill of inv.totalBill.perHostBill)
			{
				for(const usg of hostBill.usagesWithCost)
				{
					const row = (
						<tr>
							<td>{hostBill.host.name}</td>
							<td>{roundToTwo(hostBill.host.ram/Units.GB) +" GB" }</td>
							<td>{hostBill.size}</td>
							<td>{`${humanizeInvoiceHostTime(usg.beginTime)} - ${humanizeInvoiceHostTime(usg.endTime)}`}</td>
							<td>{`$${usg.costCents/100}`}</td>
						</tr>
					);

					usageRows.push(row);
				}
			}

			return (
				<div>
					<h3>{`Invoice Details ${humanizeInvoiceTime(inv.periodBegin)} - ${humanizeInvoiceTime(inv.periodEnd)}`}</h3>
					<h4>{`Total Cost: $${calcInvTotal(inv)}`}</h4>

					<hr/>
					<h4>Cost by Host Size</h4>
					<DSTable columnNames={["Host Size","Total Cost"]}>
						{sizeCostRows}
					</DSTable>

					<hr/>

					<h4>Usage</h4>

					<DSTable columnNames={["Host","Ram","Size","Period","Cost"]}>
						{usageRows}
					</DSTable>
				</div>
			);
		}
		return (
			<div>
				<h3>{`Invoice Details ${humanizeInvoiceTime(inv.periodBegin)} - ${humanizeInvoiceTime(inv.periodEnd)}`}</h3>

				<DSTable columnNames={["Total JVM hours used", "Total Cost"]}>
					<tr>
						<td>{inv.hours}</td>
						<td>{`$${calcInvTotal(inv)}`}</td>
					</tr>
				</DSTable>

				<RowCol className="top2">
					<h4>Usage Details</h4>
				</RowCol>

				<DSTable columnNames={["Host", "Period", "Hours"]}>
					{inv.usages.map(u => <tr key={`${u.host}${u.begin}`}>
						<td>{u.host}</td>
						<td>{humanizeInvoiceHostTime(u.begin) + " - "+humanizeInvoiceHostTime(u.end)}</td>
						<td>{u.hours}</td>
					</tr>)}
				</DSTable>
			</div>
		);
	}
}

interface IInvoiceViewProps
{

}

interface IInvoiceViewState
{
	invData: IInvUsageData;
}

export class InvoiceView extends LoadableComponent<IInvoiceViewProps, IInvoiceViewState>
{
	protected getPostData(): any
	{
		const periodEnd = getRouteParam(this.props, "periodEnd");
		return {periodEnd: periodEnd};
	}

	protected getPostUrl(): string
	{
		return "/billing/prevInvoiceDetails";
	}

	protected initialState(): IInvoiceUsageDetailsState
	{
		return {invData: null};
	}

	protected getStateFromPostResponse(responseData: any): IInvoiceUsageDetailsState
	{
		return {invData: responseData.invoices[0]};
	}

	private invId(inv:IInvoiceInfo)
	{
		if(inv.stripeInvoiceId)
			return inv.stripeInvoiceId.toUpperCase();
		return "";
	}

	protected renderContent(data: IInvoiceViewState): any
	{
		const inv = data.invData;

		let recptAddr =[];

		if(!_.isEmpty(inv.company))
			recptAddr.push(<span key={"recptcompany"}>{inv.company}<br/></span>);

		if(!_.isEmpty(inv.billingAddress))
			recptAddr.push(<span key={"recptaddress"}>{inv.billingAddress}<br/></span>);

		if(!_.isEmpty(inv.vatId))
			recptAddr.push(<span key={"recptvatid"}>{"VAT ID: "+inv.vatId}<br/></span>);


		let lineItem;
		if(!inv.totalBill) {
			lineItem = `Dripstat Usage: ${inv.hours} hours from ${humanizeInvoiceTime(inv.periodBegin)} to ${humanizeInvoiceTime(inv.periodEnd)}`;
		}
		else  {
			lineItem = `Dripstat Usage: From ${humanizeInvoiceTime(inv.periodBegin)} to ${humanizeInvoiceTime(inv.periodEnd)}`;
		}

		return (
			<div>
				<Grid>
					<div className="invoice-box">
						<table cellPadding="0" cellSpacing="0">
							<tbody>
								<tr className="top">
									<td colSpan={2}>
										<table>
											<tbody>
												<tr>
													<td className="title"><img src="https://dripstat.com/img/logo-square-with-text.png" /></td>
													<td>{"Invoice #: " + this.invId(inv)}<br/>{humanizeInvoiceTime(inv.periodEnd)}</td>
												</tr>
											</tbody>
										</table>
									</td>
								</tr>

								<tr className="information">
									<td colSpan={2}>
										<table>
											<tbody>
												<tr>
													<td>Chronon Systems Inc.<br/>1900 South Norfolk St Suite 350<br/>San Mateo CA 94403<br/>USA</td>
													<td>{recptAddr}</td>
												</tr>
											</tbody>
										</table>
									</td>
								</tr>

								<tr className="heading">
									<td>Item</td>
									<td>Price</td>
								</tr>

								<tr className="item last">
									<td>{lineItem}</td>
									<td> {`$${calcInvTotal(inv)}`}</td>
								</tr>
								<tr className="total">
									<td>{""}</td>
									<td> {`Total: $${calcInvTotal(inv)}`}</td>
								</tr>


							</tbody>
						</table>
					</div>
				</Grid>
			</div>
		);
	}

}