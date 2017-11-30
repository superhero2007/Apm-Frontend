import * as React from "react";
import {IJVMLabel} from "./jvmFilters";
import {IMultiSelectProps, IOption, MultiSelect} from "../../widgets/multiSelect";
import {Option} from "react-select";


interface ISelectEntityProps<T>
{
	placeholder:string;
	disabled:boolean;
	onSelectionChange? : (appIds:string[]) => void;

	itemList: T [];
	defaultSelectedTargets?: T [];
}

export abstract class AbstractSelectEntity<T> extends React.Component<ISelectEntityProps<T>,{}>
{

	private selectComponent: MultiSelect<T>;

	getSelected(): string[]
	{
		return this.selectComponent.getSelection();
	}

	render()
	{

		let changeListener = null;
		if(this.props.onSelectionChange)
			changeListener = this.props.onSelectionChange.bind(this);

		const EntitySelect = MultiSelect as { new (props: IMultiSelectProps<T>): MultiSelect<T> };

		return <EntitySelect ref={p => this.selectComponent = p}
		                  defaultSelectedItems={this.props.defaultSelectedTargets}
		                  itemList={this.props.itemList}
		                  placeholder={this.props.placeholder}
		                  disabled={this.props.disabled}
		                  mapperToOption={this.getMapper()}
		                  onSelectionChange={changeListener}
		/>;

	}

	abstract getMapper(): (obj:T)=>IOption;
}


export class SelectJVM extends AbstractSelectEntity<IJVMLabel>
{
	getMapper()
	{
		return (jvm: IJVMLabel) =>({value: jvm.id, label:jvm.label});
	}
}