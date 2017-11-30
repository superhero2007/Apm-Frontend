import * as React from "react";
import * as classNames from "classnames";
import {Button, ButtonToolbar} from "react-bootstrap";
import {Permission, PermissionManager} from "../roles";
import {ITag} from "../apps/appListPage";
import {AppList} from "../apps/appList";

export enum  SortDirection {
	ASC,
	DESC
}
export class DSEntityTableHeader extends React.Component<{
	columnNames: string[];
	onSortChange: (column: string, direction: SortDirection) => void;
	sortColumn: string;
	sortDirection: SortDirection;

}, {
}>
{
	private getSortClass(columnName)
	{
		if (this.props.sortColumn === columnName)
		{
			if (this.props.sortDirection === SortDirection.ASC)
				return "fa-sort-asc";
			else
				return "fa-sort-desc"
		}

		return "fa-sort"
	}

	private onHeaderClick(name: string)
	{
		let direction = this.props.sortDirection;

		if (name === this.props.sortColumn)
		{
			if (this.props.sortDirection === SortDirection.ASC)
				direction = SortDirection.DESC;
			else
				direction = SortDirection.ASC;
		}

		this.props.onSortChange(name, direction);
	}

	render()
	{
		return (
			<thead>
			<tr>
				{this.props.columnNames.map(name => <th key={name}
				                         onClick={this.onHeaderClick.bind(this, name)}>{name} <i className={classNames("fa",this.getSortClass(name))}/></th>)}
			</tr>
			</thead>
		);
	}
}

class DSEntityTableAddTagButton extends React.Component<{
	onClick: ()=>void;
}, {}>
{
	private onButtonClick() {
		this.props.onClick();
	}

	render()
	{
		return (
			<ButtonToolbar style={{'marginLeft':'2px', 'marginTop':'4px'}}>
				<Button bsSize="xsmall" onClick={this.onButtonClick.bind(this)}><i className="fa fa-plus" style={{color: 'hsla(350,100%,75%,1)'}}/></Button>
			</ButtonToolbar>
		);
	}
}

export class DSEntityTableTagRow extends React.Component< {
	tags: ITag[];
	onAddTag: ()=>void;
	onDeleteTag: (tag: ITag)=>void;
}, {}>
{
	public static canEditTags()
	{
		return PermissionManager.permissionAvailable(Permission.TAG_EDIT);
	}

	private onAddTagClick()
	{
		this.props.onAddTag();
	}

	private onDeleteTag(tag:ITag)
	{
		this.props.onDeleteTag(tag)
	}

	private renderTag(tag: ITag)
	{
		const fmtTag = AppList.formatTagForDisplay(tag.tag);
		return (
			<div className="Select--multi" key={tag.id}>
				<div className="Select-value">
					<span className="Select-value-icon" onClick={this.onDeleteTag.bind(this, tag)}>x</span>
					<span className="Select-value-label"><b>{fmtTag[0]}</b>{':'+fmtTag[1]}</span>
				</div>
			</div>
		);
	}

	render()
	{
		const rowStyle = {
			"fontSize":"15px"
		};

		let addBtn;

		if(DSEntityTableTagRow.canEditTags())
		{
			addBtn = <DSEntityTableAddTagButton onClick={this.onAddTagClick.bind(this)}/>;
		}

		return <tr style={rowStyle}>
			<td colSpan={5}>
				<div className="flexHorizontal">
					{this.props.tags.map(t => this.renderTag(t))}
					{addBtn}
				</div>
			</td>
		</tr>;
	}
}

export class DSEntityTableEntityRow extends React.Component<{
	onClick: ()=>void;
	statusCssClass: string;
	columnValues: string[];
},{}>
{
	private onRowClick()
	{
		this.props.onClick();
	}

	render()
	{
		let key =2;
		const cols = this.props.columnValues.map(it => <td key={++key}>{it}</td>);
		cols.unshift((<td key={1}><i className={classNames("fa", "fa-circle", "appStatus", this.props.statusCssClass)}/></td>));

		const rowStyle = {
			"fontSize":"15px"
		};
		return (
			<tr style={rowStyle} onClick={this.onRowClick.bind(this)}>
				{cols}
			</tr>
		);
	}
}

export class DSEntityTable extends React.Component<{
	children?: any;
}, {}>
{
	render()
	{
		return (
			<table className="table table-striped table-hover">
				{this.props.children}
			</table>
		);
	}
}

export class DSEntityTableBody extends React.Component<{
	children?: any;
}, {}>
{
	public static sortStatusPriority(statusCssClass:string): number
	{
		switch (statusCssClass)
		{
			case "offline":
				return 0;
			case "online":
				return 1;
			case "mtc":
				return 2;
			case "warn":
				return 3;
			case "err":
				return 4;
		}

		return 0;
	}
	render()
	{
		return (
			<tbody className="handHover">
				{this.props.children}
			</tbody>
		);
	}
}
