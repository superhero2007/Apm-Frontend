import Highcharts = require('highcharts');

interface ITooltipNameable
{
	name:string;
}
export interface ITooltipPoint
{
	percentage:number;
	point:ITooltipNameable;
	series:ITooltipNameable;
	total:number;
	y:number;
	x:number;
}
export interface ITooltipSharedPoint
{
	points:ITooltipPoint[];
	x:number;
}

export abstract class AbstractTooltip
{
	constructor(protected valDisplay:(number)=>string, private shared:boolean)
	{
	}

	isShared()
	{
		return this.shared;
	}

	protected static customTooltipHeader(timestamp:number, body:string)
	{
		var ts = Highcharts.dateFormat('%A %b %d, %H:%M', timestamp);
		return "<b>" + ts + "</b>" + body;
	}

	abstract generateStr(pt):string;
}

export class SharedTooltip extends AbstractTooltip
{
	constructor(valDisplay:(number)=>string, protected showTotal=true)
	{
		super(valDisplay, true);
	}

	generateStr(point:ITooltipSharedPoint): string
	{
		let str = "";
		let total;
		for (let pt of point.points)
		{
			total = pt.total;
			str += `<br/>${pt.series.name}: ${this.valDisplay(pt.y)}`;
		}
		if (total && this.showTotal) {
			str += `<br/><b>Total:  ${this.valDisplay(total)}</b>`;
		}

		return this.addContentToHeader(point, str);
	}

	protected addContentToHeader(point: ITooltipSharedPoint, str: string)
	{
		return SharedTooltip.customTooltipHeader(point.x, str);
	}

	protected getPointByName(sharedPt:ITooltipSharedPoint, name:string):ITooltipPoint
	{
		for (let pt of sharedPt.points)
		{
			if(pt.series.name == name)
				return pt;
		}

		return null;
	}

	protected barebonesTooltip(point:ITooltipSharedPoint)
	{
		return SharedTooltip.customTooltipHeader(point.x, "");
	}

}

export class ReverseSharedTooltip extends SharedTooltip
{
	constructor(valDisplay:(number)=>string, showTotal=true)
	{
		super(valDisplay, showTotal);
	}

	generateStr(point:ITooltipSharedPoint): string
	{
		let str = "";
		let total;

		for(let i= point.points.length-1; i>=0;i--)
		{
			const pt = point.points[i];
			total = pt.total;
			str += `<br/>${pt.series.name}: ${this.valDisplay(pt.y)}`;
		}

		if (total && this.showTotal) {
			str += `<br/><b>Total:  ${this.valDisplay(total)}</b>`;
		}

		return this.addContentToHeader(point, str);
	}

}

export class RealtimeSharedTooltip extends SharedTooltip
{
	constructor(valDisplay: (number)=>string, showTotal: boolean)
	{
		super(valDisplay, showTotal);
	}


	public static perSecondHeader(timestamp:number, body:string)
	{
		var ts = Highcharts.dateFormat('%H:%M:%S', timestamp);
		return "<b>" + ts + "</b>" + body;
	}

	protected addContentToHeader(point: ITooltipSharedPoint, str: string): string
	{
		return RealtimeSharedTooltip.perSecondHeader(point.x, str);
	}
}

export class PointTooltip extends AbstractTooltip
{
	constructor(valDisplay:(number)=>string, private seriesName: string = null)
	{
		super(valDisplay, false);
	}

	generateStr(point:ITooltipPoint): string
	{
		const valDisplay = this.valDisplay(point.y);
		const name = this.seriesName == null? point.series.name: this.seriesName;
		const str = `<br/>${name}: <b>${valDisplay}</b>`;
		return SharedTooltip.customTooltipHeader(point.x, str);
	}
}