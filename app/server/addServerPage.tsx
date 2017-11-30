import * as React from "react";
import {RowCol} from "../widgets/rowCol";
import {FormGroup, Grid, Radio} from "react-bootstrap";
import {updateComponentState} from "../utils";
import {Link} from "react-router";
import {LoadableComponent} from "../widgets/loadableComponent";
import {Http} from "../http";
import {IAccountInfo} from "../apps/addJVMPage";
import {accountStatus} from "../accountStatus";

enum Platform {
	Ubuntu,
	Debian,
	RedHat,
	Amazon,
	Ansible
}

enum Bitness
{
	Bit64,
	Bit32
}

enum LinuxInit
{
	Systemd,
	Upstart,
	Sysv
}

interface IOSVersion
{
	label: string;
	init: LinuxInit;
}

interface ITopLevelState {
	accInfo: IAccountInfo;
}

export class AddServerTopLevelPage extends LoadableComponent<{}, ITopLevelState>
{
	protected initialState(): ITopLevelState
	{
		return {accInfo: null};
	}


	getPromiseToLoad(props?:{}):Promise<any>
	{
		return Promise.all([Http.get("/accountinfo")]);
	}

	protected getStateFromPostResponse(responseData: any): ITopLevelState
	{
		const info:IAccountInfo = responseData[0];
		if(accountStatus.isDemoUser)
		{
			info.licenseKey = "DemoUserKeyHidden";
		}

		return {accInfo: info};
	}

	protected renderContent(data: ITopLevelState)
	{
		return <AddServerPage licenseKey={data.accInfo.licenseKey}/>
	}

}

class AddServerPage extends React.Component<{
	licenseKey: string
},{
	platform: Platform;
	bit: Bitness;
	initType: LinuxInit;
}>
{
	constructor(props, context)
	{
		super(props, context);

		this.state = {platform: null, bit: Bitness.Bit64, initType: LinuxInit.Systemd};
	}

	private configCode(licenseKey)
	{
		return `sh -c "sed 's/licenseKey.*/licenseKey='\\''${licenseKey}'\\''/' /etc/dripstat-infra/config.toml.example" > /etc/dripstat-infra/config.toml`;
	}

	private startServiceCode(initType: LinuxInit)
	{
		switch (initType)
		{
			case LinuxInit.Systemd:
				return 'systemctl start dripstat-infra';
			case LinuxInit.Sysv:
				return '/etc/init.d/dripstat-infra start';
			case LinuxInit.Upstart:
				return 'initctl start dripstat-infra';

			default:
				console.log("unknown init type");
				break;
		}
	}
	private rhelInstallCode(bitness: Bitness, initType: LinuxInit)
	{
		const bit = (bitness == Bitness.Bit64) ? 'x86_64' : 'i386';

		const elVersion = (initType == LinuxInit.Systemd) ? '7' : '6';

		return `#1. Create the yum repo
sudo curl -o /etc/yum.repos.d/dripstat-infra.repo https://yum.dripstat.com/infraagent/el/${elVersion}/${bit}/dripstat-infra.repo

#2. Update yum cache
sudo yum makecache -y

#3. install agent
sudo yum install dripstat-infra -y

#4. Put License Key
sudo ${this.configCode(this.props.licenseKey)}

#5. Start the Agent
sudo ${this.startServiceCode(initType)}`;
	}

	private ubuntuInstallCode(initType: LinuxInit)
	{
		let aptRepo;

		switch (initType)
		{
			case LinuxInit.Systemd:
				aptRepo = "dripstat";
				break;
			case LinuxInit.Sysv:
				aptRepo = "dripstat-sysv";
				break;
			case LinuxInit.Upstart:
				aptRepo = "dripstat-upstart";
				break;

			default:
				console.log("unknown init type");
				break;
		}

		return `#1. Set up apt so that it can download through https
sudo apt-get update
sudo apt-get install apt-transport-https

#2. Configure the DripStat apt repository
sudo echo 'deb https://apt.dripstat.com/ ${aptRepo} non-free' > /etc/apt/sources.list.d/dripstat.list
sudo wget -O- https://apt.dripstat.com/key/public.gpg | apt-key add -
sudo apt-get update

#3. install the agent
sudo apt-get install dripstat-infra

#4. Put License Key
sudo ${this.configCode(this.props.licenseKey)}

#5. Start the Agent
sudo ${this.startServiceCode(initType)}`;
	}


	private onOSSelect(e)
	{
		const platform = Number(e.target.value);
		let init = (platform === Platform.Amazon)? LinuxInit.Upstart: LinuxInit.Systemd;
		updateComponentState(this, {platform: platform , initType: init, bit: Bitness.Bit64});
	}

	private onBitSelect(e)
	{
		updateComponentState(this, {bit: Number(e.target.value)});
	}

	private onInitTypeSelect(e)
	{
		updateComponentState(this, {initType: Number(e.target.value)});
	}


	private renderOSVersion(options: IOSVersion[])
	{
		return (
			<RowCol>
				<h5>OS Version:</h5>
				<FormGroup>
					{options.map(option =>
							<Radio key={option.init} checked={this.state.initType === option.init} onChange={this.onInitTypeSelect.bind(this)} value={option.init.toString()}>
								{option.label}
							</Radio>
						)}
				</FormGroup>
			</RowCol>
		);
	}

	private renderOneLineInstall()
	{
		const line = `DS_LIC=${this.props.licenseKey} bash -c "$(curl -L https://infra-install.dripstat.com/install.sh)"`;
		return (
			<RowCol>
				<h4>Option 1 - One Line install</h4>
				<p>Copy/paste the following line in your linux terminal:</p>
				<pre>{line}</pre>
			</RowCol>
		);
	}

	private ansibleSamplePlaybookCode()
	{
		return `- hosts: myServers
  roles:
  - {role: Dripstat.dripstat-infra, become: yes, ds_lic: "${this.props.licenseKey}" }`
	}

	render()
	{
		const bitselect = (
			<RowCol xs={6}>
				<h5>Architecture:</h5>
				<FormGroup>
					<Radio checked={this.state.bit === Bitness.Bit64} onChange={this.onBitSelect.bind(this)} value={Bitness.Bit64.toString()}>
						64 bit
					</Radio>
					<Radio checked={this.state.bit === Bitness.Bit32} onChange={this.onBitSelect.bind(this)} value={Bitness.Bit32.toString()}>
						32 bit
					</Radio>

				</FormGroup>
			</RowCol>
		) ;

		const ubuntuOptions = this.renderOSVersion([
			{label: "Ubuntu 15 or higher", init: LinuxInit.Systemd},
			{label: "Ubuntu 12 to Ubuntu 14", init: LinuxInit.Upstart}
		]);

		const debianOptions = this.renderOSVersion([
			{label: "Debian 8 or higher", init: LinuxInit.Systemd},
			{label: "Debian 7", init: LinuxInit.Sysv}
		]);
		const rhelOptions = this.renderOSVersion([
			{label: "RedHat 7/CentOS 7 or higher", init: LinuxInit.Systemd},
			{label: "RedHat 6/CentOS 6", init: LinuxInit.Upstart}
		]);

		let osOptions;
		let installCode;
		let bitness;
		switch (this.state.platform)
		{
			case Platform.Ubuntu:
				osOptions = ubuntuOptions;
				installCode = this.ubuntuInstallCode(this.state.initType);
				break;
			case Platform.Debian:
				osOptions = debianOptions;
				installCode = this.ubuntuInstallCode(this.state.initType);
				break;
			case Platform.RedHat:
				osOptions = rhelOptions;
				installCode = this.rhelInstallCode(this.state.bit, this.state.initType);
				bitness = bitselect;
				break;
			case Platform.Amazon:
				installCode = this.rhelInstallCode(this.state.bit, this.state.initType);
				bitness = bitselect;
				break;
			default: //no OS selected
				break;
		}

		let code, osSection, cmSection;
		if(this.state.platform != null)
		{
			if(this.state.platform === Platform.Ansible)
			{
				cmSection = (
					<RowCol>
						<p>Install the <a href="https://galaxy.ansible.com/Dripstat/dripstat-infra/" target="_blank">dripstat-infra</a> role from Ansible Galaxy on your Ansible server</p>
						<pre>
								{"ansible-galaxy install Dripstat.dripstat-infra"}
						</pre>
						<p className="top2">
							Use it in your playbook with the DripStat License key, eg:
						</p>
						<pre>
							{this.ansibleSamplePlaybookCode()}
						</pre>
					</RowCol>
				);


			}
			else
			{
				code = (
					<RowCol>
						<h5>Installation Code:</h5>
						<pre>
						{installCode}
						</pre>

						<RowCol className={"top1"}>
							<div>A few minutes after installation, the server should appear in the Server List</div>
						</RowCol>
					</RowCol>
				);

				osSection = (
					<div>
						{osOptions}
						{bitness}
						{code}
					</div>
				);
			}
		}


		return (
		<div>
			<Grid>
				<div className="top3">
				{this.renderOneLineInstall()}
				</div>
			<RowCol xs={6} className="top3">
				<h4>Option 2 - Manual Install</h4>
				<p>Alternatively, if you want manual step-by-step instructions:</p>
				<h5 className="top2">Select OS:</h5>
				<FormGroup>
					<Radio checked={this.state.platform === Platform.Ubuntu} onChange={this.onOSSelect.bind(this)} value={Platform.Ubuntu.toString()}>
						Ubuntu
					</Radio>
					<Radio checked={this.state.platform === Platform.Debian} onChange={this.onOSSelect.bind(this)} value={Platform.Debian.toString()}>
						Debian
					</Radio>
					<Radio checked={this.state.platform === Platform.RedHat} onChange={this.onOSSelect.bind(this)} value={Platform.RedHat.toString()}>
						RedHat/CentOS
					</Radio>
					<Radio checked={this.state.platform === Platform.Amazon} onChange={this.onOSSelect.bind(this)} value={Platform.Amazon.toString()}>
						Amazon Linux
					</Radio>

				</FormGroup>
			</RowCol>


				{osSection}

			<div className="top3">
				<h4>Option 3 - Configuration Management Systems</h4>
				<FormGroup className="top2">
					<Radio checked={this.state.platform === Platform.Ansible} onChange={this.onOSSelect.bind(this)} value={Platform.Ansible.toString()}>
						Ansible
					</Radio>
				</FormGroup>
			</div>
				{cmSection}
			<RowCol className='top2'>
				<Link to="servers" className="btn btn-success"><i className="fa fa-chevron-left"/>{' Back to Server List'}</Link>
			</RowCol>

			</Grid>
		</div>
		);
	}
}