import * as React from "react";
import * as PropTypes from "prop-types";
import {Grid} from "react-bootstrap";
import {RowCol} from "./../../widgets/rowCol";
import {IntegrationForm} from "./integrationForm";

export abstract class AddIntegrationPage extends React.Component<{}, {}>
{
	static contextTypes:any = {
		router: PropTypes.any.isRequired
	};

	context:any;

	private onDone()
	{
		this.context.router.push('/alerts/integrations')
	}

	render()
	{
		let IForm:any = this.formClass();
		return (
			<Grid>
				<RowCol>
					<h2>Connect to {this.serviceName()}</h2>
					<hr/>
				</RowCol>
				<RowCol>
					<IForm onCancel={this.onDone.bind(this)} onSaved={this.onDone.bind(this)}/>
				</RowCol>

			</Grid>
		);
	}

	protected abstract serviceName():string;

	protected abstract formClass():IntegrationForm<any,any>;
}