import * as React from "react";
import {Panel} from "react-bootstrap";
import {ITargetApp} from "./selectApp";
import {SelectAllOrOnly, SelectAllOrOnlyApp, SelectAllOrOnlyServer} from "../../../../widgets/selectAllOrOnly";
import {IHostId} from "../../../../reducers/serverPageReducer";

export interface IConditionTargetSelectionPanel {
	validate();
	getData();
}

interface IProps<E>
{
	itemList: E[];
	defaultIsAll?:      boolean;
	defaultSelectedItemsIds?:   string[]; //host ids
}

abstract class TargetSelectionPanel<E,T extends SelectAllOrOnly<E>> extends React.Component<IProps<E>, {isAll: boolean}> implements IConditionTargetSelectionPanel
{
	protected selectionPanel: T;

	constructor(props: IProps<E>)
	{
		super(props);
		let isAllApps = false;
		if(props.defaultIsAll)
		{
			isAllApps = props.defaultIsAll;
		}

		this.state = {isAll: isAllApps};
	}

	protected onRadioChange(isAll: boolean)
	{
		this.setState({isAll: isAll});
	}

	validate()
	{
		let err = null;

		if (!this.selectionPanel.isEntitySelected())
		{
			err = `Please select some ${this.entitiesName()} to apply the condition to and try again`;
		}

		return err;
	}

	getData()
	{
		return {
			isAllApps: this.state.isAll,
			selectedAppIds: this.selectionPanel.getSelectedIds()
		};
	}

	render()
	{
		let defaultSelectedItems: E[] = null;
		let defaultExcludedItems: E[] = null;

		if(this.props.defaultSelectedItemsIds)
		{
			const selectedItemList:E[] = this.filterDefaultSelectedItems();

			if(this.props.defaultIsAll)
				defaultExcludedItems = selectedItemList;
			else
				defaultSelectedItems = selectedItemList;
		}

		const Sc = this.selectAllOrOnlyComponent();
		return (
			<Panel header="Select Targets">
				<Sc onRadioSelection={this.onRadioChange.bind(this)} select_All={this.state.isAll}  itemList={this.props.itemList}
				                       default_selectAll={defaultExcludedItems} default_selectOnly={defaultSelectedItems}
				                       ref = {p => this.selectionPanel = p}
				/>
			</Panel>
		);
	}

	protected abstract entitiesName(): string;
	protected abstract selectAllOrOnlyComponent():  { new (): T };
	protected abstract filterDefaultSelectedItems(): E[];
}

export class ServerTargetSelectionPanel extends TargetSelectionPanel<IHostId, SelectAllOrOnlyServer>
{
	constructor(props)
	{
		super(props);
	}

	protected selectAllOrOnlyComponent()
	{
		return SelectAllOrOnlyServer;
	}

	protected entitiesName(): string
	{
		return "Servers"
	}

	protected filterDefaultSelectedItems(): IHostId[]
	{
		return this.props.itemList.filter((host:IHostId)=> this.props.defaultSelectedItemsIds.includes(host.id));
	}

}

export class AppTargetSelectionPanel extends TargetSelectionPanel<ITargetApp, SelectAllOrOnlyApp>
{
	constructor(props)
	{
		super(props);
	}

	protected selectAllOrOnlyComponent()
	{
		return SelectAllOrOnlyApp;
	}

	protected entitiesName(): string
	{
		return "Apps"
	}

	protected filterDefaultSelectedItems(): ITargetApp[]
	{
		return this.props.itemList.filter((app:ITargetApp)=> this.props.defaultSelectedItemsIds.includes(app.id));
	}

}

