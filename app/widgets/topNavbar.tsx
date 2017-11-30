import * as React from "react";
import "./topNavbar.css";
import {logout} from "../utils";

export class TopNavbar extends React.Component<{},{}>
{

	onLogout()
	{
		logout();
	}

	render()
	{
		return (
			<div id="topNavBar" className="navbar navbar-inverse navbar-static-top">
				<div className="container-fluid">
					<div className="navbar-header">
						<a id="dslogo" href="#/" className="navbar-brand">
							<img src="assets/img/ds-white-shadow-transparent.png" />
						</a>
					</div>

					<div className="navbar-collapse">
						<ul className="nav navbar-nav">
							<li><a href="#/jvms"><i className="fa fa-coffee"></i> Apps</a></li>
							<li><a href="#/servers"><i className="fa fa-server"></i> Servers</a></li>
							<li><a href="#/pinned"><i className="fa fa-thumb-tack"></i> Pinned Txns</a></li>
							<li><a href="#/alerts"><i className="fa fa-bell-o"></i> Alerts</a></li>
							<li><a style={({cursor:"default"})}><b>Cross-App :</b></a></li>
							<li><a href="#/live"><i className="fa fa-television"></i> Live</a></li>
							<li><a href="#/es"><i className="fa fa-globe"></i> External Services</a></li>
							<li><a href="#/db"><i className="fa fa-database"></i> Database</a></li>
							<li><a href="#/aws"><i className="fa fa-amazon"></i> AWS</a></li>
							<li><a href="#/errors"><i className="fa fa-bolt"></i> Errors</a></li>

						</ul>
						<ul className="nav navbar-nav navbar-right">
							<li><a href="mailto:support@dripstat.com"><i className="fa fa-envelope-o"></i> Support</a></li>
							<li><a href="https://chronon.atlassian.net/wiki/display/DRIP/DripStat+Agent"><i className="fa fa-info-circle"></i> Docs</a></li>
							<li><a href="#/account/profile"><i className="fa fa-user"></i> Account</a></li>
							<li><a className="aLink" onClick={this.onLogout.bind(this)}><i className="fa fa-power-off"></i> Logout</a></li>
						</ul>
					</div>
				</div>
			</div>
		);
	}

}