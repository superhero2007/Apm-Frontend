import * as React from "react";
import * as PropTypes from "prop-types";
import * as _ from "lodash";
import {IPinnedTxnComponentProps, PinnedTxnList} from "./pinnedTxnList";
import {Col, Row} from "react-bootstrap";
import {PinnedTxnDetail} from "./pinnedTxnDetail";
import {TimeRangeFilter} from "../filters/timeRangeFilter";
import {RowCol} from "../../widgets/rowCol";
import {IStore} from "../../reduxSetup";
import {connect} from "react-redux";
import {action_initPinnedTxn, IPinnedTxn, IRR_PinnedTxnReducer} from "../../reducers/pinnedTxnReducer";
import {TimeRange} from "../filters/timerange";
import {AmplitudeAnalytics} from "../../analytics";
import {JSONEncoder} from "../routeobj/jsonEncoder";
import {PinnedTxnOverviewPage_getDefaultTabState} from "./pinnedTxnOverview";
import {DSTabType} from "../widgets/dsTabs";
import {LoadableComponent} from "../../widgets/loadableComponent";
import {NeedPro} from "../../widgets/needPro";
import {accountStatus} from "../../accountStatus";
import {BillingIssue} from "../../widgets/billingIssue";
import {pinnedTxnConnector, routablePinnedTxnConnector} from "../../reduxConnectors";


export class PinnedTxnPage extends React.Component<{children?:any}, {}>
{
	constructor(props, context)
	{
		super(props, context);
		AmplitudeAnalytics.track("Pinned Txns Tab");
	}

	render()
	{
		if(accountStatus.hasBillingIssue())
			return <BillingIssue/>;

		return (
			<div>
				<RowCol>
					{this.props.children}
				</RowCol>
			</div>
		);
	}
}

export interface IRoutablePinnedTxnProps extends IPinnedTxnComponentProps
{
	filterJSON: string;
}


export function PinnedTxnContainerPage_getDefaultRouteObj(): string
{
	const rr:IRR_PinnedTxnReducer = {txn: null, timeRange: TimeRange.defaultRange.serialize(), jvmFilter: null, tab:{
		type: DSTabType.overview,
		state: PinnedTxnOverviewPage_getDefaultTabState()
	}};
	return JSONEncoder.encode(rr);
}

class PinnedTxnContainerPage_connect extends React.Component<IRoutablePinnedTxnProps,{}>
{
	static contextTypes:any = {
		router: PropTypes.any.isRequired
	};

	context:any;

	componentWillMount()
	{
		this.initPinnedRR(this.props.filterJSON);
	}

	componentWillUnmount()
	{
		this.initPinnedRR(PinnedTxnContainerPage_getDefaultRouteObj());
	}

	private initPinnedRR(json:string)
	{
		const pinnedRRR:IRR_PinnedTxnReducer = JSONEncoder.decode(json);
		this.props.dispatch(action_initPinnedTxn(pinnedRRR));
	}


	componentWillReceiveProps(nextProps:IRoutablePinnedTxnProps)
	{
		const nextEsDetail = nextProps.pinnedTxnRedr;
		const curESDetail = this.props.pinnedTxnRedr;

		const encodedNewJSON = JSONEncoder.encode(nextEsDetail);
		if(encodedNewJSON !== JSONEncoder.encode(curESDetail))
		{
			this.context.router.replace(`/pinned/${encodedNewJSON}`);
		}
	}

	render()
	{
		if(!accountStatus.isPro)
			return <NeedPro pageName={"Pinned Transactions"} />;

		return <PinnedTxnContentPage/>;
	}
}

interface IState
{
	pinnedTxns:IPinnedTxn[]
}


class PinnedTxnContentPage_connect extends LoadableComponent<IPinnedTxnComponentProps,IState>
{
	protected initialState():IState
	{
		return {pinnedTxns: []};
	}

	protected getPostUrl():string
	{
		return "/pin/list/all"
	}

	protected getStateFromPostResponse(reponseData:any):IState
	{
		const txns:IPinnedTxn[] = reponseData;

		return {pinnedTxns: txns};
	}
	protected renderContent(data:IState):any
	{
		if(_.isEmpty(data.pinnedTxns))
		{
			return (
				<div>
					<h4>No Pinned Txns</h4>
					<h4>'Pin' a transaction to see it here</h4>
				</div>
			);
		}

		let txnDetail;

		if(this.props.pinnedTxnRedr.txn)
		{
			txnDetail = <PinnedTxnDetail/>;
		}
		else {
			txnDetail = <div></div>;
		}
		return (
			<div>
				<RowCol>
					<TimeRangeFilter redrName="pinnedTxnRedr"/>
				</RowCol>
				<Row className="top2">
					<Col xs={4}>
						<PinnedTxnList txns={data.pinnedTxns}/>
					</Col>
					<Col xs={8}>
						{txnDetail}
					</Col>
				</Row>
			</div>
		);
	}

}

const PinnedTxnContentPage = connect((state)=> pinnedTxnConnector(state))(PinnedTxnContentPage_connect);
export const PinnedTxnContainerPage = connect((state, props:any)=> routablePinnedTxnConnector(state, props))(PinnedTxnContainerPage_connect);