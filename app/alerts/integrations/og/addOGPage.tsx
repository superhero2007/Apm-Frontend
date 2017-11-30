import * as React from "react";
import {Grid} from "react-bootstrap";
import {RowCol} from "./../../../widgets/rowCol";
import {OGForm} from "./ogForm";
import * as PropTypes from "prop-types";

export class AddOGPage extends React.Component<{}, {}>
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
		return (
			<Grid>
				<RowCol>
					<h2>Connect to OpsGenie</h2>
					<hr/>
				</RowCol>
				<RowCol>
					<OGForm onCancel={this.onDone.bind(this)} onSaved={this.onDone.bind(this)}/>
				</RowCol>

			</Grid>
		);
	}
}