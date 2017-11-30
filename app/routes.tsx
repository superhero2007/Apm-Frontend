import * as React from "react";
import {hashHistory, Redirect, Route, Router} from "react-router";
import {AppPage} from "./appPage";
import {PolicyListPage} from "./alerts/policies/policyListPage";
import {ConditionsPage} from "./alerts/policies/detail/conditionsPage";
import {PolicyDetailPage} from "./alerts/policies/detail/policyDetailPage";
import {ViolationsListPage} from "./alerts/policies/detail/violationsListPage";
import {IncidentsPage} from "./alerts/policies/detail/incidentsPage";
import {IncidentDetailPage} from "./alerts/policies/detail/incident/incidentDetailPage";
import {AddPolicyPage} from "./alerts/policies/addPolicy";
import {PolicySettingsPage} from "./alerts/policies/detail/policySettingsPage";
import {AddConditionPage} from "./alerts/policies/detail/condition/addCondition";
import {AddConditionForMetricPage} from "./alerts/policies/detail/condition/addConditionForMetric";
import {EditConditionPage} from "./alerts/policies/detail/condition/editCondition";
import {Provider} from "react-redux";
import {store} from "./reduxSetup";
import {syncHistoryWithStore} from "react-router-redux";
import {NotificationSettingsPage} from "./alerts/policies/detail/notificationsPage";
import {MainAlertsPage} from "./alerts/MainAlertsPage";
import {IntegrationsPage} from "./alerts/integrations/integrationsPage";
import {AddSlackPage} from "./alerts/integrations/slack/addSlackPage";
import {AddOGPage} from "./alerts/integrations/og/addOGPage";
import {ESPage} from "./es/esPage";
import {AddVictorOpsPage} from "./alerts/integrations/victorOps/addVictorOpsPage";
import {AddWebhookPage} from "./alerts/integrations/webhook/addWebhookPage";
import {AddHipchatPage} from "./alerts/integrations/hipchat/addHipchatPage";
import {AddDataDogPage} from "./alerts/integrations/datadog/addDataDogPage";
import {ESContainerPage} from "./es/esContainerPage";
import {DBPage} from "./es/db/dbPage";
import {MetricCategory} from "./reducers/esReducer";
import {AbstractContainerPage} from "./es/abstractContainerPage";
import {DbView} from "./es/db/dbView";
import {DBContainerPage} from "./es/db/dbContainerPage";
import {MtcListPage} from "./alerts/mtc/mtcListPage";
import {AppListPage} from "./apps/appListPage";
import {AddJVMPage} from "./apps/addJVMPage";
import {JVMMainTabPage} from "./apps/jvmMainTabPage";
import {AWSPage} from "./es/aws/awsPage";
import {ErrPage} from "./es/err/errPage";
import {ErrContainerPage} from "./es/err/errContainerPage";
import {PinnedTxnContainerPage, PinnedTxnContainerPage_getDefaultRouteObj, PinnedTxnPage} from "./es/pinned/pinnedTxnPage";
import {ApplicationPage} from "./apps/main/applicationPage";
import {AppFrame} from "./apps/main/appFrame";
import {LiveXAppPage} from "./apps/realtime/liveXapp";
import {AccHostInfo} from "./apps/accInfo";
import {AccountMainPage} from "./account/accountMainPage";
import {AccountProfilePage} from "./account/accProfilePage";
import {AccountUsersPage} from "./account/accUsers";
import {InvoiceListPage, InvoiceUsageDetailsPage, InvoiceView} from "./account/invoices";
import {BillingPage, SubscribeProPage} from "./account/billing";
import {SizeBilling_CurrentUsage} from "./account/sizeBilling";
import {ServerPageFrame, ServerPageTopLevel, ServerPageTopLevel_getDefaultRouterJSON} from "./server/serverPageFrame";
import {AddServerTopLevelPage} from "./server/addServerPage";


const history = syncHistoryWithStore(hashHistory, store);

export const routes = (
	<Provider store={store}>
		<Router history={history}>
			<Redirect from="/" to="/jvms"/>
			<Route path="/" component={AppPage}>
				<Redirect from="/policies" to="/alerts/policies"/>


				<Redirect from="/alerts" to="/alerts/policies"/>
				<Route path="alerts" component={MainAlertsPage}>
					<Route path="policies" component={PolicyListPage}/>
					<Route path="integrations" component={IntegrationsPage}/>
					<Route path="addSlack" component={AddSlackPage}/>
					<Route path="addOG" component={AddOGPage}/>
					<Route path="addVictorOps" component={AddVictorOpsPage}/>
					<Route path="addWebhook" component={AddWebhookPage}/>
					<Route path="addHipChat" component={AddHipchatPage}/>
					<Route path="addDataDog" component={AddDataDogPage}/>
					<Route path="mtcs" component={MtcListPage}/>
				</Route>

				<Route path="addPolicy" component={AddPolicyPage}/>
				<Redirect from="policy/:policyId" to="policy/:policyId/incidents"/>
				<Route path="policy/:policyId" component={PolicyDetailPage}>
					<Route path="incidents" component={IncidentsPage}/>
					<Route path="violations" component={ViolationsListPage}/>
					<Route path="conditions" component={ConditionsPage}/>
					<Route path="notifications" component={NotificationSettingsPage}/>
					<Route path="addCondition" component={AddConditionPage}/>
					<Route path="addConditionForMetric/:jsonData" component={AddConditionForMetricPage}/>
					<Route path="incident/:incidentId" component={IncidentDetailPage}/>
					<Route path="settings" component={PolicySettingsPage}/>
					<Route path="condition/:conditionId" component={EditConditionPage}/>
				</Route>


				<Redirect from="/es" to={`/es/${AbstractContainerPage.getDefaultRouteObj(MetricCategory.Rest)}`}/>
				<Route path="es" component={ESPage}>
					<Route path=":filterJSON" component={ESContainerPage}/>
				</Route>

				<Route path="db" component={DBPage}>
					<Route path=":db" component={DbView}>
						<Route path=":filterJSON" component={DBContainerPage}/>
					</Route>
				</Route>

				<Route path="aws" component={AWSPage}>
					<Route path=":db" component={DbView}>
						<Route path=":filterJSON" component={DBContainerPage}/>
					</Route>
				</Route>

				<Redirect from="/errors" to={`/errors/${AbstractContainerPage.getDefaultRouteObj(MetricCategory.Exception)}`}/>
				<Route path="errors" component={ErrPage}>
					<Route path=":filterJSON" component={ErrContainerPage}/>
				</Route>

				<Redirect from="/pinned" to={`/pinned/${PinnedTxnContainerPage_getDefaultRouteObj()}`}/>
				<Route path="pinned" component={PinnedTxnPage}>
					<Route path=":filterJSON" component={PinnedTxnContainerPage}/>
				</Route>

				<Redirect from="/jvms" to="/jvms/apps"/>
				<Route path="jvms" component={JVMMainTabPage}>
					<Route path="apps" component={AppListPage}/>
				</Route>
				<Route path="addjvm" component={AddJVMPage}/>

				<Route path="/app/:appId" component={ApplicationPage}>
					<Route path=":appJSON" component={AppFrame}/>
				</Route>

				<Route path="live" component={LiveXAppPage}/>
				<Route path="accinternal" component={AccHostInfo}/>

				<Redirect from="/account" to="/account/profile"/>
				<Route path="account" component={AccountMainPage}>
					<Route path="profile" component={AccountProfilePage}/>
					<Route path="users" component={AccountUsersPage}/>
					<Route path="invoices" component={InvoiceListPage}/>
					<Route path="billing" component={BillingPage}/>
					<Route path="usage" component={AccHostInfo}/>

					<Route path="invoicedetails/:periodEnd" component={InvoiceUsageDetailsPage}/>
					<Route path="invoiceview/:periodEnd" component={InvoiceView}/>
				</Route>

				<Route path="upgrade" component={SubscribeProPage}/>
				<Route path="devbill" component={SizeBilling_CurrentUsage}/>

				<Redirect from="/servers" to={`/servers/${ServerPageTopLevel_getDefaultRouterJSON()}`}/>
				<Route path="servers" component={ServerPageTopLevel}>
					<Route path=":serverJSON" component={ServerPageFrame}/>
				</Route>

				<Route path="addserver" component={AddServerTopLevelPage}/>

			</Route>
		</Router>
	</Provider>
);
