import * as React from "react";
import {LoadableComponent} from "./../../../widgets/loadableComponent";
import {Link} from "react-router";
import {LiA} from "./../../../widgets/liA";
import {getRouteParam} from "../../../utils";
import {connect} from "react-redux";
import {IStore} from "../../../reduxSetup";
import {action_updateCurrentProfileName} from "../../../reducers/policyReducer";


export function policyDetail_extractPolicyId(props)
{
	const policyId = getRouteParam(props,"policyId");
	return {policyId: policyId};
}

class PolicyDetailPage_connect extends LoadableComponent<{children:any, dispatch?:any, policyName?:string},{}>
{
	protected initialState():{}
	{
		return {};
	}

	protected getPostUrl():string
	{
		return "/alert/policy/name";
	}

	protected getPostData():any
	{
		return policyDetail_extractPolicyId(this.props);
	}

	protected getStateFromPostResponse(reponseData:any):{}
	{
		let name = reponseData;
		this.props.dispatch(action_updateCurrentProfileName(name));
		return {policyName: reponseData};
	}

	protected renderContent(data:{}):any
	{
		const style = {
			settings: {
				verticalAlign:"-1px"
			}
		};
		const policyId = policyDetail_extractPolicyId(this.props).policyId;

		let navbar = (<nav className="navbar navbar-default navbar-static-top row navbarStickTop">
			<div className="container-fluid">
				<div className="navbar-header">
					<Link className="navbar-brand" to={`/alerts/policies`}>{this.props.policyName}</Link>
				</div>

				<div className="navbar-collapse">
					<ul className="nav navbar-nav">
						<LiA linkText="Incidents" path ={`/policy/${policyId}/incidents`}/>
						<LiA linkText="Violations" path ={`/policy/${policyId}/violations`}/>
						<LiA linkText="Conditions" path ={`/policy/${policyId}/conditions`}/>
						<LiA linkText="Notification Settings" path ={`/policy/${policyId}/notifications`}/>
					</ul>
					<ul className="nav navbar-nav navbar-right">
						<LiA linkText=" Settings" path ={`/policy/${policyId}/settings`}>
							<span className="glyphicon glyphicon-cog" style={style.settings}> </span>
						</LiA>
					</ul>
				</div>
			</div>
		</nav>);


		return ( <div>
				{navbar}
				{this.props.children}
			</div>
		);
	}
}

export const PolicyDetailPage = connect((state:IStore)=> {
	return state.policyDetail;
})(PolicyDetailPage_connect);