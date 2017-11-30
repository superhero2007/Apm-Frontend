import * as React from "react";
import * as PropTypes from "prop-types";
import * as _ from "lodash";
import {EditableTextField} from "../../../widgets/editableTextField";
import {policyDetail_extractPolicyId} from "./policyDetailPage";
import {Button, Row} from "react-bootstrap";
import {ConfirmDlg} from "../../../widgets/confirmDlg";
import {Http} from "../../../http";
import {connect} from "react-redux";
import {action_updateCurrentProfileName} from "../../../reducers/policyReducer";
import {IStore} from "../../../reduxSetup";
import {Permission, PermissionManager} from "../../../roles";

interface IState
{
}

class PolicySettingsPage_connect extends React.Component<{dispatch?:any, policyName?:string},IState>
{
	static contextTypes:any = {
		router: PropTypes.any.isRequired
	};

	context:any;

	onDeleteClick()
	{
		const ref:any = this.refs["mydlg"];
		ref.showDlg();
	}

	onConfirmDelete()
	{
		Http.post("/alert/policy/delete", {policyId: policyDetail_extractPolicyId(this.props).policyId}).then(()=>
		{
			this.context.router.push(`/alerts/policies`);
		});
	}

	onConfirmUpdate(name, value)
	{
		let x= value.trim();
		if(!_.isEmpty(x) && !(value ===this.props.policyName))
		{
			Http.post("/alert/policy/updateName",{policyId: policyDetail_extractPolicyId(this.props).policyId, newName:x}).then(()=>{
				this.props.dispatch(action_updateCurrentProfileName(x));
			});
		}
	}

	render()
	{
		const bottomRowStyle = {
			marginTop: "2em"
		};

		if(!PermissionManager.permissionAvailable(Permission.ALERT_POLICY_EDIT))
		{
			return <div className="container">
				<h3>Cannot modify settings at currrent user role</h3>
			</div>;
		}
		return (<div className="container">
			<Row>
				<h5>Policy Name:</h5>
			</Row>
			<Row>
				<EditableTextField value={this.props.policyName} name='name' popupId="myid" onUpdate={this.onConfirmUpdate.bind(this)}/>
			</Row>
			<Row style={bottomRowStyle}>
				<Button bsStyle="danger" onClick={this.onDeleteClick.bind(this)}>Delete Policy</Button>
			</Row>
			<ConfirmDlg ref="mydlg" onYes={this.onConfirmDelete.bind(this)}/>
		</div>);
	}

}

export const PolicySettingsPage = connect((state:IStore)=> {
	return state.policyDetail;
})(PolicySettingsPage_connect);