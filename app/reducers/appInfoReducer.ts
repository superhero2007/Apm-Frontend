import {IAppInfo} from "../apps/appListPage";
import {updateObj} from "./esReducer";

export interface IDeployKey {
	deployTime: number;
	appId     : string;
}

export interface IDeploy
{
	id              :IDeployKey;
	description     :string;
	username        :string;
	revision        :string;
}

interface IJVMVersionInfo
{
	id: string;
	host: string;
	version: string;
}

export interface IAgentVersionInfo
{
	currentAgentVersion: string;
	jvms: IJVMVersionInfo[];
}

export interface IRR_AppInfo
{
	app: IAppInfo;
	deploys: IDeploy[];
	features: string[];
	agentInfo: IAgentVersionInfo;
	versionWarningDismissed: boolean;
}

export function appInfoReducer(state={}, action)
{
	switch (action.type)
	{
		case APPINFO_SET:
			return updateObj(state, {app: action.app});
		case APPINFO_SETAPPLABEL:
		{
			const app = updateObj((<IRR_AppInfo>state).app, {label: action.label});
			return updateObj(state, {app: app});
		}
		case SET_DEPLOYS:
			return updateObj(state, {deploys: action.deploys});
		case SET_APP_FEATURES:
			return updateObj(state, {features: action.features});
		case SET_AGENTVERSIONINFO:
			return updateObj(state, {agentInfo: action.agentInfo, versionWarningDismissed: false});
		case DISMISS_AGENTWARNING:
			return updateObj(state, {versionWarningDismissed: true});
		case RESET:
			return updateObj(state, {app: null, deploys: []});
		default:
			return state;
	}

}


const APPINFO_SET = "APPINFO_SET";
const APPINFO_SETAPPLABEL = "APPINFO_SETAPPLABEL";
const SET_AGENTVERSIONINFO = "SET_AGENTVERSIONINFO";
const DISMISS_AGENTWARNING = "DISMISS_AGENTWARNING";
const SET_DEPLOYS = "SET_DEPLOYS";
const SET_APP_FEATURES = "SET_APP_FEATURES";
const RESET = "RESET";

export function action_setAppFeatures(features: string[])
{
	return {
		type: SET_APP_FEATURES,
		features
	};
}

export function action_setAppLabel(label: string)
{
	return {
		type: APPINFO_SETAPPLABEL,
		label
	};
}

export function action_setAppInfo(app: IAppInfo)
{
	return {
		type: APPINFO_SET,
		app
	};
}


export function action_dissmissAgentVersionWarning()
{
	return {
		type: DISMISS_AGENTWARNING
	};
}


export function action_setAgentInfo(agentInfo: IAgentVersionInfo)
{
	return {
		type: SET_AGENTVERSIONINFO,
		agentInfo
	};
}


export function action_setDeploys(deploys: IDeploy[])
{
	return {
		type: SET_DEPLOYS,
		deploys
	};
}



export function action_reset()
{
	return {
		type: RESET
	};
}