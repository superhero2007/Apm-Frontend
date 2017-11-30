import * as React from "react";
import {LiA} from "../widgets/liA";

export class AccountMainPage extends React.Component<{children: any},{}>
{
	render()
	{
		return (
			<div>
				<nav className="navbar navbar-default navbar-static-top row navbarStickTop">
					<div className="container-fluid">

						<div className="navbar-collapse">
							<ul className="nav navbar-nav">
								<LiA linkText="Profile" path ={`/account/profile`}/>
								<LiA linkText="Users" path ={`/account/users`}/>
								<LiA linkText="Host Usage" path ={`/account/usage`}/>
								<LiA linkText="Billing" path ={`/account/billing`}/>
							</ul>

						</div>
					</div>
				</nav>
				{this.props.children}
			</div>
		);
	}
}