import {applyMiddleware, combineReducers, compose, createStore} from "redux";
import {routerReducer} from "react-router-redux";
import {policyDetailReducer} from "./reducers/policyReducer";
import {esDetailReducer, IRR_ESDETAIL} from "./reducers/esReducer";
import {IRR_PinnedTxnReducer, pinnedTxnReducer} from "./reducers/pinnedTxnReducer";
import {appInfoReducer, IRR_AppInfo} from "./reducers/appInfoReducer";
import {
	appErrReducer,
	appESReducer,
	appJVMReducer,
	appOverviewReducer,
	appReducer,
	appTxnReducer,
	IRR_App,
	IRR_App_Err,
	IRR_App_ES,
	IRR_App_JVM,
	IRR_App_Txn,
	IRR_AppOverview
} from "./reducers/appReducer";
import {IRR_Filter_TimeRange, timeRangeReducer} from "./reducers/timerangeReducer";
import {hostFilterReducer, IRR_Filter_Host} from "./reducers/hostFilterReducer";
import {IRR_ServerPage, serverPageReducer} from "./reducers/serverPageReducer";


/////////////////////////////////////////////////////
//middlewares
function thunkMiddleware({dispatch, getState})
{
	return (next: any) => (action: any) =>
		typeof action === "function" ?
			action(dispatch, getState) :
			next(action);
}

/////////////////////////////////////////////////////

export interface IStore {
	routing;
	policyDetail;
	esDetail: IRR_ESDETAIL;
	pinnedTxnRedr: IRR_PinnedTxnReducer;
	appInfo: IRR_AppInfo;
	app: IRR_App;
	appOverview: IRR_AppOverview;
	appTxn: IRR_App_Txn;
	appES:  IRR_App_ES;
	appErr: IRR_App_Err;
	appJVM: IRR_App_JVM;
	timeRangeFilter: IRR_Filter_TimeRange;
	hostFilter: IRR_Filter_Host;
	serverPage: IRR_ServerPage;
}

//1. prepare root reducer
const rootReducer = combineReducers({
	routing: routerReducer,
	policyDetail: policyDetailReducer,
	esDetail:   esDetailReducer,
	pinnedTxnRedr: pinnedTxnReducer,
	appInfo:    appInfoReducer,
	app:        appReducer,
	appOverview: appOverviewReducer,
	appTxn:      appTxnReducer,
	appES:      appESReducer,
	appErr:     appErrReducer,
	appJVM:     appJVMReducer,
	timeRangeFilter: timeRangeReducer,
	hostFilter: hostFilterReducer,
	serverPage: serverPageReducer
});

declare var process: any;
declare var require: any;

let enhancer;

if (process.env.NODE_ENV !== 'production')
{

	const DevTools = require('./devTools').DevTools;
	enhancer = compose(
		applyMiddleware(thunkMiddleware),
		DevTools.instrument()
	);
}
else
{
	enhancer = compose(
		applyMiddleware(thunkMiddleware)
	);
}


export  function configureStore(initialState?) {
	return createStore(rootReducer, initialState, enhancer);
}

export const store = configureStore();

