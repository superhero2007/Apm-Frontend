import * as moment from "moment";
export class AlertUtils
{
	public static currentUnixTime()
	{
		return moment().unix();
	}

	public static humanize_IncidentId(incidentId)
	{
		return AlertUtils.firstLettersOfSHA(incidentId, 5);
	}

	public static humanize_ViolationId(violationId)
	{
		return AlertUtils.firstLettersOfSHA(violationId, 5);
	}

	public static humanize_unixtime(time:number, endTimeMsg?:string)
	{
		if(this.hasNotEnded(time)) {
			return endTimeMsg? endTimeMsg: "-";
		}
		return moment.unix(time).format("MMM DD HH:mm");
	}

	public static humanize_unixtime_dateonly(time:number)
	{
		return moment.unix(time).format("MMM DD");
	}

	public static humanize_unixtime_custom(time:number, formatStr: string)
	{
		return moment.unix(time).format(formatStr);
	}

	public static hasNotEnded(endTime:number)
	{
		return endTime === 1826447397;
	}

	private static firstLettersOfSHA(sha, numLetters:number)
	{
		if (sha)
			return sha.substring(0, numLetters);

		return "";
	}
}