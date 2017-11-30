import * as React from "react";
import * as _ from "lodash";
import {LoadableComponent} from "./../../widgets/loadableComponent";
import {MtcListTable} from "./mtcListTable";
import {accountStatus} from "../../accountStatus";
import {NeedPro} from "../../widgets/needPro";

export interface IMtcKey
{
	appId   :string; //is name actually
	beginTime   :number; //in seconds
}
export interface IMtc
{
	id: IMtcKey;
	endTime: number;
	username: string;
	reason: string;
}

interface IState
{
	items:IMtc[];
}

export class MtcListPage extends LoadableComponent<{},IState>
{
	protected initialState():IState
	{
		return {items: []};
	}

	protected getStateFromPostResponse(reponseData:IMtc[]):IState
	{
		return {items: reponseData};
	}

	protected getPostUrl():string
	{
		return "/mtcs/list";
	}

	protected renderContent(data:IState):any
	{
		if(!accountStatus.isPro)
		{
			return <NeedPro pageName="Maintenance Mode"/>
		}

		var content;
		if (_.isEmpty(data.items)) {
			content = (
				<div>
					<h3>No Maintenances of late...</h3>
					<br/>
					<h4>You can start/stop maintenance by calling our REST API.</h4>
					<h4>
						<a href="https://chronon.atlassian.net/wiki/display/DRIP/Using+Maintenance+Mode" target="_blank">Read Documentation</a> for details.
					</h4>
				</div>
			);
		}
		else {
			content = <MtcListTable items={data.items}/>;
		}

		return (
			<div className="container-full">
				{content}
			</div>
		);
	}
}