import * as React from "react";
import * as PropTypes from "prop-types";
import {errRateDisplay, responseTimeDisplay, throughputDisplay} from "../es/metricUtils";
import {IAppInfo, ITag} from "./appListPage";
import * as _ from "lodash";
import {updateComponentState} from "../utils";
import {RowCol} from "../widgets/rowCol";
import {Col, ControlLabel, FormControl, FormGroup, HelpBlock, Modal, Row} from "react-bootstrap";
import "react-select/dist/react-select.css";
import "./centerModal.css";
import {Http} from "../http";
import {MultiSelect} from "../widgets/multiSelect";
import {NotAllowedDlg} from "../widgets/notAllowed";
import {DSEntityTable, DSEntityTableBody, DSEntityTableEntityRow, DSEntityTableHeader, DSEntityTableTagRow, SortDirection} from "../widgets/dsEntityTable";
import * as Switch from 'antd/lib/switch';

interface IState
{
	sortColumn: string;
	sortDirection: SortDirection;
	showTags: boolean;
	showAddTag: boolean;
	tagValue: string;
	selectedTagApp: IAppInfo;
	filters: string[];
}

export class AppList extends React.Component<{
    appDataList: IAppInfo[],
	tags: ITag[],
	onTagAdd:   (tag:ITag)=>void,
	onTagRemove:(tag:ITag)=>void
}, IState>
{

	static contextTypes:any = {
		router: PropTypes.any.isRequired
	};

	context:any;

	private tagRegExp = /^([a-zA-Z0-9\-])+$/;

	constructor(props, context)
	{
		super(props, context);
		this.state = {sortColumn: "Status", sortDirection: SortDirection.DESC, showTags: false, showAddTag: false, tagValue: "", selectedTagApp: null, filters: []};
	}

	private static getAppStatusClass(app:IAppInfo)
	{
		if (app.hasMtc)
			return "mtc";

		if (!app.isOnline)
			return "offline";

		if (app.violationSeverity === "Critical")
		{
			return "err";
		}

		if (app.violationSeverity === "Warning")
		{
			return "warn";
		}

		return "online"
	}

	private static sortStatusPriority(app:IAppInfo): number
	{
		return DSEntityTableBody.sortStatusPriority(AppList.getAppStatusClass(app));
	}

	private getFilteredApps()
	{
		let appList = this.props.appDataList;
		for(let filteredTag of this.state.filters)
		{
			appList = this.filterApps(appList, filteredTag);
		}
		return appList;
	}

	private filterApps(appList:IAppInfo[], tagVal:string): IAppInfo[]
	{
		let filteredTags:ITag[] = this.props.tags.filter(it=> it.tag === tagVal);

		return appList.filter(app => filteredTags.find(tag=> tag.appId == app.id) );

	}
	private sortApps(appList:IAppInfo[])
	{
		let sortingOrder: string = null;
		switch (this.state.sortDirection)
		{
			case SortDirection.ASC:
				sortingOrder = "asc";
				break;
			case SortDirection.DESC:
				sortingOrder = "desc";
				break;
		}


		const nameField = "label";

		let sortField: string = null;

		switch (this.state.sortColumn)
		{
			case "Name":
				sortField = nameField; break;
			case "Response Time":
				sortField = "responseTime"; break;
			case "Throughput":
				sortField = "throughput"; break;
			case "Error Rate":
				sortField = "errorRate"; break;
			case "Status":
				sortField = "status"; break;
		}

		if(sortField === "status")
		{
			return _.orderBy(appList, [app => AppList.sortStatusPriority(app), nameField], [sortingOrder, "asc"]);
		}

		if(sortField === nameField)
		{
			return _.orderBy(appList, [sortField, app => AppList.sortStatusPriority(app)], [sortingOrder, "desc"]);
		}

		return _.orderBy(appList, [sortField, app => AppList.sortStatusPriority(app), nameField], [sortingOrder, "desc", "asc"]);
	}


	private onAppClick(app:IAppInfo)
	{
		this.context.router.replace(`/app/${app.id}`);
	}

	private onToggleShowTags(showTags)
	{
		updateComponentState(this,{showTags: showTags});
	}

	private renderAppRow(app:IAppInfo)
	{
		const vals:string[] = [app.label,responseTimeDisplay(app.responseTime),throughputDisplay(app.throughput), errRateDisplay(app.errorRate)];
		return <DSEntityTableEntityRow key={app.id} onClick={this.onAppClick.bind(this, app)} statusCssClass={AppList.getAppStatusClass(app)}
		                                columnValues={vals}/>;
	}

	public static formatTagForDisplay(tagValue:string)
	{
		const split = tagValue.split(':');
		const key = _.capitalize(split[0]);
		const val = _.capitalize(split[1]);

		return [key, val];
	}

	private static formattedTag(tagValue:string)
	{
		const display = this.formatTagForDisplay(tagValue);
		return display[0]+':'+display[1];
	}

	private renderTagRow(app:IAppInfo)
	{
		const appTags = _.filter(this.props.tags, {appId: app.id});
		return <DSEntityTableTagRow tags={appTags} onAddTag={this.onAddTagToApp.bind(this,app)} onDeleteTag={this.onDeleteTag.bind(this)} key={app.id+"tagrow"}/>;
	}

	private onSortChange(column: string, direction: SortDirection)
	{
		updateComponentState(this, {sortColumn: column, sortDirection: direction});
	}

	private renderAppTable()
	{

		if (this.props.appDataList.length > 0)
		{
			const filteredApps = this.getFilteredApps();
			const sortedApps = this.sortApps(filteredApps);

			const tableRows = [];
			for(const app of sortedApps)
			{
				tableRows.push(this.renderAppRow(app));
				if(this.state.showTags)
				{
					tableRows.push(this.renderTagRow(app));
				}
			}

			return (
				<DSEntityTable>
					<DSEntityTableHeader columnNames={["Status","Name", "Response Time", "Throughput", "Error Rate"]} onSortChange={this.onSortChange.bind(this)}
					                     sortDirection={this.state.sortDirection} sortColumn={this.state.sortColumn} />
					<DSEntityTableBody>
					{tableRows}
					</DSEntityTableBody>
				</DSEntityTable>
			);
		}
		return null;
	}

	private renderToggleTags()
	{

		let Switch2 = Switch as any;
		return (
			<div>
				<Switch2 onChange={this.onToggleShowTags.bind(this)} checked={this.state.showTags}
				        checkedChildren={"Hide Tags"} unCheckedChildren={"Show Tags"} className={"showTagsSwitch"}
				/>
			</div>
		);
	}

	private onDeleteTag(tag:ITag)
	{
		if(!DSEntityTableTagRow.canEditTags())
		{
			(this.refs["nadlg"] as NotAllowedDlg).showDlg();
			return;
		}
		
		Http.post('/tags/remove', {tagId: tag.id});
		this.props.onTagRemove(tag);
	}

	private onAddTagToApp(app:IAppInfo)
	{
		updateComponentState(this, {showAddTag: true, selectedTagApp: app});
	}
	private onTagValueChange(e)
	{
		updateComponentState(this, {tagValue: e.target.value});
	}
	private validateTagValue()
	{
		const tagValue = this.state.tagValue;
		if(tagValue.length === 0)
			return 'success';
		if(tagValue)
		{
			const split = tagValue.split(':');
			if(split.length == 2)
			{
				if (this.validateTagElem(split[0]) && this.validateTagElem(split[1]))
				{
					return 'success';
				}
			}
		}
		return 'error';
	}

	private validateTagElem(tagElem: string): boolean
	{
		return this.tagRegExp.test(tagElem);
	}

	private onTagSumbit(e)
	{
		e.preventDefault();
		if(!_.isEmpty(this.state.tagValue) && this.validateTagValue() === 'success')
		{
			Http.post('/tags/add', {appId: this.state.selectedTagApp.id, tag: this.state.tagValue}).then((addedTag)=>
			{
				if (addedTag)
				{
					this.props.onTagAdd(addedTag);
				}
			});
		}

		this.onCloseDlg();
	}

	private onDlgHide()
	{
		this.onCloseDlg();
	}

	private onCloseDlg()
	{
		updateComponentState(this, {showAddTag: false, selectedTagApp: null, tagValue: ""});
	}

	private renderAddTagDlg()
	{
		return (
			<div>
				<Modal keyboard={true} show={this.state.showAddTag} onHide={this.onDlgHide.bind(this)}>
					<Modal.Header closeButton={true}>
						<Modal.Title>Add tag</Modal.Title>
					</Modal.Header>
					<Modal.Body>
						<form onSubmit={this.onTagSumbit.bind(this)}>
							<FormGroup validationState={this.validateTagValue()}>
								<ControlLabel>{"Tag (case-insensitive)"}</ControlLabel>
								<FormControl type="text" placeholder="Key:Value" value={this.state.tagValue} onChange={this.onTagValueChange.bind(this)} autoFocus/>
								<FormControl.Feedback />
								<HelpBlock>{'Input Key:Value pair containing only letters, numbers or hyphen(-) '}</HelpBlock>
							</FormGroup>
						</form>
					</Modal.Body>

				</Modal>
			</div>
		);
	}

	private renderFilterSelect()
	{
		const tagValues = this.props.tags.map(t=> t.tag);
		const uniqTags = _.uniq(tagValues);
		const mapper = tag =>({value: tag, label: AppList.formattedTag(tag)});

		let FilterSelect = MultiSelect as any;
		return (
			<FilterSelect placeholder="Filter by tags.." disabled={false} itemList={uniqTags} mapperToOption={mapper} onSelectionChange={this.onFilterChange.bind(this)}/>
		);
	}

	private onFilterChange(tags:string[])
	{
		updateComponentState(this, {filters: tags});
	}

	render()
	{

		return (
			<div>
				<Row>
					<Col xs={3}>
						{this.renderToggleTags()}
					</Col>
					<Col xs={7}>
						{this.renderFilterSelect()}
					</Col>
				</Row>
				<RowCol>
					{this.renderAppTable()}
				</RowCol>
				{this.renderAddTagDlg()}
				<NotAllowedDlg ref="nadlg"/>
			</div>
		);
	}
}