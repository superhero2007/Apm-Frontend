import * as React from "react";
import * as PropTypes from "prop-types";
import {Grid} from "react-bootstrap";
import {RowCol} from "./../../../widgets/rowCol";
import {VictorOpsForm} from "./victorOpsForm";

export class AddVictorOpsPage extends React.Component<{}, {}>
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
					<h2>Connect to VictorOps</h2>
					<hr/>
				</RowCol>
				<RowCol>
					<VictorOpsForm onCancel={this.onDone.bind(this)} onSaved={this.onDone.bind(this)}/>
				</RowCol>

			</Grid>
		);
	}
}