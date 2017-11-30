import * as React from "react";
import {Row, Col} from "react-bootstrap";
import "./chartTitle.css";
import {isNotPresent} from "../../utils";
import {RowCol} from "../../widgets/rowCol";
import * as classNames from "classnames";

export class ChartTitle extends React.Component<{
	chartName:      string;
	summaryStat?:    string;
	summaryType?:    string;
	summaryStat2?:    string;
	summaryType2?:    string;
	bottomSpace?:     boolean;
},{}>
{
	render()
	{
		if(isNotPresent(this.props.summaryStat))
		{

			return (
				<RowCol className={classNames({'bottom1': this.props.bottomSpace})}>
					<div className="dsChartTitle">{this.props.chartName}</div>
				</RowCol>
			);
		}

		let stat2 = null;
		if(this.props.summaryStat2)
		{
			const style = {
				'marginRight': '2em'
			};
			stat2 = (
				<div className="pull-right" style={style}>
					<div className="dsChartSummaryValue">
						{this.props.summaryStat2}
					</div>
					<div className="dsChartValueSubtext">
						{this.props.summaryType2}
					</div>
				</div>
			);
		}
		return (<div>
			<Row>
				<Col xs={3}>
					<div className="dsChartTitle">{this.props.chartName}</div>
				</Col>
				<Col xs={9}>
					<div className="pull-right">
						<div className="dsChartSummaryValue">
							{this.props.summaryStat}
						</div>
						<div className="dsChartValueSubtext">
							{this.props.summaryType}
						</div>
					</div>
					{stat2}
				</Col>
			</Row>
		</div>);
	}
}