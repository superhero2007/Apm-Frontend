import * as React from "react";
import "./loading.css";
import * as classNames from "classnames";

export class DSTable extends React.Component<{columnNames?:string[], classes?:string, children?:any, noStripe?:boolean, noHover?:boolean, noBorder?:boolean, noHead?:boolean},{}>
{
	private renderTableHead(columnNames:string[])
	{
		if(this.props.noHead || !columnNames)
			return null;
		return (<thead>
			<tr>
				{columnNames.map(name=> <th key={name}>{name}</th>)}
			</tr>
		</thead>);
	}

	render()
	{
		let s = classNames({"table-striped":!this.props.noStripe, "table-hover":!this.props.noHover, "borderless":this.props.noBorder});


		let clsName = "";
		if(this.props.classes)
		{
			clsName = "table "+this.props.classes +" "+s;
		}
		else
		{
			clsName = "table "+s;
		}

		return (
			<table className={clsName}>
				{this.renderTableHead(this.props.columnNames)}
				<tbody>
					{this.props.children}
				</tbody>
			</table>
		);
	}
}