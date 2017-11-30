import * as React from "react";
import {RowCol} from "../../widgets/rowCol";
import * as classNames from "classnames";
import {action_updatePinnedTxn, IPinnedTxn, IRR_PinnedTxnReducer} from "../../reducers/pinnedTxnReducer";
import "../widgets/metriclist.css";
import {connect} from "react-redux";
import {Dispatch} from "redux";
import {pinnedTxnConnectorWithProps} from "../../reduxConnectors";

interface IState
{
	pinnedTxns:IPinnedTxn[]
}

export interface IPinnedTxnComponentProps
{
	dispatch?   :Dispatch<any>;
	pinnedTxnRedr?: IRR_PinnedTxnReducer;
}

interface IProps1 {
	txns:IPinnedTxn[];
}

type IProps = IProps1 & IPinnedTxnComponentProps;

class PinnedTxnList_connect extends React.Component<IProps,{}>
{

	componentWillMount()
	{
		const txns = this.props.txns;

		if(txns.length > 0)
		{
			let selectTxn;
			const selectedTxn = this.props.pinnedTxnRedr.txn;
			if (selectedTxn)
			{
				selectTxn = txns.find(it => it.txnId === selectedTxn.txnId);
			}


			if(!selectTxn)
			{
				selectTxn = txns [0];
				this.onSelect(selectTxn);
			}

		}
		else {
			this.onSelect(null);
		}

	}

	private onSelect(txn: IPinnedTxn)
	{
		this.props.dispatch(action_updatePinnedTxn(txn));
	}

	render():any
	{


		const curTxn = this.props.pinnedTxnRedr.txn;
		const curTxnId = curTxn? curTxn.txnId: -1;

		const map = this.props.txns.map(it=> (
			<div key={it.name} onClick={this.onSelect.bind(this, it)}>
				<RowCol>
					<div className={classNames("txnListBar", "progress",{"active":curTxnId === it.txnId})}>
						<div className="txnName">
							{it.name}
						</div>
						<div className="progress-bar" style={{width:"100%"}}>
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

export const PinnedTxnList = connect((state, props:IProps1)=> pinnedTxnConnectorWithProps(state, props))(PinnedTxnList_connect);