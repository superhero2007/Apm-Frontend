import {DayOfWeekChart} from "./dayOfWeekChart";
export class TimeOfDayChart extends DayOfWeekChart
{
	protected getTooltipHeading(obj:any)
	{
		const number = Number(obj.x);

		const next = number +1;
		let displayNext;

		if(next < 10)
			displayNext = "0"+next;
		else
			displayNext = next;

		return obj.x+":00-"+displayNext+":00";
	}
}