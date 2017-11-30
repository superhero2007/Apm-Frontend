import * as React from "react";
import * as PropTypes from "prop-types";
import * as _ from "lodash";
import {LoadableComponent} from "../widgets/loadableComponent";
import {Http} from "../http";
import {IAccountInfo} from "./accProfilePage";
import {accountStatus, AccountStatus} from "../accountStatus";
import {Button, ButtonToolbar, ControlLabel, Form, FormGroup, Grid} from "react-bootstrap";
import {RowCol} from "../widgets/rowCol";
import {AlertUtils} from "../alerts/AlertUtils";
import {DSTable} from "../widgets/dsTable";
import {humanizeInvoiceHostTime} from "./invoices";
import StripeCheckout from "react-stripe-checkout";
import {profile} from "../profile";
import {TextInput} from "../widgets/textInput";
import {PromiseButton} from "../widgets/promseButton";
import {ConfirmDlg} from "../widgets/confirmDlg";
import {UpgradeProButton} from "../widgets/upgradeProButton";
import {AmplitudeAnalytics} from "../analytics";
import {SizeBilling_CurrentUsage} from "./sizeBilling";

interface IUsageInfo {
	hours:number;
	host:string;
	begin:number;
	end:number;
}


interface IPricingPlan {
	billingCycle:string;
	billingUnit:string;
	pricePerHour:number;
	pricePerHourOverage:number;
}

interface IBill
{
	hours: number;
	cost: number;
	infoList: IUsageInfo[];
	jvmUsage;
}

interface IBillingData
{
	pricingPlan: IPricingPlan;
	invoiceBegin: number;
	invoiceEnd: number;
	bill: IBill;
}

enum BillingUnit {
	JVM,
	HOST
}

interface IProps
{

}

interface IState
{
	accInfo: IAccountInfo;
	editBilling: boolean;
}


export class BillingPage extends LoadableComponent<IProps, IState>
{
	componentWillMount(): any
	{
		AmplitudeAnalytics.track("Account - Billing");
		return super.componentWillMount();
	}


	protected getHttpRequests(props: IProps): JQueryXHR[]
	{
		return [Http.get("/accountinfo")];
	}

	protected initialState(): IState
	{
		return {accInfo: null, editBilling: false};
	}

	protected getStateFromPostResponse(responseData: any): IState
	{
		return {accInfo: responseData[0], editBilling: false};
	}

	private onUpdateCard()
	{
		this.reload();
	}

	private reload()
	{
		this.reloadData({})
	}

	private onEditBilling()
	{
		this.update_myStateProps({editBilling: true});
	}

	private onEditBillingDone()
	{
		this.update_myStateProps({editBilling: false});
	}

	private onEditBillingSubmitted()
	{
		this.onEditBillingDone();
		this.reload();
	}

	private onTryCancel()
	{
		var ref:ConfirmDlg = this.refs["cancelSubDlg"] as ConfirmDlg;
		ref.showDlg();
	}

	public doCancel()
	{
		Http.post("/billing/cancelSubscription").then((data)=> {
			Http.post("/accStatus").then((accData)=> {
				AccountStatus.read(accData);
				this.reload();
			})
		});
	}

	private renderSizePlan(sizeStr: string)
	{
		const plans = sizeStr.split(":");

		let rows = [];

		for (const plan of plans)
		{
			const split = plan.split("-");

			rows.push(<tr key={plan}>
				<td>{split[0]}</td>
				<td>{`${split[1]} cents per hour`}</td>
			</tr>);
		}

		return <DSTable columnNames={["Size","Price per Host"]}>
			{rows}
		</DSTable>;

	}
	protected renderContent(data: IState): any
	{

		const isAdmin = accountStatus.isAdmin;
		const accInfo = data.accInfo;

		if(!accInfo.isPro)
		{
			return (
				<Grid>
					<UpgradeProButton/>
				</Grid>
			);
		}


		let legacyBilling = !accInfo.billing.sizePlan;


		let curUsage;
		if(!legacyBilling)
		{
			curUsage =(
				<RowCol>
					<RowCol className="top2">
					<h4>Current Plan</h4>
						{this.renderSizePlan(accInfo.billing.sizePlan)}
					</RowCol>
					<h4>Usage for Current Billing Period</h4>
					<SizeBilling_CurrentUsage/>
				</RowCol>
			);
		}
		else {
			curUsage = <RowCol>
				<LegacyUsage/>
			</RowCol>;
		}

		if(!isAdmin)
		{
			return (
				<Grid>
					<DSTable>
						<tr>
							<td>Billing Email</td>
							<td>{accInfo.billing.billingEmail}</td>
						</tr>
						<tr>
							<td>Billing Address</td>
							<td>{_.isEmpty(accInfo.billing.address)?"(none)":accInfo.billing.address}</td>
						</tr>
						<tr>
							<td>VAT ID (if any)</td>
							<td>{_.isEmpty(accInfo.billing.vatId)?"(none)":accInfo.billing.vatId}</td>
						</tr>
					</DSTable>

					<RowCol className="top2">
						<h4>Contact your DripStat Account Administrator for more billing details</h4>
					</RowCol>
				</Grid>
			)
		}



		let billingInfo;

		if(data.editBilling)
		{
			billingInfo = (
				<div>
					<EditBillingInfo initialVat={accInfo.billing.vatId} initialAddr={accInfo.billing.address} onDone={this.onEditBillingSubmitted.bind(this)} onCancel={this.onEditBillingDone.bind(this)}/>
				</div>
			)

		}
		else
		{
			billingInfo = (
				<div>
					<DSTable>
						<tr>
							<td>VAT ID (if any)</td>
							<td>{_.isEmpty(accInfo.billing.vatId)?"(none)":accInfo.billing.vatId}</td>
						</tr>
						<tr>
							<td>Billing Address</td>
							<td>{_.isEmpty(accInfo.billing.address)?"(none)":accInfo.billing.address}</td>
						</tr>
					</DSTable>

					<Button onClick={this.onEditBilling.bind(this)}>Edit Billing Information</Button>
				</div>
			);
		}



		const card = accInfo.billing.card;

		let cardUI;
		if(card)
		{
			cardUI = (
				<div>
					<RowCol>
						<h4>Card Information</h4>
						<DSTable>
							<tr>
								<td>Billing Email</td>
								<td>{accInfo.billing.billingEmail}</td>
							</tr>
							<tr>
								<td>Card</td>
								<td>{`**** **** **** ${card.last4} (${card.brand})`}<br/>{`Expires: ${card.expMonth}/${card.expYear}`}</td>
							</tr>

						</DSTable>
						<EditStripeInfo onUpdated={this.onUpdateCard.bind(this)}/>
					</RowCol>
				</div>
			)
		}
		else
		{
			cardUI = (
			<div>
				<RowCol>
					<DSTable>
						<tr>
							<td>Billing Email</td>
							<td>{accInfo.billing.billingEmail}</td>
						</tr>
					</DSTable>
				</RowCol>
			</div>
			);
		}

		return (
			<Grid>

				{cardUI}


				<RowCol className="top2">
					<h4>Billing Information</h4>
					{billingInfo}
				</RowCol>

				<RowCol className="top2">
					<Button bsStyle="link" onClick={this.onTryCancel.bind(this)}>Cancel Subscription</Button>
					<ConfirmDlg ref="cancelSubDlg" onYes={this.doCancel.bind(this)}/>
				</RowCol>

				<RowCol className="top2">
					<h4>Invoices</h4>
					<b><a href="#/account/invoices">Previous Invoices</a></b>
				</RowCol>


				{curUsage}

			</Grid>
		);
	}



	static pricingPlanString(plan:IPricingPlan) {
		var str = "$"+plan.pricePerHour +" per Hour ";

		if(plan.billingUnit === BillingUnit[BillingUnit.HOST])
		{
			str+="per Host";
		}
		else if(plan.billingUnit === BillingUnit[BillingUnit.JVM])
		{
			str+="per JVM";
		}
		return str;
	}
}

class LegacyUsage extends LoadableComponent<{},{
	data: IBillingData;
}>
{
	protected initialState(): {data: IBillingData}
	{
		return {data: null};
	}


	protected getPostData(): any
	{
		return null;
	}

	protected getPostUrl(): string
	{
		return "/billing/currentUsage";
	}

	protected getStateFromPostResponse(responseData: any): {data: IBillingData}
	{
		return {data: responseData};
	}

	private invoiceTime(timeStampInSecs: number)
	{
		return AlertUtils.humanize_unixtime_custom(timeStampInSecs, "D MMM");
	}

	protected renderContent(data: {data: IBillingData}): any
	{
		const billing = data.data;

		return (
				<div>
					<RowCol>
						<h4>Current Plan</h4>
						<p>{BillingPage.pricingPlanString(billing.pricingPlan)}</p>
					</RowCol>
					<RowCol className="top2">
						<h4>{`Usage for Current Billing Period ${this.invoiceTime(billing.invoiceBegin)} - ${this.invoiceTime(billing.invoiceEnd)}`}</h4>
						<DSTable columnNames={["Total Hours Used", "Total Cost" ]}>
							<tr>
								<td>{billing.bill.hours}</td>
								<td>{"$"+billing.bill.cost}</td>
							</tr>
						</DSTable>
					</RowCol>

					<RowCol className="top2">
						<h4>Current Usage Details</h4>
						<DSTable columnNames={["Host", "Period", "Hours"]}>
							{billing.bill.infoList.map(usg => <tr key={`${usg.host}${usg.begin}`}>
									<td>{usg.host}</td>
									<td>{`${humanizeInvoiceHostTime(usg.begin)} - ${humanizeInvoiceHostTime(usg.end)}`}</td>
									<td>{usg.hours}</td>
								</tr>
							)}
						</DSTable>
					</RowCol>
				</div>
			);

	}

}
class EditStripeInfo extends React.Component<{
	onUpdated: ()=>void;
},{}>
{

	private onStripeToken(token)
	{
		Http.postJSON("/billing/updateStripeCard", token).then((data)=> {
			this.props.onUpdated();
		});
	}

	render()
	{
		const Checkout = StripeCheckout as any;
		return (
			<Checkout stripeKey={profile.stripeKey} name="DripStat" image = "https://dripstat.com/img/dsstripe.png"
			          description = "DripStat Pro Subscription" allowRememberMe = {false} panelLabel="Update Card Details" label="Edit Card Details" token={this.onStripeToken.bind(this)}/>
		);
	}
}

export class SubscribeProPage extends React.Component<{}, {}>
{
	static contextTypes:any = {
		router: PropTypes.any.isRequired
	};

	context:any;

	componentWillMount(): any
	{
		AmplitudeAnalytics.track("Upgrade Account");
	}

	private onStripeToken(token)
	{
		Http.postJSON("/billing/stripeCard?unit=HOST", token).then((data)=> {
			Http.post("/accStatus").then((accData)=> {
				AccountStatus.read(accData);
				this.context.router.replace(`/account/billing`);
			});
		});
	}

	render()
	{
		const Checkout = StripeCheckout as any;

		return (
			<Grid>
				<h2>Subscribe to DripStat Pro</h2>

				<h4>Monthly Billing Plan</h4>
				<DSTable columnNames={["Host Size", "Price per host"]}>
					<tr>
						<td>Small - Upto 5GB Ram</td>
						<td>$0.06 per hour (~ $40 per month)</td>
					</tr>
					<tr>
						<td>Medium - Upto 10GB Ram</td>
						<td>$0.11 per hour (~ $80 per month)</td>
					</tr>
					<tr>
						<td>Large - Over 10GB Ram</td>
						<td>$0.17 per hour (~ $120 per month)</td>
					</tr>
				</DSTable>
				<Checkout stripeKey={profile.stripeKey} name="DripStat" image = "https://dripstat.com/img/dsstripe.png"
				                description = "DripStat Pro Subscription" allowRememberMe = {false} panelLabel="Subscribe" label="Subscribe" token={this.onStripeToken.bind(this)}/>


				<RowCol className="top2">
					<h4>Want to buy Annual?</h4>
					<p><b><a href="mailto:support@dripstat.com">Contact us</a></b></p>
				</RowCol>

			</Grid>
		)
	}
}

class EditBillingInfo extends React.Component<{
	initialVat: string;
	initialAddr: string;

	onCancel(): ()=>void;
	onDone(): ()=> void;
}, {
}>
{
	private onSubmitBegin()
	{
		const vat = (this.refs["vat"] as TextInput).getValue();
		const addr = (this.refs["addr"] as TextInput).getValue();

		return Promise.all([Http.post("/editAccount/billingAddress",{billingAddress: addr}),
								Http.post("/editAccount/vat", {vatid: vat})]);
	}

	private onErr(err)
	{
		const msg = err.responseJSON; //TODO display in UI
		console.log(msg);
		this.props.onDone();
	}

	private onSubmitDone()
	{
		this.props.onDone();
	}

	render()
	{
		return (
			<div>
				<RowCol>
					<Form horizontal>
						<FormGroup>
							<ControlLabel>VAT ID (if any)</ControlLabel>
							<TextInput initialValue={this.props.initialVat} ref="vat"/>
						</FormGroup>
						<FormGroup>
							<ControlLabel>Billing Address</ControlLabel>
							<TextInput initialValue={this.props.initialAddr} multiline={true} ref="addr"/>
						</FormGroup>
					</Form>
				</RowCol>

				<RowCol className="top1">
					<ButtonToolbar>
						<Button onClick={this.props.onCancel.bind(this)}>Cancel</Button>
						<PromiseButton text="Update" onPromiseErr={this.onErr.bind(this)}
						               promiseCreator={this.onSubmitBegin.bind(this)} onPromiseDone={this.onSubmitDone.bind(this)}/>
					</ButtonToolbar>
				</RowCol>

			</div>
		);
	}
}