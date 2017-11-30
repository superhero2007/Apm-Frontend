import * as React from "react";
import * as _ from "lodash";
import {TraceWalker, TxnTrace, ITraceDetail, TraceProcessor, TraceSegment} from "./traceStructs";
import {IDSTabView} from "../../es/widgets/dsTabs";
import {updateComponentState} from "../../utils";
import {Row, Col, Button} from "react-bootstrap";
import {responseTimeDisplay, nanoToMilis} from "../../es/metricUtils";
import {StackTraceView} from "../../widgets/stackTraceView";


export class TxnTraceDetailView  extends React.Component<{trace: ITraceDetail},{}> implements IDSTabView
{
	render()
	{
		const trace = this.props.trace;
		const txnTrace = trace.trace;
		this.processTrace(txnTrace);

		const root = txnTrace.rootElement;

		let initialExpandCount = 0;
		let node = root;
		while(node.children && node.children.length ==1 && initialExpandCount < 20)
		{
			initialExpandCount++;
			node = node.children[0];
		}

		if(node.children && node.children.length > 0)
			initialExpandCount++;

		let asyncView;
		if(trace.asyncTopN)
		{
			const asyncTxnTrace = TraceProcessor.processAsyncStats(trace.asyncStats);
			const asyncRoot = asyncTxnTrace.rootElement;
			asyncView = (
				<div className="top2">
					<TxnSegmentView traceSeg={asyncRoot} indent={0} totalDuration={asyncRoot.duration} initialExpandCount={1}/>
				</div>
			);
		}
		return (
			<div>
				<TxnSegmentView traceSeg={root} indent={0} totalDuration={root.duration} initialExpandCount={initialExpandCount}/>

				{asyncView}
			</div>
		);
	}

	private processTrace(trace:TxnTrace)
	{
		new TraceWalker().acceptTrace(trace, (elem, parent)=>
		{
			elem.parent = parent;
			elem.hasStack = TraceProcessor.hasStackTrace(elem);
			if (_.isEmpty(elem.displayName))
			{
				if (elem.restHost != null)
					elem.displayName = elem.restHost;
				else if (elem.sql != null)
					elem.displayName = elem.sql;
				else if (elem.cqlop != null)
					elem.displayName = TraceProcessor.formatCQLOp(elem.cqlop);
				else
					elem.displayName = TraceProcessor.displayClassMethodName(elem.classMethodSig);
			}


			if (elem.children.length > 10)
			{

				var segmentGroups = _.groupBy(elem.children, (child)=>
				{
					return TraceProcessor.displayClassMethodName(child.classMethodSig)
				});

				var newChildren = [];
				for (var key in segmentGroups)
				{
					if (segmentGroups.hasOwnProperty(key))
					{

						var segments:TraceSegment[] = segmentGroups[key];
						if (segments.length > 1)
						{
							var combinedSeg = TraceProcessor.combineTraceSegments(segments);
							combinedSeg.cumulativeParent = true;
							combinedSeg.displayName += " - " + segments.length + " calls";
							newChildren.push(combinedSeg);
							combinedSeg.children = TraceProcessor.combineAndSortSegments(segments);
						}
						else
						{
							newChildren.push(segments[0]);
						}
					}
				}

				elem.children = newChildren;
			}


		});
	}
}

class TxnSegmentView extends React.Component<{
	traceSeg:TraceSegment;
	indent: number;
	totalDuration:  number;
	initialExpandCount: number;
},{
	expanded: boolean;
	stackVisible:   boolean;
}>
{
	constructor(props,context)
	{
		super(props, context);

		let expand = false;
		if(this.props.initialExpandCount > 0)
		{
			expand = true;
		}

		this.state = {expanded: expand, stackVisible: false};

	}

	private onExpandClick()
	{
		if(this.hasChildren())
		{
			const expand = !this.state.expanded;
			updateComponentState(this, {expanded: expand, stackVisible: false});
		}
	}

	private onStackVisibleClick()
	{
		updateComponentState(this, {stackVisible: !this.state.stackVisible});
	}

	render()
	{
		let children;
		if(this.state.expanded && this.hasChildren())
		{
			let i = 0;
			children = this.props.traceSeg.children.map(c => <TxnSegmentView key={++i} traceSeg={c} indent={this.props.indent+1} totalDuration={this.props.totalDuration} initialExpandCount={this.props.initialExpandCount-1}/>);
		}


		return (
			<div>
				{this.renderSegmentRow(this.props.traceSeg)}
				{children}
			</div>
		);
	}

	private renderStackTrace(seg: TraceSegment)
	{
		const stack = TraceProcessor.stackTrace(seg);
		const style = {
			borderBottom:   "1px solid #bdb6b6",
			padding:        "2em 0"
		};
		return <div style={style}><StackTraceView stack={stack}/></div>;
	}

	private renderSegmentRow(seg: TraceSegment)
	{
		let icon;
		if(this.hasChildren())
		{
			const iconName = this.state.expanded? "fa-minus-square-o":"fa-plus-square-o";
			icon = <i className={`fa ${iconName}`}/>;
		}

		let stackTraceBtn;
		if(seg.hasStack)
		{
			stackTraceBtn = <Button bsSize="xsmall" onClick={this.onStackVisibleClick.bind(this)}>StackTrace</Button>;
		}

		let stackTrace;
		if(this.state.stackVisible)
		{
			stackTrace = this.renderStackTrace(seg);
		}
		const pctDuration = ((seg.duration * 100)/this.props.totalDuration);

		const innerStyle = {
			paddingLeft: `${this.props.indent}em`
		};

		const style = {
			borderBottom:   "1px solid #bdb6b6",
			padding:        "1em 0"
		};
		return (
			<div>
				<div style={style}>
					<Row>
						<Col xs={9} className="dsCodeBlock aLink" onClick={this.onExpandClick.bind(this)} >
							<span style={innerStyle}>{icon} {seg.displayName}</span>
						</Col>
						<Col xs={1}>
							{responseTimeDisplay(nanoToMilis(seg.duration))}
						</Col>
						<Col xs={1}>
							<InTableProgressBar pct={pctDuration}/>
						</Col>
						<Col xs={1}>
							{stackTraceBtn}
						</Col>
					</Row>
				</div>
				{stackTrace}
			</div>
		);
	}

	private hasChildren()
	{
		return !_.isEmpty(this.props.traceSeg.children);
	}
}

class InTableProgressBar extends React.Component<{
	pct: number;
}, {}>
{
	render()
	{
		const progressStyle = {
			width: `${this.props.pct}%`
		};
		return (
			<div className="progress" style={({height:"10px"})}>
				<div className="progress-bar progress-bar-success" style={progressStyle}/>
			</div>
		);
	}
}
