import * as React from "react";
import * as _ from "lodash";
import {LoadableComponent} from "../../widgets/loadableComponent";
import {updateComponentState} from "../../utils";
import {Row, Button, Col} from "react-bootstrap";
import {RowCol} from "../../widgets/rowCol";
import {AlertUtils} from "../../alerts/AlertUtils";
import {IProfilingSession} from "./appProfiler";
import {Http} from "../../http";
declare const require: any;
const pako = require('pako');

interface ISampledNode
{

}
interface IProps
{
	profileSession: IProfilingSession;
	onClose: ()=>void;
}

interface IState
{
	profileData: ISampledNode[];
}

export class SampledProfileViewer extends LoadableComponent<IProps, IState>
{
	protected initialState(): IState
	{
		return {profileData: null};
	}

	getPromiseToLoad(props?: IProps): Promise<any>
	{
		return Http.postJSONRecvBinary("/profiler/session/data", {profileId: this.props.profileSession.id});
	}

	protected getStateFromPostResponse(responseData: any): IState
	{
		try
		{

			const data = responseData.target.response;
			var output = pako.inflate(new Uint8Array(data),  {to: 'string'});
		} catch (err)
		{
			console.log(err);
		}
		const json = JSON.parse(output);
		return {profileData: json};
	}

	protected renderContent(data: IState): any
	{
		return (
			<div>
				<RowCol>
					<Button onClick={this.props.onClose}>{"< Back"}</Button>
				</RowCol>
				<Row className="top2">
					<Col xs={1}>
						<b>Host:</b>
					</Col>
					<Col xs={3}>
						{this.props.profileSession.host}
					</Col>
					<Col xs={1}>
						<b>Started By:</b>
					</Col>
					<Col xs={3}>
						{this.props.profileSession.username}
					</Col>
				</Row>
				<Row className="top2">
					<Col xs={1}>
						<b>Started At:</b>
					</Col>
					<Col xs={3}>
						{AlertUtils.humanize_unixtime(this.props.profileSession.begintime)}
					</Col>
					<Col xs={1}>
						<b>Duration:</b>
					</Col>
					<Col xs={3}>
						{this.props.profileSession.durationms/60000 + " minute(s)"}
					</Col>
				</Row>
				<RowCol className="top2">
					<ProfilerStackList stackNodes={data.profileData} indent={0}/>
				</RowCol>
			</div>
		);
	}

}

enum NodeRank
{
	FIRST,
	SECOND,
	OTHER
}

interface IProfiledNode
{
	cls: string;
	method: string;
	line: number;
	samples: number;
	children: any[];
}

class ProfilerStackList extends React.Component<{
	stackNodes: any[];
	indent: number;
}, {}>
{
	render()
	{
		const nodes: IProfiledNode[] = this.props.stackNodes.map(n => ({
			cls: n[0],
			method: n[1],
			line: n[2],
			samples: n[3],
			children: n[4]
		}));

		const totalSamples = _.sumBy(nodes, n => n.samples);

		const sortedNodes = _.reverse(_.sortBy(nodes, n => n.samples));

		let first, second;
		for(const n of sortedNodes)
		{
			const pct = Math.round((n.samples * 100) / totalSamples);
			if(!first)
			{
				first = pct;
			}
			else
			{
				if(pct!== first)
				{
					if(!second)
					{
						second = pct;
					}
				}
			}

		}

		let i = 0;

		return (
			<div>
				{sortedNodes.map(n =>
				{
					const pct = Math.round((n.samples * 100) / totalSamples);

					let rank:NodeRank;
					if(pct == first)
						rank =NodeRank.FIRST;
					else if(pct == second)
						rank = NodeRank.SECOND;
					else rank = NodeRank.OTHER;

					return (<StackNode pct={pct} node={n} key={++i} indent={this.props.indent} rank={rank}/>);
				})
				}
			</div>
		);
	}
}


class StackNode extends React.Component<{
	node: IProfiledNode;
	indent: number;
	pct: number;
	rank: NodeRank;
}, {
	expanded: boolean;
}>
{
	constructor(props, context)
	{
		super(props, context);

		this.state = {expanded: false};
	}
	render()
	{
		const style = {
			borderBottom:   "1px solid #bdb6b6",
			padding:        "2em 0"
		};

		const n = this.props.node;
		const name = `${n.cls}.${n.method}`;

		let line;
		if(n.line > 0)
		{
			line = n.line;
		}
		else if(n.line === -2)
		{
			line = "(Native Code)";
		}
		else {
			line = "(Unknown line)";
		}

		let rankStyle;
		if(this.props.rank == NodeRank.FIRST)
		{
			rankStyle = {
				color: "#dc2d2d"
			};
		}
		else if(this.props.rank == NodeRank.SECOND)
		{
			rankStyle = {
				color: "#e8a62c"
			};
		}
		else
		{
			rankStyle = {
				color: "#d4c60b"
			};
		}

		let icon, children;
		if(this.hasChildren())
		{
			const iconName = this.state.expanded? "fa-minus-square-o":"fa-plus-square-o";
			icon = <i className={`fa ${iconName}`}/>;

			if(this.state.expanded)
			{
				children = <ProfilerStackList stackNodes={n.children} indent={this.props.indent+1}/>
			}
		}

		const indentStyle = {
			paddingLeft: `${this.props.indent}em`
		};
		return (
			<div>
				<div style={style} className="aLink" onClick={this.onExpandClick.bind(this)}>
					<span style={indentStyle}>
						{icon}<span style={rankStyle}><b>{` ${this.props.pct}% `}</b></span><span className="dsCodeBlock">{`${name}:${line}`}</span>
					</span>
				</div>
				{children}
			</div>
		)
	}

	private hasChildren()
	{
		return !_.isEmpty(this.props.node.children);
	}


	private onExpandClick()
	{
		if(this.hasChildren())
		{
			const expand = !this.state.expanded;
			updateComponentState(this, {expanded: expand});
		}
	}

}