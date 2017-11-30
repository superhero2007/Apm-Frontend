import * as React from "react";
import {connect} from "react-redux";
import {AbstractContainerPage} from "../abstractContainerPage";
import {ESFiltersPage} from "../esFiltersPage";
import {Col, Row} from "react-bootstrap";
import {RowCol} from "../../widgets/rowCol";
import {MetricListView} from "../views/metricListView";
import {CategoryTabs} from "../categoryTabs";
import {ERROverviewPage} from "./errOverviewPage";
import {ErrDetailView} from "./errDetailView";
import {CatTab} from "../widgets/catTabs";
import {routableEsDetailConnector} from "../../reduxConnectors";


class ErrContainerPage_connect extends AbstractContainerPage
{
	constructor(props, context)
	{
		super(props, context);
	}

	protected onStoreChange(encodedJSON:string)
	{
		this.context.router.replace(`/errors/${encodedJSON}`);
	}

	protected pageName():string
	{
		return "Errors";
	}


	protected doRender():any
	{
		const esDetail = this.props.esDetail;

		let detailView = null;
		if(esDetail.selectedMetric && esDetail.catTab === CatTab.metric)
		{
			detailView = <ErrDetailView/>;
		}
		else
			detailView = <ERROverviewPage/>;

		return (
			<div>
				<ESFiltersPage/>
				<Row>
					<Col xsOffset={6}>
						<CategoryTabs/>
					</Col>
				</Row>
				<Row>
					<Col xs={4}>
						<RowCol>
							<MetricListView/>
						</RowCol>
					</Col>
					<Col xs={8}>
						{detailView}
					</Col>
				</Row>
			</div>
		);
	}
}

export const ErrContainerPage = connect((state, props) => routableEsDetailConnector(state, props))(ErrContainerPage_connect);