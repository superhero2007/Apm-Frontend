import {ISeriesData, IDataPoint} from "../../es/views/metricDetailView";

export interface IResponseTimeSegment
{
	segmentName:string;
	responseTimes:IDataPoint[];
}


export class SegmentUtils
{
	static toSeriesData(responseTimeSegments:IResponseTimeSegment[]):ISeriesData[]
	{
		return responseTimeSegments.map(r => ({seriesName: r.segmentName, dataPoints: r.responseTimes}));
	}
}