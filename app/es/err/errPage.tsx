import * as React from "react";
import {RowCol} from "../../widgets/rowCol";
import {AmplitudeAnalytics} from "../../analytics";
import {BillingIssue} from "../../widgets/billingIssue";
import {accountStatus} from "../../accountStatus";


export class ErrPage extends React.Component<{children?:any}, {}>
{
	constructor(props, context)
	{
		super(props, context);
		AmplitudeAnalytics.track("Errors Tab");
	}
	
	render()
	{
		if(accountStatus.hasBillingIssue())
			return <BillingIssue/>;

		return (
			<div>
				<RowCol>
					{this.props.children}
				</RowCol>
			</div>
		);
	}
}