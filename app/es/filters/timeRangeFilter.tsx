import * as React from "react";
import {AbstractTimeRange, TimeRange} from "./timerange";
import {connect} from "react-redux";
import {IStore} from "../../reduxSetup";
import {action_updateTimeRange} from "../../reducers/esReducer";
import {ButtonToolbar, Dropdown, Glyphicon, MenuItem} from "react-bootstrap";
import {CustomRangeDlg} from "./customRangeDlg";
import "./timerange.css";
import {AmplitudeAnalytics} from "../../analytics";
import {MsgDlg} from "../../widgets/msgDlg";
import {accountStatus} from "../../accountStatus";
import {IESViewProps} from "../esViews";
import {timeRangeConnector} from "../../reduxConnectors";


export interface ITimeRangeProps
{
	maxRange?: TimeRange;
	redrName: string;
}

export interface IReducerProps
{
	pinnedTxnRedr;
	app;
	timeRangeFilter;
}

type IProps = ITimeRangeProps & IESViewProps & IReducerProps;


class TimeRangeFilter_connect extends React.Component<IProps, {}>
{

	private timeRanges: TimeRange[] = [
		TimeRange.defaultRange,
		new TimeRange("1 hr", 1, 'h'),
		new TimeRange("3 hrs", 3, 'h'),
		new TimeRange("6 hrs", 6, 'h'),
		new TimeRange("12 hrs", 12, 'h'),
		new TimeRange("24 hrs", 24, 'h'),
		new TimeRange("3 days", 3, 'd'),
		new TimeRange("7 days", 7, 'd'),
		new TimeRange("30 days", 30, 'd'),
		new TimeRange("60 days", 60, 'd'),
		new TimeRange("90 days", 90, 'd')
	];

	refs: any;

	private onSelect(e: any)
	{
		if (e === "Custom")
		{
			const customRangeDlg: CustomRangeDlg = this.refs.customRangeDlg;
			customRangeDlg.showDlg();
		}
		else
		{
			const range = this.timeRanges.find(it => it.label === e);
			AmplitudeAnalytics.track(`TimeRangeSelect${range.label}`);

			if (!accountStatus.isPro && range.greaterThan(new TimeRange("1 hr", 1, 'h')))
			{
				const msgDlg: MsgDlg = this.refs.upgradeDlg;
				msgDlg.toggleDlg();
				return;
			}

			this.props.dispatch(action_updateTimeRange(range));
		}
	}

	render()
	{
		const redr = this.props[this.props.redrName];
		const selectedTimeRange = AbstractTimeRange.deserialize(redr.timeRange);

		let validRanges = this.timeRanges;

		if (this.props.maxRange)
		{
			validRanges = validRanges.filter(range => !range.greaterThan(this.props.maxRange));
		}

		const menuItems: any[] = validRanges.map((range: TimeRange) => {
			let check = range.equals(selectedTimeRange) ? <i className="fa fa-check"/> : null;
			return <MenuItem key={range.label} eventKey={range.label}>{check}{" " + range.label}</MenuItem>
		});

		menuItems.push(<MenuItem divider={true} key="Divider"/>);

		let check = selectedTimeRange.isCustom ? <i className="fa fa-check"/> : null;
		menuItems.push(<MenuItem eventKey="Custom" key="Custom">{check}{" Custom Range"}</MenuItem>);

		const title = ` ${selectedTimeRange.displayStr()} `;

		let Toggle = Dropdown.Toggle as any;
		return (
			<div>
				<ButtonToolbar>
					<Dropdown onSelect={this.onSelect.bind(this)} id="timeRangeDropdown" className="noRadiusChildBtn">
						<Toggle bsSize="large">
							<Glyphicon glyph="time"/>
							{title}
						</Toggle>
						<Dropdown.Menu>
							{menuItems}
						</Dropdown.Menu>
					</Dropdown>
				</ButtonToolbar>
				<CustomRangeDlg ref="customRangeDlg"/>
				<MsgDlg msg="Upgrade to DripStat Pro to see data over 1 hour" ref="upgradeDlg"/>
			</div>
		);
	}
}

export const TimeRangeFilter = connect((state: IStore, props: ITimeRangeProps) => timeRangeConnector(state, props))(TimeRangeFilter_connect);
