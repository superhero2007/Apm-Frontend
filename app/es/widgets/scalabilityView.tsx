import * as React from "react";
import * as _ from "lodash";
import {Row} from "react-bootstrap";
import {ScalabilityGraph} from "../charts/scalabilityGraph";
import {RowCol} from "../../widgets/rowCol";
import {FormGroup} from "react-bootstrap";
import {Checkbox} from "react-bootstrap";
import {updateComponentState} from "../../utils";
import {Loading} from "../../widgets/loading";


export interface IGraphPoint
{
	timestamp: string;
	responseTime: number;
	thp: number;
}

export interface IScalabilityGraph
{
	values: IGraphPoint[];
}


export class ScalabilityView extends React.Component<{
	graph: IScalabilityGraph;
},{
	hideOutliers: boolean;
	ticking: boolean;

}>
{
	unmounted = false;

	constructor(props, context)
	{
		super(props);
		this.state = {hideOutliers: true, ticking: false};
	}

	componentWillUnmount()
	{
		this.unmounted = true;
	}

	private static getNumTimeDisplay(num: number): string
	{
		if (num >= 10)
			return `${num}`;
		else
			return `0${num}`;
	}

	private static renderColorSwatch(colorNum: number)
	{
		return <td style={{backgroundColor:ScalabilityGraph.colorTable[colorNum]}} key={colorNum}>&nbsp;</td>;
	}

	private static renderTime(num: number)
	{
		const minTime = ScalabilityView.getNumTimeDisplay(num) + ":00";
		const maxTime = ScalabilityView.getNumTimeDisplay(num + 1) + ":00";
		return <td key={minTime}>{minTime}<br/>-<br/>{maxTime}</td>;
	}

	private static renderRangeSwatches()
	{
		let swatches = [];
		let timeDisplays = [];
		for (let i = 0; i < 24; i++)
		{
			swatches.push(ScalabilityView.renderColorSwatch(i));
			timeDisplays.push(ScalabilityView.renderTime(i));
		}

		return (
			<Row>
				<table style={{width:"100%"}}>
					<tbody>
					<tr>
						{swatches}
					</tr>
					<tr style={{fontWeight:"bold"}}>
						{timeDisplays}
					</tr>
					</tbody>
				</table>
			</Row>
		);
	}

	private onOutlierChange(e)
	{
		let value = e.currentTarget.checked;
		setTimeout(this.onTick.bind(this), 50);
		updateComponentState(this, {hideOutliers: value, ticking: true});
	}

	private onTick()
	{
		if (!this.unmounted)
		{
			updateComponentState(this, {ticking: false});
		}
	}

	render()
	{
		if (this.state.ticking)
		{
			return <Loading/>;
		}

		const respTimes = this.props.graph.values;

		let graph = this.props.graph;
		if (respTimes.length > 0)
		{
			const sum = _.sumBy(respTimes, t => t.responseTime);
			const avg = sum / respTimes.length;
			const maxThreshold = 2 * avg;
			const minThreshold = avg - (0.95 * avg);

			const values: IGraphPoint[] = [];


			for (let val of respTimes)
			{
				let skip = false;
				if (val.thp <= 0)
				{
					skip = true;
				}
				else if (this.state.hideOutliers && (val.responseTime > maxThreshold || val.responseTime < minThreshold))
				{
					skip = true;
				}

				if (!skip)
				{
					values.push(val)
				}
			}

			graph = {values: values}
		}

		return (
			<div>
				<RowCol>
					<div className="horizontalAlign">
					<FormGroup>
						<Checkbox checked={this.state.hideOutliers} onChange={this.onOutlierChange.bind(this)}>
							Hide Outliers
						</Checkbox>
					</FormGroup>
					</div>
				</RowCol>
				<ScalabilityGraph graphData={graph}/>
				{ScalabilityView.renderRangeSwatches()}
			</div>
		);

	}
}