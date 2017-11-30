import * as moment from "moment";
import * as _ from "lodash";
import "moment-duration-format";
import {MetricCategory} from "../reducers/esReducer";
import {IDataPoint} from "./views/metricDetailView";

export function roundToTwo(num) {
	var x = +(Math.round(num + <any>"e+2") + "e-2");
	if(isNaN(x))
		return 0;
	return x;
}

export function loadAvgDisplay(loadAvg: number)
{
	return roundToTwo(loadAvg)+"";
}

export function errRateDisplay(errRateInPct: number)
{
	return roundToTwo(errRateInPct)+"%";
}

export function cpuPctDisplay(cpuPct: number)
{
	return errRateDisplay(cpuPct);
}

export function nanoToMilis(value: number) {
	return value / (1000 * 1000);
}

export function responseTimeDisplay(timeInMilis: number): string {

	if (timeInMilis < 1000) // < 1 second
		return roundToTwo(timeInMilis) + "ms";
	else if (timeInMilis < 1000 * 60)  // < 1 minute
		return roundToTwo(moment.duration(timeInMilis).asSeconds()) + "s";
	else if (timeInMilis < 1000 * 60 * 60) // 1 hour
		return roundToTwo(moment.duration(timeInMilis).asMinutes()) + "min";
	else
		return roundToTwo(moment.duration(timeInMilis).asHours()) + "hr";
}

export enum Units {
	KB = 1000,
	MB = KB * KB,
	GB = KB * KB * KB
}

export function perSecondDisplay(func:(number)=>string)
{
	return function (value: number)
	{
		return func(value)+"/s"
	}
}
export function megaByteDisplay(totalMBs: number): string
{
	return byteDisplay(totalMBs* Units.MB);
}


export function byteDisplay(totalBytes: number): string
{
	if (totalBytes >= (Units.GB))
		return roundToTwo((totalBytes/Units.GB)) +"GB";

	if (totalBytes >= (Units.MB))
		return roundToTwo((totalBytes/Units.MB)) +"MB";

	if (totalBytes >= (Units.KB))
		return roundToTwo((totalBytes/Units.KB)) +"KB";

	if(totalBytes == 1)
		return "1 byte";

	return roundToTwo(totalBytes) +"bytes";
}

export function dataPointsDifference(data1:IDataPoint[], data2:IDataPoint[]):IDataPoint[] {
	const data3:IDataPoint[] = [];

	_.each(data1, (pt1:IDataPoint, index:number) => {
		const pt2 = data2[index];

		const val = pt1.v - pt2.v;

		data3.push({t: pt1.t, v: val});
	});

	return data3;
}

export function throughputDisplay(thp:number):string
{
	return throughputUnit(thp) +" RPM";
}


export function epmDisplay(thp:number):string
{
	return throughputUnit(thp) +" EPM";
}

export function throughputUnit(thp: number): string
{
	let suffix = "";
	if(thp >= 1000000)
	{
		thp/=1000000;
		suffix="M";
	}
	else if(thp >= 1000)
	{
		thp/=1000;
		suffix="k";
	}

	thp = roundToTwo(thp);

	return thp + suffix;
}

export function metricCategoryDisplay(cat: MetricCategory): string
{
	switch (cat)
	{
		case MetricCategory.DDB:
			return "Dynamo DB";
		case MetricCategory.DocDB:
			return "DocumentDB";
		case MetricCategory.Rest:
			return "External Services";
		case MetricCategory.ES:
			return "ElasticSearch";
		case MetricCategory.CQL:
			return "Cassandra";
		case MetricCategory.Mongo:
			return "MongoDB";
		case MetricCategory.Exception:
			return "Errors";
		case MetricCategory.Txn:
			return "Transactions";
		case MetricCategory.RemoteEJB:
			return "Remote EJB Calls";
		default:
			return MetricCategory[cat];
	}

}

export function getOpsCategory(cat: MetricCategory): MetricCategory
{
	switch (cat)
	{
		case MetricCategory.SQL:
			return MetricCategory.SQLOPS;
		case MetricCategory.Mongo:
			return MetricCategory.MongoOps;
		case MetricCategory.Riak:
			return MetricCategory.RiakOps;
		case MetricCategory.CQL:
			return MetricCategory.CQLOPS;
		case MetricCategory.DDB:
			return MetricCategory.DDBOps;
		case MetricCategory.SQS:
			return MetricCategory.SQSOPS;
		case MetricCategory.OrientDb:
			return MetricCategory.OrientDbOps;
		case MetricCategory.DocDB:
			return MetricCategory.DocDBOps;
	}
	return null;
}

export function awsCategories()
{
	return [
		MetricCategory.DDB,
		MetricCategory.S3,
		MetricCategory.SQS,
		MetricCategory.SNS,
		MetricCategory.SES,
		MetricCategory.Kinesis
	];
}


export function dbCategories()
{
	return [
		MetricCategory.SQL,
		MetricCategory.Mongo,
		MetricCategory.Redis,
		MetricCategory.CQL,
		MetricCategory.Solr,
		MetricCategory.DDB,
		MetricCategory.Memcached,
		MetricCategory.Couchbase,
		MetricCategory.Riak,
		MetricCategory.ES,
		MetricCategory.OrientDb,
		MetricCategory.DocDB,
		MetricCategory.AliOSS
	];
}
export  function featuresToMetricCategories(features:string[], existingCategories: MetricCategory[]):MetricCategory[]
{
	const mapping = [];
	for (const c of existingCategories)
	{
		const feature = MetricCategory[c].toLowerCase();
		mapping[feature] = c;
	}

	const keys = Object.keys(mapping);

	return features
		.filter(f => keys.includes(f))
		.map(f => mapping[f]);
}

export function normalizeUnnamedTxn(list: {name?: string, seriesName?: string;}[])
{
	return list.map(item => {
		const newItem = JSON.parse(JSON.stringify(item));

		if(newItem.name === "/<unnamedTxn>")
		{
			newItem.name = "(Unnamed Transaction)";
		}

		if(newItem.seriesName === "/<unnamedTxn>")
		{
			newItem.seriesName = "(Unnamed Transaction)";
		}


		return newItem;
	});
}