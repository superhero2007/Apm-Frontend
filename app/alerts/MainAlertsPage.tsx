import * as React from "react";
import {LiA} from "./../widgets/liA";
import {AmplitudeAnalytics} from "../analytics";

export class MainAlertsPage extends React.Component<{children:any},{}>
{
	constructor(props, context)
	{
		super(props, context);
		AmplitudeAnalytics.track("Alerts Tab");
	}

	render()
	{
		let navbar = (<nav className="navbar navbar-default navbar-static-top row navbarStickTop">
			<div className="container-fluid">

				<div className="navbar-collapse">
					<ul className="nav navbar-nav">
						<LiA linkText="Policies" path ={`/alerts/policies`}/>
						<LiA linkText="Maintenances" path ={`/alerts/mtcs`}/>
						<LiA linkText="Integrations" path ={`/alerts/integrations`}/>
					</ul>

				</div>
			</div>
		</nav>);
		return <div>
			{navbar}
			{this.props.children}
			</div>;
	}
}