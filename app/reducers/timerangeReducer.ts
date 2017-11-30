import {ISer_TimeRange} from "../es/filters/timerange";
import {UPDATE_TIMERANGE} from "./esReducer";

export interface IRR_Filter_TimeRange {
	timeRange: ISer_TimeRange;
}

export function timeRangeReducer(state={}, action)
{
	switch (action.type)
	{
		case UPDATE_TIMERANGE:
		{
			return {...state, timeRange: action.timeRange};
		}

		default:
			return state;
	}
}