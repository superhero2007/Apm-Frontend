import * as React from "react";
import * as Select from "react-select";
import {ReactSelectClass} from "react-select";
import "react-select/dist/react-select.css";

export interface IOption {
	value: string;
	label: string;
}

export interface IMultiSelectProps<T>
{
	defaultSelectedItems?: T[];

	itemList: T[],
	placeholder:string,
	disabled:boolean;
	mapperToOption: (obj:T)=>IOption;

	onSelectionChange?:(values:string[])=>void;

}

export class MultiSelect<T> extends React.Component<IMultiSelectProps<T>,{selectedItems:IOption[]}>
{
	constructor(props)
	{
		super(props);
		let selectedTargets = null;
		if(props.defaultSelectedItems)
		{
			selectedTargets = props.defaultSelectedItems.map(this.props.mapperToOption);
		}

		this.state = {selectedItems: selectedTargets};
	}

	private onItemSelection(e: IOption[])
	{
		this.setState({selectedItems:e});

		if(this.props.onSelectionChange)
		{
			const selection = this.selectedValues(e);
			this.props.onSelectionChange(selection);
		}
	}

	private selectedValues(selectedItems: IOption[]): string[]
	{
		if(!selectedItems)
		{
			return [];
		}

		return selectedItems.map(option => option.value);
	}

	getSelection(): string[]
	{
		return this.selectedValues(this.state.selectedItems);
	}

	render()
	{
		const appOptions = this.props.itemList.map(this.props.mapperToOption);

		const Select2: any = Select;
		const Select3: ReactSelectClass = Select2;

		return <Select3
			value = {this.state.selectedItems}
			options={appOptions}
			clearable={true}
			searchable={true}
			multi = {true}
			placeholder={this.props.placeholder}
			onChange={this.onItemSelection.bind(this)}
			disabled={this.props.disabled}
		/>;

	}

}
