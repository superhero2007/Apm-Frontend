export class JSONEncoder
{
	public static encode(obj:any):string
	{
		const json = JSON.stringify(obj);
		return btoa(json);
	}


	public static decode(str:string):any
	{
		const json = atob(str);
		return JSON.parse(json);
	}
}