import * as React from "react";
import {TopNavbar} from "./widgets/topNavbar";
import {LoadableComponent} from "./widgets/loadableComponent";
import {AccountStatus} from "./accountStatus";
import {Row, Col} from "react-bootstrap";

declare var process: any;
declare var require: any;


let DevTools = null;
if (process.env.NODE_ENV !== 'production') {

	DevTools = require('./devTools').DevTools;

}

export class AppPage extends LoadableComponent<{children:any},{}>
{
	protected initialState():{}
	{
		return {};
	}

	protected getPostUrl():string
	{
		return "/accStatus";
	}

	protected getStateFromPostResponse(reponseData:any):{}
	{
		AccountStatus.read(reponseData);
		return {};
	}

	protected renderContent(data:{}):any
	{
		return (
			<div>
				<TopNavbar/>
				<div className="container-fluid appContainer">
					{this.props.children}
				</div>
				{this.renderDevTools()}
				<footer className="footer">
					<div className="container">
						<Row className="top2">
							<Col xs={1} xsOffset={3}>
								<a href="http://status.dripstat.com" className="navCustomLink">Status</a>
							</Col>
							<Col xs={1}>
								<a href="https://twitter.com/dripstat" className="navCustomLink">Twitter</a>
							</Col>
							<Col xs={1}>
								<a href="http://blog.dripstat.com" className="navCustomLink">Blog</a>
							</Col>
							<Col xs={1}>
								<a href="https://trello.com/b/uUBXB8hW/dripstat-development" className="navCustomLink">Upcoming</a>
							</Col>
						</Row>
					</div>
				</footer>
			</div>
		);
	}

	private renderDevTools()
    {
        if(DevTools!=null)
            return <DevTools/>;

        return null;
    }
}
