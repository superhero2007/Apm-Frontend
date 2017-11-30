import * as React from "react";
import {Nav, NavItem} from "react-bootstrap";
import {AmplitudeAnalytics} from "../../analytics";

export enum DSTabType {
	overview, perapp, perjvm, trends, scalable, slowqueries, normal, layers, segments, relative, errs, ttraces, customAttr,
		requestParams, jvmDetails, exception, details, hardware, stacktrace, percentiles, xd
}

export interface IDSTabData
{
	type: DSTabType;
	state: any;
}

export enum TabStyle {
	tabs,
	pills
}
class TabInfo
{
	constructor(public tabType:DSTabType, public name:string)
	{
	}
}

export interface IDSTabView
{

}
export class DSTabViewInfo
{
	constructor(public tabType: DSTabType, public view: IDSTabView, public tabStateFunc: ()=>object = null){}
}

export class DSTabViewManager
{
	constructor(private infos:DSTabViewInfo[])
	{}

	private findInfo(type: DSTabType)
	{
		return this.infos.find(i => i.tabType === type);
	}

	getView(type:DSTabType): IDSTabView
	{
		return this.findInfo(type).view;
	}

	getViewDefaultState(type:DSTabType)
	{
		const info = this.findInfo(type);
		AmplitudeAnalytics.track("Tab - "+DSTabType[type]);

		if(info.tabStateFunc)
		{
			return info.tabStateFunc();
		}

		return null;
	}

	getAllTabTypes():DSTabType[]
	{
		return this.infos.map(i => i.tabType);
	}

	renderView(type:DSTabType)
	{
		let View;
		View = this.getView(type);
		return <View/>;
	}
}

class TabInfoContainer
{
	private tabInfos:TabInfo[] = [
		new TabInfo(DSTabType.overview, "Overview"),
		new TabInfo(DSTabType.perapp, "Per App"),
		new TabInfo(DSTabType.perjvm, "Per JVM"),
		new TabInfo(DSTabType.trends, "Trends"),
		new TabInfo(DSTabType.scalable, "Scalability Report"),
		new TabInfo(DSTabType.slowqueries, "Slow Queries"),
		new TabInfo(DSTabType.normal, "Normal"),
		new TabInfo(DSTabType.layers, "Layers"),
		new TabInfo(DSTabType.segments, "Segments"),
		new TabInfo(DSTabType.relative, "Relative To Average"),
		new TabInfo(DSTabType.errs, "Errors"),
		new TabInfo(DSTabType.ttraces, "Transaction Traces"),
		new TabInfo(DSTabType.customAttr, "Custom Attributes"),
		new TabInfo(DSTabType.requestParams, "Request Parameters"),
		new TabInfo(DSTabType.jvmDetails, "JVM Details"),
		new TabInfo(DSTabType.exception, "Exception"),
		new TabInfo(DSTabType.details, "Details"),
		new TabInfo(DSTabType.hardware, "Hardware"),
		new TabInfo(DSTabType.stacktrace, "StackTrace"),
		new TabInfo(DSTabType.percentiles, "Percentiles"),
		new TabInfo(DSTabType.xd, "Xtreme Detail"),
	];

	getTabInfo(tabType: DSTabType): TabInfo
	{
		return this.tabInfos.find(t => t.tabType === tabType);
	}
}

export class DSTabs extends React.Component<{
	tabs: DSTabType[];
	activeTab: DSTabType;
	onSelect: (tab:DSTabType)=>void;
	style: TabStyle;
},{}>
{
	private tabInfoContainer = new TabInfoContainer();

	render()
	{
		const tabInfos:TabInfo[] = this.props.tabs.map(tab => this.tabInfoContainer.getTabInfo(tab));

		let styleName;
		let clsName;

		switch (this.props.style)
		{
			case TabStyle.pills:
				styleName = "pills";
				clsName = "dsPillTab";
				break;
			case TabStyle.tabs:
				styleName = "tabs";
				break;
		}

		return (
			<Nav bsStyle={styleName} onSelect={this.props.onSelect as any} activeKey={this.props.activeTab} >
				{tabInfos.map(t => <NavItem key={t.tabType} eventKey={t.tabType} className={clsName}>{t.name}</NavItem>)}
			</Nav>
		);
	}
}