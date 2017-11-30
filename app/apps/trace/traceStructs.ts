import {IDataPoint} from "../../es/views/metricDetailView";
import * as _ from "lodash";
import * as moment from 'moment';

interface ISeries {
	key: string;
}
export interface IDataSet {
	series: ISeries;
	data: IDataPoint[];
}
interface IJVMMetricDetail {
	name: string;
	avgResponseTime: number;
	avgThroughput: number;
	throughputs: IDataPoint[];
	errorCounts: IDataPoint[];
}
export interface IJVMDetail extends IJVMMetricDetail {
	dataList: IDataSet[];
	gcDataList: IDataSet[];
	avgErrRate:number;
	avgResponseTimes: IDataPoint[];
}
export interface ITxnTraceException
{
	cl:   string; //exceptionCls
	stack: string[]; //stacktrace
	ms:    string; //message
}

export interface TraceTopNElem {
	sig:string;
	duration:number;
	count: number;
	isSig:boolean;
}
export interface TopNTraceElems {
	sortedElems:TraceTopNElem[];
	otherDuration:number;
}

export interface TraceSegment {
	children:TraceSegment[];
	classMethodSig:string;
	duration: number; //in nanos
	partialTrace: string[];
	fullTrace:string[];
	restHost:string;
	sql:string;
	cqlop:string;

	parent: TraceSegment; //needs to be assigned through a walker
	uiId:number; //for table/tree ui only - assigned
	hasStack:boolean; //assigned
	displayName:string; //assigned,
	cumulativeParent:boolean; //assigned
}
export interface TxnTrace {
	rootElement:TraceSegment;
	isPartial:boolean;
}

export interface ITraceDetail
{
	topN:TopNTraceElems;
	asyncTopN:TopNTraceElems;
	trace:TxnTrace;
	timeStamp:number; //in seconds
	serverTimestamp:number;
	asyncStats:{[name:string]:number[]};
	host:string; //nullable
	jvmDetail:IJVMDetail;
	statusCode:number;
	customAttributes:{[name:string]:string};
	exceptionData:ITxnTraceException;
	requestParams:{[name:string]:string};
}
class AsyncStat {
	name:string;
	count:number;
	minTime:number;
	maxTime:number;
	totalTime:number;
}


export class TraceWalker {

	acceptTrace(trace:TxnTrace, visitor:(tElem:TraceSegment, parent:TraceSegment)=>void) {
		this.accept(trace.rootElement, null, visitor);
	}

	private accept(tElem:TraceSegment, parent:TraceSegment, visitor:(tElem:TraceSegment, parent:TraceSegment)=>void) {
		visitor(tElem, parent);
		for (var i = 0; i < tElem.children.length; i++) {
			var child = tElem.children[i];
			this.accept(child, tElem, visitor);
		}
	}
}

export class TraceProcessor {

	private static convertToAsyncStats(asyncStats:{[name:string]:number[]}):AsyncStat[] {

		var list = [];
		for (var key in asyncStats) {
			if (asyncStats.hasOwnProperty(key)) {

				var stats = asyncStats[key];

				var asyncStat = new AsyncStat();
				asyncStat.name = key;
				asyncStat.count = stats[0];
				asyncStat.minTime = stats[1];
				asyncStat.maxTime = stats[2];
				asyncStat.totalTime = stats[3];
				list.push(asyncStat);
			}
		}

		return list;
	}

	public static processAsyncStats(asyncStatsMap:{[name:string]:number[]}):TxnTrace {
        const asyncStats = this.convertToAsyncStats(asyncStatsMap);

        const asyncTraces: TraceSegment[] = [];
        let totalAsyncTime = 0;
        asyncStats.forEach(stat => {
            asyncTraces.push(TraceProcessor.createTraceSegments(stat));
            totalAsyncTime+=stat.totalTime;
		});

        const parent: TraceSegment = this.createTraceSegmentForAsync("Async calls", totalAsyncTime);
        parent.children = asyncTraces;
		return  {
			rootElement: parent,
			isPartial: false
		};
	}

	private static createTraceSegments(asyncStat:AsyncStat):TraceSegment {
		if (asyncStat.count == 1) {
			return this.createTraceSegmentForAsync(asyncStat.name, asyncStat.totalTime);
		}
		else {

			var parent:TraceSegment = this.createTraceSegmentForAsync(asyncStat.name + " - " + asyncStat.count + " calls", asyncStat.totalTime);
			this.createChildAsyncTraceSegmentFor(parent, asyncStat.name, asyncStat.maxTime);
			if (asyncStat.count == 2) {
				this.createChildAsyncTraceSegmentFor(parent, asyncStat.name, asyncStat.minTime);
			}
			else {
				var remainingDuration = asyncStat.totalTime - asyncStat.maxTime;
				this.createChildAsyncTraceSegmentFor(parent, asyncStat.name+" - Remaining "+ (asyncStat.count-1)+ " calls", remainingDuration);
			}
			return parent;
		}
	}

	private static createChildAsyncTraceSegmentFor(parent:TraceSegment, name:string, duration:number) {
		var child:TraceSegment = this.createTraceSegmentForAsync(name, duration);
		child.parent = parent;
		parent.children.push(child);
	}

	private static createTraceSegmentForAsync(name, duration):TraceSegment {
		return {
			children: [],
			displayName: name,
			classMethodSig: name,
			duration: duration,
			partialTrace: null,
			cqlop: null,
			fullTrace: null,
			parent: null,
			hasStack: false,
			uiId: 0,
			cumulativeParent: false,
			restHost: null,
			sql: null
		};

	}

	/**
	 * @param segments all segments have the same display name
	 */
	public static combineAndSortSegments(segments:TraceSegment[]):TraceSegment[] {
		if (segments.length <= 3)
			return segments;

		segments = _.sortBy(segments, function (seg:TraceSegment) {
			return seg.duration;
		});
		segments.reverse();

		var newSegments = [segments[0], segments[1], segments[2]];
		var numCombinedSegs = segments.length - 3;
		var combinedSegment = this.combineTraceSegments(segments.slice(3));
		combinedSegment.displayName += " - Remaining " + numCombinedSegs + " calls";
		newSegments.push(combinedSegment);
		return newSegments;
	}

	public static combineTraceSegments(segments:TraceSegment[]):TraceSegment {
        let total = 0;
        segments.forEach(seg => total += seg.duration);

        const combined: TraceSegment = {
            children: [],
            displayName: TraceProcessor.displayClassMethodName(segments[0].classMethodSig),
            classMethodSig: segments[0].classMethodSig,
            duration: total,
            partialTrace: null,
            cqlop: null,
            fullTrace: null,
            parent: segments[0].parent,
            hasStack: false,
            uiId: 0,
            cumulativeParent: false,
            restHost: null,
            sql: null
        };

        return combined;
	}

	public static hasStackTrace(elem:TraceSegment):boolean {
		if (elem.fullTrace == null && elem.partialTrace == null)
			return false;

		return true;
	}

	public static stackTrace(elem:TraceSegment):string[] {
		if (elem.fullTrace != null)
			return elem.fullTrace;

		//both can be null in case we decided to limit number of traces
		if (elem.partialTrace == null)
			return null;

		var trace = [];
		trace.push.apply(trace, elem.partialTrace);

		if (elem.parent != null) {

			var parentStacktrace = TraceProcessor.stackTrace(elem.parent);
			if (parentStacktrace != null)
				trace.push.apply(trace, parentStacktrace);
		}

		return trace;

	}

	private static parseName(clsMethodSig:string) {
		var split = clsMethodSig.split(':');
		var cls = split[0], method = split[1], sig = split[3];
		cls = cls.replace(/\//g, '.'); //replace all '/'s
		return {cls: cls, method: method, sig: sig};
	}


	private static classNameOnly(fullName:string) {
		var split = fullName.split('.');
		return split[split.length - 1];
	}

	static formatCQLOp(cqlop:string) {
		var split = cqlop.split("/");
		if (split.length < 2)
			return "CQL - " + split[0];

		return split[0].toUpperCase() + ' - ' + split[1];
	}
	static displayClassMethodName(clsMethodSig:string):string {
		var elemName = this.parseName(clsMethodSig);
		return this.classNameOnly(elemName.cls) + '.' + elemName.method + '()';
	}

	public static formatDuration(durationInMilis:number) {

		if (durationInMilis < 1000)
			return (<any>(moment.duration(durationInMilis, 'ms'))).format('S') + "ms";
		else
			return (<any>(moment.duration(durationInMilis, 'ms'))).format('s', 2) + "s";

	}
}
