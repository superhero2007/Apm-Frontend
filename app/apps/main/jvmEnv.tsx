import * as React from "react";
import * as _ from "lodash";
import {Col, Row} from "react-bootstrap";
import {DSTable} from "../../widgets/dsTable";
import {RowCol} from "../../widgets/rowCol";
import {byteDisplay} from "../../es/metricUtils";

interface IJar
{
	name: string;
	versions: string[];
}

interface IModules
{
	jars: IJar[];
}

interface IEnvInfo
{
	appServer?;
	appServerVersion?;
	port?: number;

	osName: string;
	osVersion: string;
	host: string;
	agentVersion: string;
	cpuCount: string;

	systemRam?;

	javaVersion: string;
	javaVendor: string;
	javaVMName?: string;

	arch: string;
	pid;

	heapMaxBytes;
	heapInitialBytes;
	gcNames: string;

	jvmArgs: string[];
}

export interface IJVMEnv
{
	modules: IModules;
	envinfo: IEnvInfo;
}

class PropInfo
{
	constructor(public name: string, public value)
	{
	}
}

export class JvmEnvView extends React.Component<{
	env: IJVMEnv;
}, {}>
{
	private propsToRows(props: PropInfo[])
	{
		return props.map(p => (
			<tr key={p.name}>
				<td>{p.name}</td>
				<td>{p.value}</td>
			</tr>
		));
	}

	render()
	{
		const env = this.props.env;

		let jarTable;
		if(env.modules && !_.isEmpty(env.modules.jars))
		{
			const sortedJars = _.sortBy(env.modules.jars, j => j.name );
			jarTable = (
				<DSTable columnNames={["Jar","Version"]}>
					{
						sortedJars.map(jar => {
							const versionStr = _.isEmpty(jar.versions)? "": jar.versions.join(",");
							return (
								<tr key={jar.name}>
									<td>{jar.name}</td>
									<td>{versionStr}</td>
								</tr>);
						})
					}
				</DSTable>
			);
 		}

 		const envInfo = env.envinfo;

		const systemProps:PropInfo[] = [];

		systemProps.push(new PropInfo("Host", envInfo.host));
		if(envInfo.systemRam)
		{
			systemProps.push(new PropInfo("System RAM", byteDisplay(envInfo.systemRam)));
		}

		systemProps.push(new PropInfo("Processor Count", envInfo.cpuCount));

		if(!_.isEmpty(envInfo.appServer))
		{
			systemProps.push( new PropInfo("App Server", envInfo.appServer));
		}
		if(!_.isEmpty(envInfo.appServerVersion))
		{
			systemProps.push(new PropInfo("App Server Version", envInfo.appServerVersion));
		}

		if(envInfo.port)
		{
			systemProps.push(new PropInfo("App Server Port", envInfo.port));
		}

		systemProps.push(new PropInfo("OS", envInfo.osName));
		systemProps.push(new PropInfo("OS Version", envInfo.osVersion));
		systemProps.push(new PropInfo("DripStat Agent Version", envInfo.agentVersion));



		const jvmProps: PropInfo[] = [];

		jvmProps.push(new PropInfo("Java Version", envInfo.javaVersion));
		jvmProps.push(new PropInfo("Java Vendor", envInfo.javaVendor));

		if(!_.isEmpty(envInfo.javaVMName))
		{
			jvmProps.push(new PropInfo("Java VM Name", envInfo.javaVMName));
		}

		jvmProps.push(new PropInfo("Architecture", envInfo.arch));
		jvmProps.push(new PropInfo("Process ID", envInfo.pid));

		if(envInfo.heapMaxBytes)
		{
			jvmProps.push(new PropInfo("Heap - Max", byteDisplay(envInfo.heapMaxBytes)));
		}

		if(envInfo.heapInitialBytes)
		{
			jvmProps.push(new PropInfo("Heap - Initial", byteDisplay(envInfo.heapInitialBytes)));
		}

		if(!_.isEmpty(envInfo.gcNames))
		{
			jvmProps.push(new PropInfo("GC Algorithms in use", envInfo.gcNames));
		}

		let uniqJVMArgs = [];

		if(!_.isEmpty(envInfo.jvmArgs))
		{
			uniqJVMArgs = _.uniq(envInfo.jvmArgs).sort();
		}

		return (
			<Row>
				<Col xs={6}>
					<RowCol>
					<h4>System</h4>
						<DSTable columnNames={["Property", "Value"]}>
							{this.propsToRows(systemProps)}
						</DSTable>
					</RowCol>
					<RowCol>
						<h4>JVM</h4>
						<DSTable columnNames={["Property", "Value"]}>
							{this.propsToRows(jvmProps)}
						</DSTable>
					</RowCol>
					<RowCol>
						<h4>JVM Arguments</h4>
						<DSTable columnNames={["Argument"]}>
							{uniqJVMArgs.map(arg => (
								<tr key={arg}>
									<td>
										{arg}
									</td>
								</tr>

							))}
						</DSTable>
					</RowCol>
				</Col>
				<Col xs={6}>
					<h4>Libraries</h4>
					{jarTable}
				</Col>
			</Row>

		);
	}
}