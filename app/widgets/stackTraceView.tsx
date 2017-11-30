import * as React from "react";

export class StackTraceView extends React.Component<{
	stack:  string[];
},{}>
{
	render()
	{
		let i=0;

		return (
			<div className="dsCodeBlock">
				{this.props.stack.map(s => <div key={i++}>{s}</div>)}
			</div>
		);
	}
}