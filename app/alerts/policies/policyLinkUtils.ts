import {getRouteParam} from "../../utils";
export class PolicyURLGen
{
	static createUrlForPolicyId(props, relativeUrl:string)
	{
		if (relativeUrl.startsWith("/"))
			console.log("relative url must NOT start with /");

		let policyId = getRouteParam(props, "policyId");
		return `/policy/${policyId}/${relativeUrl}`;
	}
}