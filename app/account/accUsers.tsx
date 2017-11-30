import * as React from "react";
import {LoadableComponent} from "../widgets/loadableComponent";
import {AmplitudeAnalytics} from "../analytics";
import {DSTable} from "../widgets/dsTable";
import {Grid, Button, FormGroup, Form, FormControl, ControlLabel, ButtonToolbar, Col} from "react-bootstrap";
import {UserRole} from "../roles";
import {RowCol} from "../widgets/rowCol";
import {TextInput} from "../widgets/textInput";
import {Http} from "../http";
import {PromiseButton} from "../widgets/promseButton";
import {accountStatus} from "../accountStatus";

interface IUser
{
	fName: string;
	lastName: string;
	email: string;

	admin: boolean;
	confirmed: boolean;
	isCurrent: boolean;

	role: string;
}

interface IProps
{

}

interface IState
{
	users: IUser[];
	addingUser: boolean;
	addUserErr: string;

	addUserRole: string;

	editUser: IUser;
	editUserRole: string;
}


export class AccountUsersPage extends LoadableComponent<IProps, IState>
{
	componentWillMount(): any
	{
		AmplitudeAnalytics.track("Account - Users");
		return super.componentWillMount();
	}


	protected getPostData(): any
	{
		return {};
	}

	protected getPostUrl(): string
	{
		return "/users/list";
	}

	protected initialState(): IState
	{
		return {users: [], addingUser: false, addUserErr: null, addUserRole: UserRole[UserRole.NORMAL], editUser: null, editUserRole: null};
	}

	protected getStateFromPostResponse(responseData: any): IState
	{
		return {users: responseData, addingUser: false, addUserErr: null, addUserRole: UserRole[UserRole.NORMAL], editUser: null, editUserRole: null};
	}

	private roleDisplay(role: UserRole)
	{
		switch (role)
		{
			case UserRole.ADMIN:
				return "Administrator";
			case UserRole.NORMAL:
				return "Standard";
			case UserRole.READONLY:
				return "Limited Access";
		}

		console.log("Unknown role ", role);
	}

	private doRemoveUser(user:IUser)
	{
		return Http.post("/users/delete",{email: user.email});
	}

	private onRemoveUserDone()
	{
		this.reloadUserlist();

	}

	private onAddUser()
	{
		this.update_myStateProps({addingUser: true});
	}

	private onCancelAddUser()
	{
		this.update_myStateProps({addingUser: false});
	}

	private onAddUserSubmit()
	{
		const fname = (this.refs["fname"] as TextInput).getValue();
		const lname = (this.refs["lname"] as TextInput).getValue();
		const email = (this.refs["email"] as TextInput).getValue();

		if(!this.validateLength(fname) || !this.validateLength(lname) || !this.validateLength(email))
		{
			this.update_myStateProps({addUserErr: "Invalid values"});
			return null;
		}
		return Http.post("/users/add2", {fName: fname, lName: lname, email: email, role: this.getMyState().addUserRole});
	}

	private onSubmitDone(data)
	{
		this.update_myStateProps(this.resetAddUserProps());
		this.reloadUserlist();
	}

	private resetAddUserProps()
	{
		return {addUserErr: null, addUserRole: UserRole[UserRole.NORMAL], addingUser: false};
	}

	private reloadUserlist()
	{
		Http.post(this.getPostUrl()).then((data) =>
		{
			this.update_myStateProps({users: data});
		});
	}

	private onAddSubmitFailed(err)
	{
		this.update_myStateProps({addUserErr: err.responseJSON});
	}

	private validateLength(value: string)
	{
		if(!value)
			return null;

		return value.length > 0 && value.length < 100;
	}

	private onAddUserRoleChange(e)
	{
		this.update_myStateProps({addUserRole: e.target.value});
	}

	private onEditUserRoleChange(e)
	{
		this.update_myStateProps({editUserRole: e.target.value});
	}

	private renderEditUser(user:IUser, role: string)
	{
		return (
			<Grid>
				<RowCol>
					<Col xs={4}>
						{`${user.fName} ${user.lastName}`}
					</Col>
					<Col xs={6}>
						{user.email}
					</Col>
				</RowCol>

				<RowCol className="top2">
					<FormGroup>
						<ControlLabel>Role</ControlLabel>
						<FormControl componentClass="select" placeholder="Role" value={role} onChange={this.onEditUserRoleChange.bind(this)}>
							<option value={UserRole[UserRole.NORMAL]}>{this.roleDisplay(UserRole.NORMAL)}</option>
							<option value={UserRole[UserRole.ADMIN]}>{this.roleDisplay(UserRole.ADMIN)}</option>
							<option value={UserRole[UserRole.READONLY]}>{this.roleDisplay(UserRole.READONLY)}</option>
						</FormControl>
					</FormGroup>
				</RowCol>

				<RowCol className="top2">
					<ButtonToolbar>
						<Button onClick={this.onEditUserCancel.bind(this)}>Cancel</Button>
						<PromiseButton text="Change Role" promiseCreator={this.submitEditUser.bind(this)} onPromiseDone={this.onEditUserSuccess.bind(this)} />
					</ButtonToolbar>
				</RowCol>
			</Grid>
		);
	}

	private onEditUser(u: IUser)
	{
		const props = this.resetAddUserProps() as any;
		props.editUserRole =  u.role;
		props.editUser =  u;

		this.update_myStateProps(props);
	}

	private submitEditUser()
	{
		const state = this.getMyState();
		return Http.post("/users/changerole",{userEmail: state.editUser.email, role: state.editUserRole});
	}

	private onEditUserSuccess()
	{
		this.onEditUserDone();
		this.reloadUserlist();
	}

	private onEditUserCancel()
	{
		this.onEditUserDone();
	}

	private onEditUserDone()
	{
		this.update_myStateProps({editUserRole: null, editUser: null});
	}

	protected renderContent(data: IState): any
	{
		if(data.editUser)
			return this.renderEditUser(data.editUser, data.editUserRole);

		const isAdmin = accountStatus.isAdmin;

		let addUser;

		if (data.addingUser)
		{
			addUser = (
				<div>
					<RowCol>
						<Form horizontal>
							<FormGroup>
								<ControlLabel>First Name</ControlLabel>
								<TextInput placeholder="FirstName" ref="fname"/>
							</FormGroup>
							<FormGroup>
								<ControlLabel>Last Name</ControlLabel>
								<TextInput placeholder="Last Name" ref="lname"/>
							</FormGroup>
							<FormGroup>
								<ControlLabel>Email</ControlLabel>
								<TextInput placeholder="Email" ref="email"/>
							</FormGroup>
							<FormGroup>
								<ControlLabel>Role</ControlLabel>
								<FormControl componentClass="select" placeholder="Role" value={data.addUserRole} onChange={this.onAddUserRoleChange.bind(this)}>
									<option value={UserRole[UserRole.NORMAL]}>{this.roleDisplay(UserRole.NORMAL)}</option>
									<option value={UserRole[UserRole.ADMIN]}>{this.roleDisplay(UserRole.ADMIN)}</option>
									<option value={UserRole[UserRole.READONLY]}>{this.roleDisplay(UserRole.READONLY)}</option>
								</FormControl>
							</FormGroup>
						</Form>
					</RowCol>
					{
						data.addUserErr? <h4 className="errMsg">{data.addUserErr}</h4>: null
					}
					<RowCol className="top1">
						<ButtonToolbar>
							<Button onClick={this.onCancelAddUser.bind(this)}>Cancel</Button>
							<PromiseButton text="Add" onPromiseErr={this.onAddSubmitFailed.bind(this)}
							               promiseCreator={this.onAddUserSubmit.bind(this)} onPromiseDone={this.onSubmitDone.bind(this)}/>
						</ButtonToolbar>
					</RowCol>

				</div>
			);
		}
		else
		{
			if(isAdmin)
				addUser = <Button bsStyle="success" onClick={this.onAddUser.bind(this)}>Add User</Button>;
		}

		return (
			<div>
				<Grid>
					<DSTable>
						{data.users.map(u => <tr key={u.email}>
							<td>{`${u.fName} ${u.lastName}`}</td>
							<td>{this.getEmailDisplay(u)}</td>
							<td>{this.roleDisplay(UserRole[u.role])}</td>
							<td>
								{
									(u.isCurrent|| !isAdmin)? null:
									<Button onClick={this.onEditUser.bind(this, u)}>Edit Role</Button>
								}
							</td>
							<td>
								{
									(u.isCurrent|| !isAdmin)? null:
									<PromiseButton text="Remove" promiseCreator={this.doRemoveUser.bind(this, u)} onPromiseDone={this.onRemoveUserDone.bind(this)}/>
								}
							</td>
						</tr>)}
					</DSTable>

					<RowCol>
						{addUser}
					</RowCol>
				</Grid>
			</div>
		);
	}

	private getEmailDisplay(user: IUser)
	{
		if(user.confirmed)
			return user.email;

		return user.email +" (Waiting for verification)";
	}
}