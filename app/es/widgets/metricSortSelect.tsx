import * as React from 'react';
import Select =  require('react-select');
import {Option} from "react-select";
import {MetricSortType} from "./sortedMetricList";
import {Row, Col} from 'react-bootstrap';

export class MetricSortSelect extends React.Component<{
	allowSortByError        :boolean;
	onSelection             :(selection:MetricSortType)=>void;
	selected                :MetricSortType;
},{}>
{
	private onSelect(e:Option)
	{
		this.props.onSelection(e.value as any);
	}

	private renderOption(option:Option)
	{
		let check = null;
		if ((option.value as any) === this.props.selected)
			check = <i className="fa fa-check"/>;
		return <span >{check} {option.label} </span>;
	}

	render()
	{
		let selectOptions = [
			{label: "Most Time Consumed", value: MetricSortType.TIME_SPENT},
			{label: "Throughput", value: MetricSortType.THROUGHPUT},
			{label: "Slowest", value: MetricSortType.AVG_RESPTIME}
		];

		if (this.props.allowSortByError === true) {
			selectOptions.push({label: "Error Rate", value: MetricSortType.ERR_RATE})
		}

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
