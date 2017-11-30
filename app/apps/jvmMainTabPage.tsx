import * as React from "react";

export class JVMMainTabPage extends React.Component<{children:any},{}>
{
	render()
	{
		return (
			<div>
				{this.props.children}
			</div>
		);
	}
}