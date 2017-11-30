import moment = require('moment');

export interface ISer_TimeRange
{
    c: boolean;
    d?:number;
    u?:string;
    b?:number; // in millis
    e?:number; // in millis
}

export abstract class AbstractTimeRange
{
    constructor(public isCustom:boolean)
    {
    }

    public static deserialize(range:ISer_TimeRange):AbstractTimeRange
    {
        if(range.c)
            return CustomTimeRange.deserialize(range);
        else
            return TimeRange.deserialize(range);
    }

    public abstract serialize():ISer_TimeRange;
    public abstract toUnix():UnixTimeRange;
    public abstract equals(other:AbstractTimeRange):boolean;
    public abstract displayStr(): string;
}

export class TimeRange extends AbstractTimeRange
{

    static defaultRange = new TimeRange("30 mins", 30, 'm');

    constructor(public label:string, public duration:number, public unit:string)
    {
        super(false);
    }

    static deserialize(range:ISer_TimeRange):TimeRange
    {

        var unit;

        switch (range.u) {
            case 'm':
                unit = "mins";
                break;
            case 'h':
                if (range.d == 1)
                    unit = "hr";
                else
                    unit = "hrs";
                break;
            case 'd':
                unit = "days";
                break;
        }

        return new TimeRange(range.d + ' ' + unit, range.d, range.u);
    }

    public toUnix():UnixTimeRange
    {
        var end = moment().subtract(<any>2, <any>"m");
        var begin = end.clone().subtract(<any>this.duration, <any> this.unit);

        return UnixTimeRange.fromMoments(begin, end);
    }

    public serialize():ISer_TimeRange
    {
        return {d: this.duration, u: this.unit, c: this.isCustom};
    }

    public equals(other:AbstractTimeRange):boolean
    {
        if (other === null || other.isCustom)
            return false;

        const o = other as TimeRange;
        return (o.duration === this.duration) && (o.unit === this.unit);
    }

    //return true if this is greater than other
    greaterThan(other:TimeRange):boolean
    {
        if (this.unit === other.unit) {
            return this.duration > other.duration;
        }


        //different units. just need to compare the units then

        if (this.unit === 'd') //all other units are below
        {
            return true;
        }

        if (this.unit === 'h') {
            if (other.unit === 'm')
                return true;
            else
                return false;
        }

        //this.unit === 'm'
        //everything else is higher

        return false;

    }

    public displayStr(): string
    {
        return `Last ${this.label}`;
    }
}

export class CustomTimeRange extends AbstractTimeRange
{
    constructor(public begin:moment.Moment, public end:moment.Moment)
    {
        super(true);
    }

    public serialize():ISer_TimeRange
    {
        return {c: true, b:this.begin.valueOf(), e: this.end.valueOf()};
    }

    public toUnix():UnixTimeRange
    {
        return new UnixTimeRange(this.begin.valueOf(), this.end.valueOf());
    }

    public equals(other:AbstractTimeRange):boolean
    {
        if (other === null || other.isCustom===false)
            return false;

        const o = other as CustomTimeRange;
        return (o.begin.valueOf() === this.begin.valueOf()) && (o.end.valueOf() === this.end.valueOf());
    }

    public displayStr(): string
    {
        const diff = this.end.diff(this.begin, "seconds");
        const duration = moment.duration(diff,'seconds').humanize();
        return  duration+ " From " + this.begin.format("hh:mm") + ' to ' + this.end.format("hh:mm");
    }

    static deserialize(range:ISer_TimeRange):CustomTimeRange
    {
        return new CustomTimeRange( moment(range.b), moment(range.e));
    }
}

export class UnixTimeRange
{
    /**
     *
     * @param begin in milliseconds
     * @param end   in milliseconds
     */
    constructor(public begin:number, public end:number)
    {
    }

    public static fromMoments(begin:moment.Moment, end:moment.Moment):UnixTimeRange
    {
        return new UnixTimeRange(begin.valueOf(), end.valueOf());
    }
}

