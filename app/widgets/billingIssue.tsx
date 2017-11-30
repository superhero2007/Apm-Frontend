import * as React from "react";

export class BillingIssue extends React.Component<{},{}>
{
	render()
	{
		const style = {
			color: "#800000"
		};
		return (
			<div style={style}>
				<h1>There is a billing issue with your account.</h1>
				<h2>Contact DripStat Support to resolve this.</h2>
			</div>
		);
	}
}
