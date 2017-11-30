import {PercentageThresholdConfigPanel} from "./percentageThesholdConfigPanel";
import {ResponseTimeThresholdConfigPanel} from "./responseTimeThresholdConfigPanel";
import {THPThresholdConfigPanel} from "./thpThresholdConfigPanel";

export enum MetricUnit {
	RESPONSE_TIME,
	PERCENTAGE,
	THP
}

export enum TargetType {
	JVM,
	APP,
	TXN,
	EXT_SVC,
	SERVER
}
export enum AlertMetricType {
	HEAP,
	GC,
	RESP_TIME,
	THP,
	ERR_RATE,
	CPU,
	MEM,
	DISK
}

class AlertTarget
{
	constructor(public type: TargetType, public name: string){}
}

class AlertMetric
{
	constructor(public type: AlertMetricType, public name: string, public unit: MetricUnit){}
}

export class MetricDefinition {
	constructor(
		public id: string,
		public target:TargetType,
		public metric: AlertMetricType
	) {}

	metricName()
	{
		return AlertConditionProperties.metrics.find(m => m.type === this.metric).name;
	}

	targetName()
	{
		return AlertConditionProperties.targets.find(m => m.type === this.target).name;
	}

	unit()
	{
		return AlertConditionProperties.metrics.find(m => m.type === this.metric).unit;
	}

	label()
	{
		return `${this.targetName()} ${this.metricName()}`;
	}
}

export class AlertConditionProperties
{
	public static targets: AlertTarget[] = [
		new AlertTarget(TargetType.JVM, "JVM"),
		new AlertTarget(TargetType.APP, "Application"),
		new AlertTarget(TargetType.TXN, "Transaction (Pinned)"),
		new AlertTarget(TargetType.EXT_SVC, "External Service"),
		new AlertTarget(TargetType.SERVER, "Server")
	];

	public static metrics: AlertMetric[] = [
		new AlertMetric(AlertMetricType.HEAP, "Heap Usage", MetricUnit.PERCENTAGE),
		new AlertMetric(AlertMetricType.GC, "GC Percentage", MetricUnit.PERCENTAGE),
		new AlertMetric(AlertMetricType.ERR_RATE, "Error Rate", MetricUnit.PERCENTAGE),
		new AlertMetric(AlertMetricType.RESP_TIME, "Response Time", MetricUnit.RESPONSE_TIME),
		new AlertMetric(AlertMetricType.THP, "Throughput", MetricUnit.THP),
		new AlertMetric(AlertMetricType.CPU, "CPU", MetricUnit.PERCENTAGE),
		new AlertMetric(AlertMetricType.MEM, "Memory", MetricUnit.PERCENTAGE),
		new AlertMetric(AlertMetricType.DISK, "Fullest Disk", MetricUnit.PERCENTAGE)
	];

	public static metricDefinitions = [
		new MetricDefinition("APP_ResponseTime", TargetType.APP, AlertMetricType.RESP_TIME),
		new MetricDefinition("APP_Thp",TargetType.APP, AlertMetricType.THP),
		new MetricDefinition("APP_ErrRate",TargetType.APP, AlertMetricType.ERR_RATE),
		new MetricDefinition("JVM_ResponseTime", TargetType.JVM, AlertMetricType.RESP_TIME),
		new MetricDefinition("JVM_Thp",TargetType.JVM, AlertMetricType.THP),
		new MetricDefinition("JVM_ErrRate",TargetType.JVM, AlertMetricType.ERR_RATE),
		new MetricDefinition("JVM_HighGC",TargetType.JVM, AlertMetricType.GC),
		new MetricDefinition("JVM_HighHeap",TargetType.JVM, AlertMetricType.HEAP),
		new MetricDefinition("TXN_ResponseTime",TargetType.TXN, AlertMetricType.RESP_TIME),
		new MetricDefinition("TXN_Thp",TargetType.TXN, AlertMetricType.THP),
		new MetricDefinition("TXN_ErrRate",TargetType.TXN, AlertMetricType.ERR_RATE),
		new MetricDefinition("EXTSVC_ResponseTime",TargetType.EXT_SVC, AlertMetricType.RESP_TIME),
		new MetricDefinition("EXTSVC_Thp",TargetType.EXT_SVC, AlertMetricType.THP),
		new MetricDefinition("SERVER_Cpu",TargetType.SERVER, AlertMetricType.CPU),
		new MetricDefinition("SERVER_Mem",TargetType.SERVER, AlertMetricType.MEM),
		new MetricDefinition("SERVER_Disk",TargetType.SERVER, AlertMetricType.DISK)
	];
	
	public static getMetricDefById(id: string)
	{
		return this.metricDefinitions.find(def => def.id === id);
	}

	public static getMetricDef(target: TargetType, metric: AlertMetricType)
	{
		return this.metricDefinitions.find(def => (def.metric === metric) && (def.target === target));
	}
}


export class MetricDefUtils
{

	static getThresholdConfigPanel(metric:MetricDefinition)
	{
		let Panel;
		switch (metric.unit()) {
			case MetricUnit.PERCENTAGE:
				Panel = PercentageThresholdConfigPanel;
				break;
			case MetricUnit.RESPONSE_TIME:
				Panel = ResponseTimeThresholdConfigPanel;
				break;
			case MetricUnit.THP:
				Panel = THPThresholdConfigPanel;
				break;
		}

		return Panel;
	}

}