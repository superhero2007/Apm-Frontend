import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {IUser} from "../notificationsPage";
import Select  = require('react-select');
import {Option} from "react-select";
import {MultiSelect} from "./../../../../widgets/multiSelect";

export class SelectUserEmail extends React.Component<{
	allUsers: IUser[];
	defaultSelectedUsers?: IUser[];
	placeholder: string;
	disabled?:boolean;
	ref?    :string;
},{}>
{
	refs:any;

	getSelectedEmails()
	{
		return this.refs.select.getSelection();
	}

	render()
	{
		let UserSelect = MultiSelect as any;

		const mapper = app =>({value: app.email, label:app.fName+" "+app.lastName});
		return (
			<UserSelect ref="select"
			            defaultSelectedItems={this.props.defaultSelectedUsers}
			            itemList={this.props.allUsers} placeholder={this.props.placeholder} disabled={this.props.disabled} mapperToOption={mapper}/>
		);
	}
}