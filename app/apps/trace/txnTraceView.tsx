import * as React from "react";
import {ITraceDetail, TraceProcessor, TraceTopNElem} from "./traceStructs";
import {RowCol} from "../../widgets/rowCol";
import {Row, Col} from "react-bootstrap";
import {AlertUtils} from "../../alerts/AlertUtils";
import * as moment from "moment";
import {responseTimeDisplay, nanoToMilis} from "../../es/metricUtils";
import {DSTabViewManager, DSTabViewInfo, DSTabType, IDSTabView, TabStyle, DSTabs} from "../../es/widgets/dsTabs";
import {updateComponentState} from "../../utils";
import {DSTable} from "../../widgets/dsTable";
import {IPctMetric, PctBarChart} from "../../es/charts/pctBarChart";
import * as _ from "lodash";
import {StackTraceView} from "../../widgets/stackTraceView";
import {TxnTraceDetailView} from "./txnTraceStackView";
import {JVMDetail} from "../main/jvmDetail";

export class TxnTraceView extends React.Component<{
	trace: ITraceDetail;
	app: string;
	txn: string;
	duration: number;
},{
	curTab: DSTabType;
}>
{
	constructor(props,context)
	{
		super(props,context);
		this.state = {curTab: DSTabType.overview};
	}

	private tabViewManager = new DSTabViewManager([
		new DSTabViewInfo(DSTabType.overview, TxnTraceOverview),
		new DSTabViewInfo(DSTabType.details, TxnTraceDetailView),
		new DSTabViewInfo(DSTabType.jvmDetails, TxnTraceJVMView),
		new DSTabViewInfo(DSTabType.exception, TxnTraceExceptionView),
		new DSTabViewInfo(DSTabType.requestParams, TxnTraceRequestParamsView),
		new DSTabViewInfo(DSTabType.customAttr, TxnTraceCustomAttrView)
	]);

	private renderHeader()
	{
		const trace = this.props.trace;

		const prevMin = (moment as any).unix(trace.timeStamp).subtract(1,'m').utc()/1000;
		return (
				<RowCol>
					<Row>
						<Col xs={2}>
							<b>App:</b>
						</Col>
						<Col xs={2}>
							{this.props.app}
						</Col>
						<Col xs={2}>
							<b>Txn:</b>
						</Col>
						<Col xs={4}>
							{this.props.txn}
						</Col>
					</Row>

					<Row>
						<Col xs={2}>
							<b>Host:</b>
						</Col>
						<Col xs={2}>
							{trace.host}
						</Col>

						<Col xs={2}>
							<b>HTTP Response Code:</b>
						</Col>
						<Col xs={2}>
							{trace.statusCode}
						</Col>

					</Row>

					<Row>
						<Col xs={2}>
							<b>Duration:</b>
						</Col>
						<Col xs={2}>
							{responseTimeDisplay(this.props.duration)}
						</Col>
						<Col xs={2}>
							<b>Server TimeStamp:</b>
						</Col>
						<Col xs={2}>
							{AlertUtils.humanize_unixtime(trace.serverTimestamp)}
						</Col>

						<Col xs={2}>
							<b>Collection Time Range:</b>
						</Col>
						<Col xs={2}>
							{AlertUtils.humanize_unixtime(prevMin) + " - "+AlertUtils.humanize_unixtime(trace.timeStamp)}
						</Col>
					</Row>

				</RowCol>
		);
	}

	private onSelectTab(tabType:DSTabType)
	{
		updateComponentState(this, {curTab: tabType});
	}

	render()
	{
		const View = this.tabViewManager.getView(this.state.curTab) as any;
		return (
			<div>
				{this.renderHeader()}
				<hr/>
				<div className="bottom2">
					<DSTabs activeTab={this.state.curTab} tabs={this.tabViewManager.getAllTabTypes()} onSelect={this.onSelectTab.bind(this)} style={TabStyle.tabs}/>
				</div>
				<View trace={this.props.trace}/>
			</div>
		);
	}
}

abstract class AbstractAttrView extends React.Component<{trace: ITraceDetail},{}> implements IDSTabView
{
	protected renderRows(attributes)
	{
		const rows = [];
		_.forOwn(attributes, (val, key)=>
		{
			rows.push(
				<Row key={key} className="bottom1">
					<Col xs={3}>
						<b>{key}</b>
					</Col>
					<Col xs={4}>
						<code>{val}</code>
					</Col>
				</Row>
			);
		});

		return (
			<div>
				{rows}
			</div>
		);
	}
}

class TxnTraceCustomAttrView extends AbstractAttrView
{
	render()
	{
		const attrs = this.props.trace.customAttributes;

		if(_.isEmpty(attrs))
			return <h3>No Custom Attributes</h3>;

		return this.renderRows(attrs);
	}
}

class TxnTraceRequestParamsView extends AbstractAttrView
{
	render()
	{
		const attrs = this.props.trace.requestParams;

		if(_.isEmpty(attrs))
			return <h3>No Request Parameters</h3>;

		return this.renderRows(attrs);
	}
}

class TxnTraceOverview extends React.Component<{trace: ITraceDetail},{}> implements IDSTabView
{

	renderBreakdownTable(elems:TraceTopNElem[])
	{
		return (
			<DSTable columnNames={["Name", "Calls", "Total Time Spent"]} noBorder={false}>
				{elems.map(t => <tr key={t.sig}>
					<td>{this.displayableSig(t)}</td>
					<td>{t.count}</td>
					<td>{responseTimeDisplay(nanoToMilis(t.duration))}</td>
				</tr>)}
			</DSTable>
		);
	}

	renderPctGraph(elems:TraceTopNElem[])
	{
		const pctMetrics:IPctMetric[] = elems.map(e => ({name: this.displayableSig(e), value:e.duration}));
		return <PctBarChart stats={pctMetrics}/>;
	}

	render()
	{
		const topN = this.props.trace.topN;
		const hasAsync = this.props.trace.asyncTopN !=null;

		const elems = topN.sortedElems;

		if(hasAsync)
		{
			const asyncElems = this.props.trace.asyncTopN.sortedElems;

			return (
				<RowCol>
					<h3>Synchronous Segments</h3>
					{this.renderPctGraph(elems)}
					<h3>Asynchronous Segments</h3>
					{this.renderPctGraph(asyncElems)}

					<h3>Synchronous Segments Breakdown</h3>
					{this.renderBreakdownTable(elems)}
					<h3>Asynchronous Segments Breakdown</h3>
					{this.renderBreakdownTable(asyncElems)}
				</RowCol>
			);
		}

		return (
			<RowCol>
				{this.renderPctGraph(elems)}

				<h3>Trace Breakdown</h3>
				{this.renderBreakdownTable(elems)}
			</RowCol>
		);
	}

	private displayableSig(elem:TraceTopNElem)
	{
		return elem.isSig ? TraceProcessor.displayClassMethodName(elem.sig) : elem.sig;
	}
}


class TxnTraceExceptionView extends React.Component<{trace: ITraceDetail},{}> implements IDSTabView
{
	render()
	{
		const exceptionData = this.props.trace.exceptionData;
		if(!exceptionData)
			return <h4>No Exception</h4>;

		return (
			<div>
				<RowCol>
					<h3>{exceptionData.cl}</h3>
				</RowCol>
				<hr/>
				<RowCol>
					<h4>Exception Message:</h4>
				</RowCol>
				<RowCol className="top2 dsCodeBlock">
					{exceptionData.ms}
				</RowCol>
				<hr/>
				<RowCol>
					<h4>Stack Trace:</h4>
				</RowCol>
				<RowCol className="top2">
					<StackTraceView stack={exceptionData.stack}/>
				</RowCol>
			</div>
		);
	}
}


class TxnTraceJVMView extends React.Component<{trace: ITraceDetail},{}> implements IDSTabView
{
	render()
	{
		return <JVMDetail jvmDetail={this.props.trace.jvmDetail} dispatch={null}/>;
	}
}

