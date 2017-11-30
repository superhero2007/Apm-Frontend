import * as React from "react";
import {ServerProcSortType} from "../reducers/serverPageReducer";
import {Option} from "react-select";
import {Col, Row} from "react-bootstrap";
import Select =  require('react-select');

export class ProcSortSelect extends React.Component<{
	onSelection             :(selection:ServerProcSortType)=>void;
	selected                : ServerProcSortType
}, {}>
{
	private renderOption(option:Option)
	{
		let check = null;
		if ((option.value as any) === this.props.selected)
			check = <i className="fa fa-check"/>;
		return <span >{check} {option.label} </span>;
	}

	private onSelect(e:Option)
	{
		this.props.onSelection(e.value as any);
	}

	render()
	{
		let selectOptions = [
			{label: "CPU", value: ServerProcSortType.Cpu},
			{label: "Memory", value: ServerProcSortType.Mem},
			{label: "Disk Write", value: ServerProcSortType.DiskWrite},
			{label: "Disk Read", value: ServerProcSortType.DiskRead},
			{label: "Thread Count", value: ServerProcSortType.ThreadCount},
			{label: "File Descriptors Used", value: ServerProcSortType.FDUsed},
			{label: "File Descriptors Limit", value: ServerProcSortType.FDLimit},
			{label: "Running Instances", value: ServerProcSortType.InstanceCount},
		];


		const Sel:any = Select;
		return (
			<Row className="verticalAlign">
				<Col xs={2}>
					<strong>Sort By:</strong>
				</Col>
				<Col xs={10}>
					<Sel
						options={selectOptions}
						value={this.props.selected}
						clearable={false}
						searchable={false}
						multi={false}
						onChange={this.onSelect.bind(this)}
						optionRenderer={this.renderOption.bind(this)}
					/>
				</Col>
			</Row>
		);
	}
}