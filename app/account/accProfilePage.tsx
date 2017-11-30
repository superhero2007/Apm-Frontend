import * as React from "react";
import {LoadableComponent} from "../widgets/loadableComponent";
import {Http} from "../http";
import {DSTable} from "../widgets/dsTable";
import {RowCol} from "../widgets/rowCol";
import {Grid} from "react-bootstrap";
import {PromiseButton} from "../widgets/promseButton";
import {InlineInputEditor} from "../widgets/inlineEditor";
import {accountStatus} from "../accountStatus";
import {AlertUtils} from "../alerts/AlertUtils";
import {AmplitudeAnalytics} from "../analytics";
import {UpgradeProButton} from "../widgets/upgradeProButton";
import {URL_JAVA_AGENT_BASE, URL_JAVA_AGENT_LATEST} from "../urlConstants";

interface ICreditCard
{
	last4: string;
	brand: string;
	expMonth: number;
	expYear: number;
}

export interface IAccountBilling
{
	billingEmail: string;
	card:ICreditCard;
	pricingPlan;
	sizePlan: string;
	vatId: string;
	address: string;
}

export interface IAccountInfo
{
	email: string;
	fullName: string;
	company: string;

	licenseKey: string;
	apiKey: string;

	currentAgentVersion: string;

	isPro: boolean;
	hasTrial: boolean;

	trialEnd: number;
	billing: IAccountBilling;
}

interface IProps
{

}

interface IState
{
	accInfo: IAccountInfo;

	resetDone: boolean;

	companyUpdating: boolean;
	nameUpdating: boolean;
}

export class AccountProfilePage extends LoadableComponent<IProps, IState>
{

	componentWillMount(): any
	{
		AmplitudeAnalytics.track("Account - Profile");
		return super.componentWillMount();
	}

	protected initialState(): IState
	{
		return {accInfo: null, resetDone: false, companyUpdating: false, nameUpdating: false};
	}

	protected getHttpRequests(props: IProps): JQueryXHR[]
	{
		return [Http.get("/accountinfo")];
	}

	protected getStateFromPostResponse(responseData: any): IState
	{
		return {accInfo: responseData[0], resetDone: false, companyUpdating: false, nameUpdating: false};
	}

	private doPasswordRest()
	{
		return Http.post("/resetpassword");
	}

	private onResetDone()
	{
		this.update_myStateProps({resetDone: true})
	}

	private onCompanyChange(value: string)
	{
		this.update_myStateProps({companyUpdating: true});
		Http.post("/editAccount/company", {company: value}).then(()=> {

			const accInfo = this.getMyState().accInfo;
			const newAccInfo = Object.assign({}, accInfo, { company: value});
			this.update_myStateProps({companyUpdating: false, accInfo: newAccInfo});
		});
	}

	private onNameChange(value: string)
	{
		this.update_myStateProps({nameUpdating: true});

		const name = this.extractName(value);

		Http.post("/editAccount/name", {firstName: name.fname, lastName: name.lname}).then(()=> {

			const accInfo = this.getMyState().accInfo;
			const newAccInfo = Object.assign({}, accInfo, { fullName: value});
			this.update_myStateProps({nameUpdating: false, accInfo: newAccInfo});
		});
	}

	private validateCompany(value: string)
	{
		return this.validateLength(value);
	}

	private validateName(value: string)
	{
		if (this.validateLength(value))
		{
			const name = this.extractName(value);

			if (name.fname.length > 0 && name.lname.length > 0)
				return true;
		}
		return false;
	}

	private validateLength(value: string)
	{
		return value.length > 0 && value.length < 120;
	}

	private extractName(fullName: string)
	{
		const split = fullName.split(' ');

		const firstName = split.slice(0, -1).join(' ');
		const lastName = split.slice(-1).join(' ');

		return {
			fname: firstName,
			lname: lastName
		};
	}

	protected renderContent(data: IState): any
	{
		const accInfo = data.accInfo;

		const isAdmin = accountStatus.isAdmin;

		const licenseKey = accountStatus.isDemoUser ? "<Hidden for Demo User>" : accInfo.licenseKey;
		const restApiKey = accountStatus.isDemoUser ? "<Hidden for Demo User>" : accInfo.apiKey;

		let subscriptionType;

		if (accInfo.isPro)
			subscriptionType = "Pro";
		else if (accInfo.hasTrial)
			subscriptionType = `Pro Trial - Till ${AlertUtils.humanize_unixtime_dateonly(accInfo.trialEnd/1000)}`;
		else
			subscriptionType = "Lite";
		return (
			<div>
				<Grid>
					<h4>Profile</h4>
					<DSTable>
						<tr>
							<td>
								Email
							</td>
							<td>
								{accInfo.email}
							</td>
						</tr>
						<tr>
							<td>
								Full Name
							</td>
							<td>
								<InlineInputEditor value={accInfo.fullName} loading={data.nameUpdating} validate={this.validateName.bind(this)} onChange={this.onNameChange.bind(this)}/>
							</td>
						</tr>
						<tr>
							<td>
								Company
							</td>
							<td>
								{
									isAdmin?
										(<InlineInputEditor value={accInfo.company} loading={data.companyUpdating} validate={this.validateCompany.bind(this)} onChange={this.onCompanyChange.bind(this)}/>)
										: <span>{accInfo.company}</span>
								}
							</td>
						</tr>
						<tr>
							<td>Password</td>
							<td>
								{
									data.resetDone ?
										(<div><i>Password Reset Email sent</i></div>) :
										(<PromiseButton text="Reset Password" promiseCreator={this.doPasswordRest.bind(this)} onPromiseDone={this.onResetDone.bind(this)}/>)
								}
							</td>
						</tr>
					</DSTable>

					<RowCol>
						<h4>Account</h4>
						<DSTable>
							<tr>
								<td>Account Type</td>
								<td>{subscriptionType}</td>
							</tr>
						</DSTable>

						{
							!accInfo.isPro? <UpgradeProButton/>: null
						}
					</RowCol>

					<RowCol className="top1">
						<RowCol>
							<h4>DripStat Agent</h4>
						</RowCol>
						<RowCol>
							<DSTable>
								<tr>
									<td>License Key</td>
									<td>{licenseKey}</td>
								</tr>
								<tr>
									<td>Agent Version</td>
									<td>{accInfo.currentAgentVersion}</td>
								</tr>
								<tr>
									<td>{'Download URL (Version-Agnostic)'}</td>
									<td>{URL_JAVA_AGENT_LATEST}</td>
								</tr>
								<tr>
									<td>{'Download URL (Version-Specific)'}</td>
									<td>{`${URL_JAVA_AGENT_BASE}/dripstat_agent-${accInfo.currentAgentVersion}.zip`}</td>
								</tr>
							</DSTable>
						</RowCol>
						<RowCol>
							<a href="https://dripstat.com/dl/dripstat_agent-latest.zip" className="btn btn-primary">{`Download Agent v${accInfo.currentAgentVersion}`}</a>
						</RowCol>

						<RowCol className={"top2"}>
							<h5>Related Links</h5>
							<ul>
								<li><a href="https://chronon.atlassian.net/wiki/display/DRIP/Changelog" target="_blank">Agent Changelog</a></li>
								<li><a href="https://chronon.atlassian.net/wiki/display/DRIP/DripStat+Agent+API" target="_blank">Agent API</a></li>
								<li><a href="https://chronon.atlassian.net/wiki/display/DRIP/Upgrading+DripStat+Agent" target="_blank">Upgrading DripStat Agent</a></li>
							</ul>
						</RowCol>
					</RowCol>

					<RowCol className={"top2"}>
						<h4>REST API</h4>

						<DSTable>
							<tr>
								<td>API Key</td>
								<td>{restApiKey}</td>
							</tr>
						</DSTable>

						<p><b><a href="https://chronon.atlassian.net/wiki/display/DRIP/DripStat+REST+API" target="_blank">REST API Documentation</a></b></p>
					</RowCol>
				</Grid>
			</div>
		);
	}

}