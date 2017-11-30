import * as React from "react";
import * as PropTypes from "prop-types";
import * as _ from "lodash";
import {Http} from "../../http";

export class AddPolicyPage extends React.Component<{},{policyName:string, errMsg:string}>
{
	static contextTypes:any = {
		router: PropTypes.any.isRequired
	};

	context: any;

	constructor(props, context)
	{
		super(props, context);
		this.state = {policyName: "", errMsg: null};
	}

	onSubmit(e)
	{
		e.preventDefault();

		let err = null;
		let name = this.state.policyName.trim();

		if (_.isEmpty(name)) {
			err = "You forgot to enter a name..";
		}
		else if (name.length > 90) {
			err = "Too long. Choose a shorter name.";
		}

		this.setState({policyName: name, errMsg: err});

		if(_.isEmpty(err))
		{
			Http.post("/alert/policy/add", {name: name}).then((data)=>{
				const newPolicyId = data;
				this.context.router.push(`/policy/${newPolicyId}/conditions`);
			}, (err)=> {
				this.setState({policyName: name, errMsg: JSON.parse(err.responseText)});
			});
		}
	}

	onChange(e)
	{
		this.setState({policyName: e.target.value, errMsg: this.state.errMsg});
	}

	render()
	{
		let err;
		if (this.state.errMsg) {
			let style = {color: "red"};
			err = <h5 style={style}>{this.state.errMsg}</h5>;
		}

		let containerStyle = {
			maxWidth: "500px"
		};

		return <div className="container" style={containerStyle}>

			<form onSubmit={this.onSubmit.bind(this)}>
				<div className="form-group">
					<label>{`Enter New Alert Policy Name:`}</label>
					<input type="text" className="form-control" onChange={this.onChange.bind(this)}/>
				</div>
				<button type="submit" className="btn btn-default">Create</button>
			</form>

			{err}
		</div>;
	}
}