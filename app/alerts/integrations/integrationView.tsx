import * as React from "react";
import * as _ from "lodash";
import {Button, ButtonToolbar} from "react-bootstrap";
import {RowCol} from "./../../widgets/rowCol";
import {IIntegrationSetting} from "./integrationsPage";
import {Http} from "../../http";
import {updateComponentState} from "../../utils";
import {PromiseButton} from "./../../widgets/promseButton";

export abstract class IntegrationView<T extends IIntegrationSetting> extends React.Component<
{
	defaultSettings: T;
	onDisconnect :()=>void;
},
	{
		settings: T;
		editing :   boolean;
	}>
{

	refs: any;

	constructor(props)
	{
		super(props);
		const editing = _.isEmpty(props.defaultSettings);
		this.state = {settings: props.defaultSettings, editing: editing};
	}

	protected onCancelEdit()
	{
		updateComponentState(this, {editing: false});
	}

	private onStartEdit()
	{
		updateComponentState(this, {editing: true});
	}


	private onDisconnect()
	{
		return Http.post(this.getDisconnectURL());
	}

	private onDisconnectDone()
	{
		this.props.onDisconnect();
	}

	private renderButtonToolbar()
	{
		let editButton = null;
		if(this.canEditSettings())
		{
			editButton = <Button onClick={this.onStartEdit.bind(this).bind(this)}>Edit Settings</Button>;
		}

		return (
			<ButtonToolbar>
				{editButton}
				<PromiseButton text={"Disconnect "+this.getServiceName()} promiseCreator={this.onDisconnect.bind(this)} onPromiseDone={this.onDisconnectDone.bind(this)}/>
			</ButtonToolbar>
		);
	}

	private onSave()
	{
		const settings:T = this.refs.form.getSettings();
		updateComponentState(this, {settings: settings, editing: false});
	}

	protected abstract getFormComponent();

	protected renderForm()
	{
		const FormComponent:any = this.getFormComponent();
		return <FormComponent onCancel={this.onCancelEdit.bind(this)} onSaved={this.onSave.bind(this)}
		               defaultSettings={this.state.settings} ref="form"/>;
	}

	private renderView()
	{
		return <div>
			<RowCol>
				<p>
					{`You are connected to ${this.getServiceName()}. Configure individual policies to specify ${this.getServiceName()} as a Notification Channel.`}
				</p>
			</RowCol>
			<RowCol>
				{this.renderSettingsView(this.state.settings)}
			</RowCol>
			<RowCol>
				{this.renderButtonToolbar()}
			</RowCol>
		</div>;
	}


	render()
	{
		let view;
		if(this.canEditSettings() && this.state.editing)
			view = this.renderForm();
		else
			view = this.renderView();

		return (
			<div>
				<h4>{this.getServiceName()}</h4>
				{view}
			</div>
		);

	}

	protected canEditSettings(){
		return true;
	}

	protected abstract getDisconnectURL():string;

	protected abstract getServiceName():string;

	protected abstract renderSettingsView(settings:T):any;


}