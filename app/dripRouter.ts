import {JSONEncoder} from "./es/routeobj/jsonEncoder";

export abstract class DripRouter
{
	constructor(private router)
	{
	}

	private updateUrl(newPropsJson)
	{
		const url = this.genUrl(newPropsJson);
		this.router.replace(url);
	}

	onPropsChange(oldProps, newProps)
	{
		const oldJson = JSONEncoder.encode(oldProps);
		const newJson = JSONEncoder.encode(newProps);

		if(oldJson != newJson)
		{
			this.updateUrl(newJson);
		}
	}

	updateUrlInitial(json: string)
	{
		this.updateUrl(json);
	}

	protected abstract genUrl(encodedJson: string);

}
