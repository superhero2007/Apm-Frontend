import * as React from "react";
import {NeedPro} from "../../widgets/needPro";
import {accountStatus} from "../../accountStatus";
import {connect} from "react-redux";
import {IStore} from "../../reduxSetup";
import {IAppPageProps} from "./applicationPage";
import {AmplitudeAnalytics} from "../../analytics";
import {RealtimePage} from "../realtime/realtime";
import {appPageConnector} from "../../reduxConnectors";



class App_RealtimePage_connect extends React.Component<IAppPageProps, {}>
{
	constructor(props, context)
	{
		super(props, context);
		AmplitudeAnalytics.track("App - Live Page");
	}

	render()
	{
		if(!accountStatus.isPro)
			return <NeedPro pageName={"Live Data"}/>;

		const appInfo = this.props.appInfo;

		return (
			<div>
				<RealtimePage appId={appInfo.app.id}/>
			</div>
		);
	}
}

export const App_RealtimePage = connect((state)=> appPageConnector(state))(App_RealtimePage_connect);