import * as React from "react";
import {Col, Radio, Row} from "react-bootstrap";
import {AbstractSelectEntity, SelectJVM} from "../es/pinned/selectJvm";
import {IJVMLabel} from "../es/pinned/jvmFilters";
import {SelectApp} from "../alerts/policies/detail/condition/selectApp";
import * as _ from "lodash";
import {IHostId} from "../reducers/serverPageReducer";
import {SelectHost} from "../server/serverFilters";

export abstract class SelectAllOrOnly<E> extends React.Component<{

	onRadioSelection: (isAll: boolean)=> void;
	select_All: boolean;

	itemList: E [];

	default_selectOnly: E[];
	default_selectAll: E[];

	onSelectOnly_change?: (values: string[]) => void;
	onSelectAll_change?: (values: string[]) => void;

},{}>
{

	private readonly RADIO_SELECTED_ONLY ="selected_apps";
	private readonly RADIO_SELECTED_ALL ="all_apps";

	private select_selectApp: AbstractSelectEntity<E>;
	private select_excludeApp: AbstractSelectEntity<E>;

	private onRadioChange(e)
	{
		const value = e.currentTarget.value;
		let isAll = false;
		if(value === this.RADIO_SELECTED_ONLY)
		{
			isAll = false;
		}
		else if (value === this.RADIO_SELECTED_ALL)
		{
			isAll = true;
		}

		this.props.onRadioSelection(isAll);
	}

	private onchange_SelectOnly(values: string[])
	{
		if(this.props.onSelectOnly_change)
		{
			this.props.onSelectOnly_change(values);
		}
	}

	private onchange_SelectAll(values: string[])
	{
		if(this.props.onSelectAll_change)
		{
			this.props.onSelectAll_change(values);
		}
	}

	getSelectedIds(): string[]
	{
		if(this.props.select_All)
		{
			return this.select_excludeApp.getSelected();
		}
		else
		{
			return this.select_selectApp.getSelected();
		}
	}

	isEntitySelected(): boolean
	{
		if(!this.props.select_All)
		{
			const selectedEntities = this.select_selectApp.getSelected();
			if(_.isEmpty(selectedEntities))
			{
				return false;
			}
		}

		return true;
	}

	protected abstract entitiesName(): string;
	protected abstract selectionComponent():  { new (): AbstractSelectEntity<E> };

	render()
	{
		const eName = this.entitiesName();
		const Select = this.selectionComponent();

		return (
			<div>
				<Row>
					<Col xs={2}>
						<Radio  checked={!this.props.select_All} onChange={this.onRadioChange.bind(this)} value={this.RADIO_SELECTED_ONLY}>{`Selected ${eName}:`}</Radio>
					</Col>
					<Col xs={10}>
						<Select itemList={this.props.itemList}  placeholder={`Select ${eName}`} disabled={this.props.select_All}
						            onSelectionChange={this.onchange_SelectOnly.bind(this)} defaultSelectedTargets={this.props.default_selectOnly}
						            ref={p => this.select_selectApp = p} />
					</Col>
				</Row>
				<Row>
					<Col xs={2}>
						<Radio  checked={this.props.select_All} onChange={this.onRadioChange.bind(this)} value={this.RADIO_SELECTED_ALL}>{`All ${eName}, excluding:`}</Radio>
					</Col>
					<Col xs={10}>
						<Select itemList={this.props.itemList}  placeholder={`Select ${eName} To Exclude (if any)`} disabled={!this.props.select_All}
						            onSelectionChange={this.onchange_SelectAll.bind(this)} defaultSelectedTargets={this.props.default_selectAll}
						            ref={p => this.select_excludeApp = p} />
					</Col>
				</Row>
			</div>
		);
	}
}

export class SelectAllOrOnlyJVM extends SelectAllOrOnly<IJVMLabel>
{
	protected entitiesName(): string
	{
		return "JVMs";
	}

	protected selectionComponent()
	{
		return SelectJVM;
	}
}

export class SelectAllOrOnlyApp extends SelectAllOrOnly<IJVMLabel>
{
	protected entitiesName(): string
	{
		return "Apps";
	}

	protected selectionComponent()
	{
		return SelectApp;
	}
}

export class SelectAllOrOnlyServer extends SelectAllOrOnly<IHostId>
{
	protected entitiesName(): string
	{
		return "Servers";
	}

	protected selectionComponent()
	{
		return SelectHost;
	}
}