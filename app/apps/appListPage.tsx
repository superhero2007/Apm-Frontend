import * as React from "react";
import * as _ from "lodash";
import {RoutableLoadableComponent} from "../widgets/routableLoadableComponent";
import {AppList} from "./appList";
import {DSTable} from "../widgets/dsTable";
import {IViolation, ViolationUtils, ViolationsListPage} from "../alerts/policies/detail/violationsListPage";
import {Row, Col} from "react-bootstrap";
import {IMtc} from "../alerts/mtc/mtcListPage";
import "../alerts/policies/detail/violations.css";
import {RowCol} from "../widgets/rowCol";
import {Link} from "react-router";
import {Http} from "../http";
import {accountStatus} from "../accountStatus";
import {BillingIssue} from "../widgets/billingIssue";
import {AccHostInfo} from "./accInfo";

export interface ITag
{
	id: number;
	appId: string;
	tag: string;
}
export interface IAppInfo
{
	id:any;
	label:string;
	isOnline:boolean;
	name:string;
	violationSeverity:string;
	hasMtc:boolean;
	throughput:number;
	responseTime:number;
	errorRate:number;
}
interface IAppListDetail
{
	appDataList:IAppInfo[];
	violations:IViolation[];
	mtcs:IMtc[];
}

interface IMtcProps
{
	mtcs: IMtc[];
}
const MtcList:React.StatelessComponent<IMtcProps> = ({mtcs}: IMtcProps) => {

	if(mtcs.length > 0)
	{
		return (
			<div>
				<h4>Under Maintenance</h4>
				<DSTable noHead={true} noBorder={true} noStripe={true} >
					{mtcs.map(m => <tr key={m.id.appId} className="mtcRow">
						<td>{m.id.appId}</td>
					</tr>)}
				</DSTable>
			</div>
		);
	}
	return null;
};

interface IVProps
{
	violations: IViolation[]
}
export const InlineViolationsList:React.StatelessComponent<IVProps> = ({violations}:IVProps) =>  {
	if(violations.length > 0 )
	{
		return (
			<div>
				<h4>Active Violations</h4>
				<DSTable noHead={true} noBorder={true} noStripe={true} classes="violationsTable">
					{violations.map(v => <tr key={v.id} className={ViolationsListPage.violationRowClassPure(v)}>
						<td>{v.appName}</td>
						<td>{ViolationUtils.conditionDisplayStr(v)}</td>
						<td>{v.severity}</td>
					</tr>)}
				</DSTable>
			</div>
		);
	}
	return null;
};

interface IState
{
	tags:ITag[];
}

export class AppListPage extends RoutableLoadableComponent<{},IState>
{
	private appListDetail:IAppListDetail = null;

	protected initialState():IState
	{
		return {tags: []};
	}

	protected getStateFromPostResponse(reponseData:any):IState
	{
		this.appListDetail = reponseData[0];
		return {tags: reponseData[1]};
	}


	protected getHttpRequests(props:{}) :JQueryXHR[]
	{
		return [Http.post("/listapps"), Http.post("/tags/list")];
	}

	private renderNoApps()
	{
		const style = {
			"marginTop": "200px",
			"fontSize": "40px"
		};

		return (
			<div>
				<RowCol>
					<div className="text-center">
						<Link to="/addjvm" className="btn btn-success btn-lg" style={style}>Add New JVM <i className="fa fa-arrow-circle-right"/></Link>
					</div>
				</RowCol>
			</div>
		);
	}

	private onTagAdd(newTag:ITag)
	{
		const tags = this.getMyState().tags;
		tags.push(newTag);
		this.update_myStateProps({tags: tags});
	}

	private onTagRemove(oldTag:ITag)
	{
		const tags = this.getMyState().tags;
		_.remove(tags, {id: oldTag.id});
		this.update_myStateProps({tags: tags});
	}

	protected renderContent(data:IState):any
	{
		if(accountStatus.hasBillingIssue())
		{
			return <BillingIssue/>;
		}

		if(this.appListDetail.appDataList.length == 0)
		{
			return this.renderNoApps();
		}
		return (
			<div>
				<Row>
					<Col xs={9}>
						<AppList appDataList={this.appListDetail.appDataList} tags={data.tags} onTagAdd={this.onTagAdd.bind(this)} onTagRemove={this.onTagRemove.bind(this)}/>
					</Col>
					<Col xs={3}>
						<InlineViolationsList violations={this.appListDetail.violations}/>
						<MtcList mtcs={this.appListDetail.mtcs}/>
					</Col>
				</Row>
				<RowCol xs={3} className="bottom2">
					<Link to="/addjvm" className="btn btn-success">Add New JVM</Link>
				</RowCol>
			</div>
		);
	}

}