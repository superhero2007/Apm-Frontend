import * as React from "react";
import {MetricCategory} from "../reducers/esReducer";
import {RoutableLoadableComponent} from "../widgets/routableLoadableComponent";
import {getRouteParam} from "../utils";
import {accountStatus} from "../accountStatus";
import {NeedPro} from "../widgets/needPro";
import {RowCol} from "../widgets/rowCol";
import {AccountDbTabs} from "./db/accountDbTabs";
import {PlainRoute} from "react-router";
import {AmplitudeAnalytics} from "../analytics";
import {featuresToMetricCategories} from "./metricUtils";
import {BillingIssue} from "../widgets/billingIssue";


export interface IAbstractDbPageState
{
	selectedDb:MetricCategory;
}
export abstract class AbstractDBPage extends RoutableLoadableComponent<{children?:any},IAbstractDbPageState>
{
	protected dbCategories:MetricCategory[];

	protected initialState():IAbstractDbPageState
	{
		return {selectedDb: null};
	}

	protected getPostUrl():string
	{
		return "/account/features";
	}

	protected featuresToDbCategories(features:string[]):MetricCategory[]
	{
		return featuresToMetricCategories(features, this.getSupportedCategories());
	}

	protected getStateFromPostResponse(reponseData:any):IAbstractDbPageState
	{
		const features:string[] = reponseData;
		this.dbCategories = this.featuresToDbCategories(features);

		let selectedDb = null;
		if(this.dbCategories.length > 0)
		{
			const savedDb = getRouteParam(this.props,"db");
			if(savedDb!=null && this.dbCategories.includes(Number(savedDb)))
			{
				selectedDb = Number(savedDb);
			}
			else
			{
				selectedDb = this.dbCategories[0];
				this.goToViewPage(selectedDb);
			}
		}

		return {selectedDb: selectedDb};
	}


	private goToViewPage(selectedDb:MetricCategory)
	{
		AmplitudeAnalytics.track(`XApp - Db - ${MetricCategory[selectedDb]}`);
		this.context.router.replace(`/${AbstractDBPage.getRootRouteName(this.props)}/${selectedDb}`);
	}

	private onDbSelect(category:MetricCategory)
	{
		if(this.getMyState().selectedDb !== category)
		{
			this.update_myStateProps({selectedDb: category});
			this.goToViewPage(category);
		}
	}

	componentWillReceiveProps(nextProps)
	{
		if(nextProps.children == null)
		{
			this.goToViewPage(this.getMyState().selectedDb);
		}
	}

	protected renderContent(data:IAbstractDbPageState):any
	{
		if(accountStatus.hasBillingIssue())
			return <BillingIssue/>;

		if(!accountStatus.isPro)
		{
			return <NeedPro pageName={this.getProPageName()}/>;
		}

		if (this.dbCategories.length == 0) {
			return <h2>{this.noCategoriesMsg()}</h2>;
		}

		return (
			<div>
				<AccountDbTabs categories={this.dbCategories} onSelect={this.onDbSelect.bind(this)} selected={data.selectedDb}/>
				<RowCol>
					{this.props.children}
				</RowCol>
			</div>
		);
	}


	static getRootRouteName(props: {routes?: PlainRoute[]})
	{
		const topRoute = props.routes[1];
		return topRoute.path;
	}


	protected abstract getSupportedCategories():MetricCategory[];
	protected abstract getProPageName();
	protected abstract noCategoriesMsg();
}