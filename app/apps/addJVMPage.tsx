import * as React from "react";
import {RoutableLoadableComponent} from "../widgets/routableLoadableComponent";
import {Http} from "../http";
import {RowCol} from "../widgets/rowCol";
import {ButtonToolbar, DropdownButton, FormGroup, Grid, MenuItem, Radio} from "react-bootstrap";
import {Link} from "react-router";
import "./addjvm.css";
import {accountStatus} from "../accountStatus";
import {URL_JAVA_AGENT_LATEST} from "../urlConstants";

export interface IAccountInfo
{
	currentAgentVersion:string;
	licenseKey:string;
	email: string;
	intercomId: string;
	fullName: string;
	company: string;
	createdAt: number;
	isPro: boolean;
	hasTrial: boolean;
	accId: string;
}

enum Platform {
	linux,
	windows,
	paas,
	generic
}
enum Lang {
	java,
	scala,
	cf
}
interface IState
{
	platform:Platform;
	lang: Lang;
	appServer: string;
}
export class AddJVMPage extends RoutableLoadableComponent<{}, IState>
{
	private appServerDocs = {
		"Apache Tomcat": "https://chronon.atlassian.net/wiki/display/DRIP/Tomcat",
		"DropWizard": "https://chronon.atlassian.net/wiki/display/DRIP/Generic+Manual+Installation",
		"JBoss": "https://chronon.atlassian.net/wiki/display/DRIP/JBoss",
		"Jetty": "https://chronon.atlassian.net/wiki/display/DRIP/Jetty",
		"Glassfish": "https://chronon.atlassian.net/wiki/display/DRIP/Glassfish",
		"Wildfly": "https://chronon.atlassian.net/wiki/display/DRIP/WildFly",
		"Play Framework": "https://chronon.atlassian.net/wiki/display/DRIP/Play+framework",
		"Spray Framework": "https://chronon.atlassian.net/wiki/display/DRIP/Spray+framework",
		"Spring Boot": "https://chronon.atlassian.net/wiki/display/DRIP/Generic+Manual+Installation",
		"WebLogic": "https://chronon.atlassian.net/wiki/display/DRIP/WebLogic",
		"WebSphere": "https://chronon.atlassian.net/wiki/display/DRIP/WebSphere",
		"Lucee/Railo": "https://chronon.atlassian.net/wiki/display/DRIP/ColdFusion"
	};

	private installables = ["Apache Tomcat", "Jetty", "JBoss", "Wildfly"];

	private accountInfo:IAccountInfo = null;

	public serverHasInstaller(server: string)
	{
		return this.installables.includes(server);
	}
	
	protected initialState():IState
	{
		return {platform: Platform.linux, lang: Lang.java, appServer: AddJVMPage.getAppServerForCurLang(Lang.java)[0]};
	}

	protected getStateFromPostResponse(reponseData:any):IState
	{
		this.accountInfo = reponseData[0];
		if(accountStatus.isDemoUser)
		{
			this.accountInfo.licenseKey = "<DemoUserKeyHidden>";
		}
		return this.initialState();
	}

	getPromiseToLoad(props?:{}):Promise<any>
	{
		return Promise.all([Http.get("/accountinfo")]);
	}

	private static createDownloadUrl()
	{
		return URL_JAVA_AGENT_LATEST;
	}

	private onPlatformSelect(e)
	{
		this.update_myStateProps({platform: Number(e.target.value)});
	}

	private onLangSelect(e)
	{
		const lang = Number(e.target.value);
		const appServers = AddJVMPage.getAppServerForCurLang(lang);
		this.update_myStateProps({lang: lang, appServer: appServers[0]});
	}

	private onAppServerSelect(e)
	{
		this.update_myStateProps({appServer: e});
	}

	protected renderContent(data:IState):any
	{
		const downloadUrl = AddJVMPage.createDownloadUrl();
		return (
			<Grid className="addJVM">
				<div className="install-section">
					<h3>1. Download the agent</h3>
					<RowCol>
						<a className="btn btn-danger" href={downloadUrl}><i className="fa fa-download fa-lg"/> Download</a>
					</RowCol>
					<RowCol>
						<h4>or use the command line (on linux)</h4>
					</RowCol>
					<RowCol xs={9}>
						<pre>wget {downloadUrl}</pre>
					</RowCol>
					<RowCol xs={9}>
						<p>{`Agent Version: ${this.accountInfo.currentAgentVersion}`}</p>
					</RowCol>
				</div>

				<div className="install-section">
					<h3>2. Your License Key:</h3>
					<RowCol xs={9}>
						<pre>{this.accountInfo.licenseKey}</pre>
					</RowCol>
				</div>

				<div className="install-section">
					<h3>3. Install the agent:</h3>
					{this.renderChoosePlatform(data)}
					{this.renderInstructions(data)}
				</div>
				{this.renderPostInstall(data)}
			</Grid>
		);
	}

	private renderPostInstall(data:IState)
	{
		let restartMsg = null;
		if(data.lang === Lang.java && data.platform !== Platform.paas)
		{
			restartMsg = <div>{`Restart ${data.appServer}.`}</div>;
		}

		return (
			<div>
				<div className="install-section">
					<h3>{"4. Restart your Application"}</h3>
					{restartMsg}
				</div>
				<div className="install-section">
					<h3>{"5. See data in few minutes!"}</h3>
					<div>{"Within minutes, your DripStat dashboard will start showing data from your JVM."}</div>
					<div><i>{"Due to heavy load, it can initially take about 5 minutes before your data initially starts showing up."}</i></div>
				</div>
				<div className="install-section">
					<Link to="/jvms/apps" className="btn btn-success">{'Ok, I have installed the agent'}</Link>
				</div>
			</div>

		);
	}

	private renderGenericInstructions()
	{
		return (
			<div className="install-section">
				<h4>{"b) Instructions:"}</h4>
				<RowCol xs={9}>
					<p>
						<b><a href="https://chronon.atlassian.net/wiki/display/DRIP/Generic+Manual+Installation" target="_blank">Read docs</a></b> for generic installation of DripStat on any JVM
					</p>
				</RowCol>
			</div>
		);

	}
	private renderInstructions(data:IState)
	{
		if(data.platform === Platform.paas)
			return this.renderPAASInstructions();

		if(data.platform == Platform.generic)
			return this.renderGenericInstructions();

		return (
			<div>
				{this.renderLanguageSelection(data)}
				{this.renderLanguageInstructions(data)}
			</div>
		);
	}

	private static getAppServerForCurLang(lang:Lang)
	{
		switch (lang)
		{
			case Lang.java:
				return ["Apache Tomcat", "DropWizard", "JBoss", "Jetty" ,"Glassfish", "Wildfly" ,"Spring Boot", "WebLogic" ,"WebSphere"];
			case Lang.scala:
				return ["Play Framework", "Spray Framework"];
			case Lang.cf:
				return ["Lucee/Railo"];
		}

	}

	private isTomcat(server:string)
	{
		return "Apache Tomcat" === server;
	}

	private renderInstallationDocs(data:IState)
	{
		return <a href={this.appServerDocs[data.appServer]} target="_blank"><b>Installation Docs</b></a>;
	}

	private renderLanguageInstructions(data:IState)
	{
		const appServers = AddJVMPage.getAppServerForCurLang(data.lang);

		let instructions = null;
		if(data.platform === Platform.linux)
		{
			let installSteps = null;

			if(!this.serverHasInstaller(data.appServer))
			{
				installSteps = (
					<RowCol className="top1">
						<div>
							<b>{"2) Please follow instructions listed in "}</b> {this.renderInstallationDocs(data)}
						</div>
					</RowCol>
				);
			}
			else
			{
				installSteps = (
					<div className="top1">
						<RowCol>
							<div><b>{"2) Run the install command from the dripstat directory:"}</b></div>
							<div>
								<pre>
									{`cd /path/to/appserver/dripstat\njava -jar dripstat.jar install -n "MyAppName" -l ${this.accountInfo.licenseKey}`}
								</pre>
							</div>
							<div>{'(Replace "MyAppName" with a unique name to identify your JVM)'}</div>
							<div>{"For more info, read our "}{this.renderInstallationDocs(data)}</div>
						</RowCol>
					</div>
				);
			}

			instructions = (
				<div className="inner-install-section">
					<RowCol>
						<div><b>{"1) Unzip the file into your app server's home directory:"}</b></div>
						<div><pre>{`unzip dripstat_agent-latest.zip -d /path/to/appserver/`}</pre></div>
					</RowCol>
					{installSteps}
				</div>
			);
		}
		else if(data.platform === Platform.windows)
		{
			if(!this.serverHasInstaller(data.appServer))
			{
				instructions = (
					<div>
						<ol>
							<li>{"Unzip the "}<code>{`dripstat_agent-latest.zip`}</code>{"file"}</li>
							<li>{"Copy the "}
								<code>{'dripstat'}</code>
								{" folder to your application server's home folder "}<br/>
								{" (eg - "}<code>{"C:\\tomcat\\"}</code>
								{')'}
							</li>
							<li>{"Follow steps listed in "}{this.renderInstallationDocs(data)}</li>
						</ol>
					</div>
				);
			}
			else
			{
				let tomcatSpecial = null;
				if(this.isTomcat(data.appServer))
				{
					tomcatSpecial = (
						<div>
							<b>
								{"(Using Tomcat as Windows Service? Read "}<a href="https://chronon.atlassian.net/wiki/display/DRIP/Tomcat+Service+for+Windows" target="_blank">{"these instructions"}</a>{" instead)."}
							</b>
						</div>
					);
				}
				instructions = (
					<div>
						<div className="inner-install-section">
							<RowCol>
								<ol>
									<li>{"Unzip the "}<code>{`dripstat_agent-latest.zip`}</code>{"file"}</li>
									<li>{"Copy the "}
										<code>{'dripstat'}</code>
										{" folder to your application server's home folder "}<br/>
										{" (eg - "}<code>{"C:\\tomcat\\"}</code>
										{')'}
									</li>
									<li>{"Open a command prompt window and run the following commands:"}</li>
								</ol>
							</RowCol>
							<RowCol>
								{tomcatSpecial}
								<div>
									<pre>
										{`cd path\\to\\appserver_home\\dripstat\njava -jar dripstat.jar install -n "MyAppName" -l ${this.accountInfo.licenseKey}`}
									</pre>
								</div>
								<div>{'(Replace "MyAppName" with a unique name to identify your JVM)'}</div>
								<div>{"For more info, read our "}{this.renderInstallationDocs(data)}</div>
							</RowCol>
						</div>
					</div>
				);
			}
		}

		return (
			<div>
				<div className="inner-install-section">
					<h4>{"c) Show instructions for:"}</h4>
					<RowCol xs={6}>
						<ButtonToolbar>
							<DropdownButton onSelect={this.onAppServerSelect.bind(this)} id="appserverDropdown" bsStyle="primary" title={data.appServer}>
								{appServers.map(server => <MenuItem eventKey={server} key={server}>{server}</MenuItem>)}
							</DropdownButton>
						</ButtonToolbar>
					</RowCol>
				</div>
				{instructions}
			</div>
		);
	}
	private renderPAASInstructions()
	{
		return (
			<div className="install-section">
				<h4>{"b) See Instructions For:"}</h4>
				<RowCol xs={9}>
					<ul>
						<li><a href="https://chronon.atlassian.net/wiki/display/DRIP/AWS+Elastic+Beanstalk" target="_blank">AWS Elastic Beanstalk</a></li>
						<li><a href="https://chronon.atlassian.net/wiki/display/DRIP/Heroku" target="_blank">Heroku</a></li>
						<li><a href="http://blog.jelastic.com/2015/06/03/enable-dripstat-monitor-java-apps/" target="_blank">Jelastic</a></li>
					</ul>
				</RowCol>
			</div>
		);
	}

	private renderLanguageSelection(data:IState)
	{
		return (
			<div className="inner-install-section">
				<h4>{"b) Choose your Language:"}</h4>
				<RowCol xs={6}>
					<FormGroup>
						<Radio checked={data.lang === Lang.java} onChange={this.onLangSelect.bind(this)} value={Lang.java.toString()}>
							Java
						</Radio>
						<Radio checked={data.lang === Lang.scala} onChange={this.onLangSelect.bind(this)} value={Lang.scala.toString()}>
							Scala
						</Radio>
						<Radio checked={data.lang === Lang.cf} onChange={this.onLangSelect.bind(this)} value={Lang.cf.toString()}>
							ColdFusion
						</Radio>
					</FormGroup>
				</RowCol>
			</div>
		);
	}
	private renderChoosePlatform(data:IState)
	{
		return (
			<div className="inner-install-section">
				<h4>{"a) Choose your Platform:"}</h4>
				<RowCol xs={6}>
						<FormGroup>
							<Radio checked={data.platform === Platform.linux} onChange={this.onPlatformSelect.bind(this)} value={Platform.linux.toString()}>
								Linux/Mac
							</Radio>
							<Radio checked={data.platform === Platform.windows} onChange={this.onPlatformSelect.bind(this)} value={Platform.windows.toString()}>
								Windows
							</Radio>
							<Radio checked={data.platform === Platform.paas} onChange={this.onPlatformSelect.bind(this)} value={Platform.paas.toString()}>
								PAAS
							</Radio>
							<Radio checked={data.platform === Platform.generic} onChange={this.onPlatformSelect.bind(this)} value={Platform.generic.toString()}>
								Generic (any platform)
							</Radio>
						</FormGroup>
				</RowCol>
			</div>
		);
	}

}