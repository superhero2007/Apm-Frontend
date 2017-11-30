import * as React from "react";
import {LoadableComponent} from "../../widgets/loadableComponent";
import {action_updateSelectedMetric} from "../../reducers/esReducer";
import {QueryRequests} from "../queryRequests";
import {Http} from "../../http";
import {ISortedListItem, SortedMetricList} from "../widgets/sortedMetricList";
import * as _ from "lodash";
import {IESViewProps} from "../esViews";
import {connect} from "react-redux";
import {esDetailConnector} from "../../reduxConnectors";

interface IState
{
    listItems   :ISortedListItem[];
}

class MetricListView_connect extends LoadableComponent<IESViewProps,IState>
{
    protected initialState():IState
    {
        return {listItems: []};
    }

    protected getPostUrl():string
    {
        return null;
    }

    protected getStateFromPostResponse(reponseData:any):IState
    {
        const listItems:ISortedListItem[] = reponseData[0];
        return {listItems: listItems};
    }


    protected getHttpRequests(props:IESViewProps) :JQueryXHR[]
    {
        const body = QueryRequests.postBody_sortFilter(props.esDetail);

        return [Http.postJSON("/xapp/es/list", body)];
    }
    
    componentWillReceiveProps(nextProps:IESViewProps)
    {
        const newEsDetail = nextProps.esDetail;
        const esDetail = this.props.esDetail;

        if(QueryRequests.filterChanged_sort(newEsDetail, esDetail))
        {
            this.reloadData(nextProps);
        }
    }

    private onSelectMetric(it:ISortedListItem)
    {
        this.props.dispatch(action_updateSelectedMetric(it.name, it.realName));
    }
    protected renderContent(data:IState):any
    {
        const selectedMetric = this.findSelectedMetric(data);
        const sortType = this.props.esDetail.sortType;
        return (
            <div>
                <SortedMetricList selectedItem={selectedMetric}
                                  listItems={data.listItems} sortType={sortType}  onSelectMetric={this.onSelectMetric.bind(this)} />
            </div>
        );
    }

    private findSelectedMetric(data:IState): ISortedListItem
    {
        const selectedMetricName = this.props.esDetail.selectedMetric;
        return data.listItems.find((it)=> it.name === selectedMetricName);
    }

}

export const MetricListView = connect((state)=> esDetailConnector(state))(MetricListView_connect);
