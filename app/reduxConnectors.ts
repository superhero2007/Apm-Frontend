import {IStore} from "./reduxSetup";
import {ISvrPageProps} from "./server/serverPageFrame";
import {IESViewProps} from "./es/esViews";
import {IRoutableESProps} from "./es/abstractContainerPage";
import {IReducerProps, ITimeRangeProps} from "./es/filters/timeRangeFilter";
import {IAppESPageProps} from "./apps/main/es";
import {IAppPageProps} from "./apps/main/applicationPage";
import {IAppErrPageProps} from "./apps/main/errors";
import {IAppJVMPageProps} from "./apps/main/jvmStats";
import {IAppOverviewPageProps} from "./apps/main/overview";
import {IPinnedTxnComponentProps} from "./es/pinned/pinnedTxnList";
import {IRoutablePinnedTxnProps} from "./es/pinned/pinnedTxnPage";
import {IAppTxnPageProps} from "./apps/main/txn";
import {IAppFrameProps} from "./apps/main/appFrame";

export function serverPageConnector(state: IStore): ISvrPageProps
{
	return {
		serverPage: state.serverPage,
		timeRangeFilter: state.timeRangeFilter,
		hostFilter: state.hostFilter
	};
}

export function serverPageConnectorWithProps<T extends object>(state: IStore, myProps: T): ISvrPageProps & T
{
	return connectorWithProps(state, myProps, serverPageConnector);
}

export function esDetailConnector(state:IStore): IESViewProps
{
	return {
		esDetail: state.esDetail
	};
}

export function esDetailConnectorWithProps<T extends object>(state:IStore, myProps: T): IESViewProps & T
{
	return connectorWithProps(state, myProps, esDetailConnector);
}

export function routableEsDetailConnector(state:IStore, props): IRoutableESProps
{
	return {
		filterJSON: props.params.filterJSON,
		esDetail: state.esDetail
	};
}
export function timeRangeConnector(state:IStore, props: ITimeRangeProps): ITimeRangeProps & IESViewProps & IReducerProps
{
	return Object.assign({},{
		esDetail: state.esDetail,
		timeRangeFilter: state.timeRangeFilter,
		app:    state.app,
		pinnedTxnRedr: state.pinnedTxnRedr,
	}, props)
}

export function appESConnector(state:IStore): IAppESPageProps {
	return {
		appInfo: state.appInfo,
		app:    state.app,
		appES: state.appES
	};
}

export function appESConnectorWithProps<T extends object>(state:IStore, myProps:T): IAppESPageProps & T {
	return connectorWithProps(state, myProps, appESConnector);
}

export function appPageConnector(state:IStore): IAppPageProps {
	return {
		appInfo: state.appInfo,
		app:    state.app,
	};
}

export function appErrorConnector(state:IStore): IAppErrPageProps {
	return {
		appInfo: state.appInfo,
		app:    state.app,
		appErr: state.appErr
	};
}

export function appErrorConnectorWithProps<T extends object>(state:IStore, myProps:T): IAppErrPageProps & T {
	return connectorWithProps(state, myProps, appErrorConnector);
}


export function appJVMConnector(state:IStore): IAppJVMPageProps {
	return {
		appInfo: state.appInfo,
		app:    state.app,
		appJVM: state.appJVM
	};
}

export function appOverviewConnector(state:IStore): IAppOverviewPageProps {
	return {
		appInfo: state.appInfo,
		app:    state.app,
		appOverview: state.appOverview
	};
}

export function appOverviewConnectorWithProps<T extends object>(state:IStore, myProps:T): IAppOverviewPageProps & T {
	return connectorWithProps(state, myProps, appOverviewConnector);
}


export function pinnedTxnConnector(state:IStore): IPinnedTxnComponentProps {
	return {
		pinnedTxnRedr: state.pinnedTxnRedr
	};
}

export function routablePinnedTxnConnector(state:IStore, props): IRoutablePinnedTxnProps {
	return {
		pinnedTxnRedr: state.pinnedTxnRedr,
		filterJSON: props.params.filterJSON
	};
}

export function pinnedTxnConnectorWithProps<T extends object>(state:IStore, myProps:T): IPinnedTxnComponentProps & T {
	return connectorWithProps(state, myProps, pinnedTxnConnector);
}

export function appTxnConnector(state:IStore): IAppTxnPageProps {
	return {
		appInfo: state.appInfo,
		app:    state.app,
		appTxn: state.appTxn
	};
}

export function connectorWithProps<P extends object, S>(state:IStore, myProps: P, connector: (state:IStore)=>S): S & P {
	return Object.assign({}, connector(state), myProps);
}

export function appIdConnector(state:IStore,props) {
	return {
		appInfo: state.appInfo,
		app:    state.app,
		appId: props.params.appId
	};
}

export function appFrameConnector(state:IStore, props): IAppFrameProps  {
	return {
		appJSON: props.params.appJSON,
		appInfo: state.appInfo,
		app:    state.app,
		appOverview: state.appOverview,
		appTxn: state.appTxn,
		appES:  state.appES,
		appErr: state.appErr,
		appJVM: state.appJVM
	};
}