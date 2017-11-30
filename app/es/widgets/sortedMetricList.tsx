import * as React from "react";
import * as _ from "lodash";
import {RowCol} from "../../widgets/rowCol";
import {responseTimeDisplay, roundToTwo, throughputDisplay} from "../metricUtils";
import {updateComponentState} from "../../utils";
import * as classNames from "classnames";
import "./metriclist.css";

export enum MetricSortType
{
	AVG_RESPTIME,
	THROUGHPUT,
	TIME_SPENT,
	ERR_RATE,
	ERR_PCT,
	AVG_THROUGHPUT,
	THROUGHPUT_CUSTOM_UNIT
}


export interface ISortedListItem
{
	metricId: number;
	name: string;
	realName: string;
	value: number;
}

class PercentageCalc
{
	base: number = 0;

	calcPercentage(value: number)
	{
		if (value <= 0) return 0;

		const pct = (value * 100) / this.base;
		return roundToTwo(pct);
	}
}

/**
 * everything is relative to the first value
 * first bar is 100%
 * all other bars are relative to first bar
 */
class RelativePercentageCalc extends PercentageCalc
{

	constructor(list: any[], prop: string)
	{
		super();
		if (!_.isEmpty(list)) {
			this.base = list[0][prop];
		}
	}
}

/**
 * values are relative to the total
 * all bars will add up to 100
 */
class TotalPercentageCalc extends PercentageCalc
{

	constructor(list: any[], prop: string)
	{
		super();
		if (!_.isEmpty(list)) {
			_.forEach(list, (item) => {
				this.base += item[prop];
			});
		}
	}
}

/**
 * value is already a percent value.
 * no calculation done
 */
class NoOpPercentageCalc extends PercentageCalc
{

	calcPercentage(value: number) {
		return value;
	}
}

interface Props {
	listItems       :ISortedListItem[];
	sortType      :MetricSortType;
	onSelectMetric  :(it:ISortedListItem)=>void;
	selectedItem: ISortedListItem;
	hideNames?: boolean;
	customDisplayFunc?: (number)=>string;
}

export class SortedMetricList extends React.Component<Props,{
	pctCalc: PercentageCalc;
}>
{
	constructor(props,context)
	{
		super(props,context);
		this.state = SortedMetricList.createState(props);
	}

	componentWillReceiveProps(nextProps:Props)
	{
		if(nextProps.listItems !== this.props.listItems || nextProps.sortType!== this.props.sortType)
		{
			updateComponentState(this, SortedMetricList.createState(nextProps));
		}
	}

	private static createState(nextProps:Props)
	{
		return {pctCalc: SortedMetricList.calc(nextProps)};
	}

	private static calc(props:Props)
	{
		if (props.sortType === MetricSortType.TIME_SPENT)
			return new TotalPercentageCalc(props.listItems, "value");
		else if (props.sortType === MetricSortType.ERR_RATE)
			return new NoOpPercentageCalc();
		else
			return new RelativePercentageCalc(props.listItems, "value");
	}

	public getMetricValue(metric: ISortedListItem) {

		switch (this.props.sortType) {

			case MetricSortType.AVG_RESPTIME: {
				return responseTimeDisplay(metric.value);
			}
			case MetricSortType.ERR_RATE: {
				return roundToTwo(metric.value) + "%";
			}
			case MetricSortType.THROUGHPUT: {
				return throughputDisplay(metric.value);
			}
			case MetricSortType.THROUGHPUT_CUSTOM_UNIT: {
				return this.props.customDisplayFunc(metric.value);
			}
			case MetricSortType.TIME_SPENT: {
				return roundToTwo(this.state.pctCalc.calcPercentage(metric.value)) + "%";
			}
		}
	}

	public getMetricPct(metric: ISortedListItem) {
		return this.state.pctCalc.calcPercentage(metric.value) + "";
	}

	private onSelect(it:ISortedListItem)
	{
		this.props.onSelectMetric(it);
	}

	render()
	{
		const map = this.props.listItems.map(it=> (
			<div key={it.name} onClick={this.onSelect.bind(this, it)}>
				<RowCol>
					<div className={classNames("txnListBar", "progress",{"active":this.props.selectedItem === it})}>
						<div className="txnName">
							{this.props.hideNames?this.getMetricValue(it):it.name}
						</div>
						<div className="unit">
							{this.props.hideNames?"":this.getMetricValue(it)}
						</div>
						<div className="progress-bar" style={{width:this.getMetricPct(it)+"%"}}>
						</div>
					</div>
				</RowCol>
			</div>
		));
		return (
			<div>
				{map}
			</div>
		);
	}
}
