import * as React from "react";
import {Link} from "react-router";
import * as PropTypes from "prop-types";

export class LiA extends React.Component<{path:string, linkText:string, children?:any},{}>
{
	static contextTypes:any = {
		router: PropTypes.any.isRequired
	};

	context: any;

	render()
	{
		let router = this.context.router;
		return (
			<li className={router.isActive(this.props.path)?"active":""}>
				<Link to={this.props.path}>{this.props.children}{this.props.linkText}</Link>
			</li>
		);
	}
}