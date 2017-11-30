import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {Row, Col} from 'react-bootstrap';

export class RowCol extends React.Component<{children?:any, xs?:number, className?:string, style?:any},{}>
{
	render()
	{
		let width = 12;
		if(this.props.xs)
			width = this.props.xs;

		return <Row className={this.props.className} style={this.props.style}>
			<Col xs={width}>
				{this.props.children}
			</Col>
		</Row>;
	}
}