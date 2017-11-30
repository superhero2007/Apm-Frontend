import * as React from 'react';
import {IIntegrationSetting} from "./integrationsPage";
import {Button, ButtonToolbar,} from 'react-bootstrap';
import {PromiseButton} from './../../widgets/promseButton';
import {RowCol} from './../../widgets/rowCol';
import {updateComponentState} from "../../utils";

export interface IGFormState {
	errorMsg    :string;
}
export abstract class IntegrationForm<T extends IIntegrationSetting, S extends IGFormState> extends React.Component<{
	defaultSettings?  :T;
	ref?             :string;
	onCancel    :()=>void;
	onSaved     :()=>void;
},S>
{

	render()
	{
		let err = null;
		if(this.state.errorMsg)
		{
			err = <RowCol>
				<h5 style={{color:"red"}}>{this.state.errorMsg}</h5>
			</RowCol>;
		}

		return (
			<div className="bottom2">
				{this.renderSettingsForm()}
				{err}
				<RowCol>
					<ButtonToolbar>
						<Button onClick={this.props.onCancel.bind(this)}>Cancel</Button>
						<PromiseButton text="Save" bsStyle="success" onPromiseDone={this.props.onSaved.bind(this)} promiseCreator={this.onSaveSettings.bind(this)}/>
					</ButtonToolbar>
				</RowCol>

			</div>
		);
	}

	protected onSaveSettings()
	{
		const errMsg = this.validate();
		if(errMsg!=null)
		{
			updateComponentState(this, {errorMsg: errMsg});
			return null;
		}

		return this.saveValidatedSettings();
	}


	protected abstract validate():string;
	protected abstract saveValidatedSettings();

	protected abstract renderSettingsForm();


	protected abstract getSettings()  :T;
}