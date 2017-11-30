import {Http} from "./http";
import {profile} from "./profile";
import {IAccountInfo} from "./apps/addJVMPage";

declare const require:any;
const amplitude = require('amplitude-js');

interface IAnalyticsLoader
{
	onLoad(data:IAccountInfo);
}

export class Analytics
{
	private static loadAccountStatus()
	{
		return Http.post("/accStatus");
	}

	private static loadUserAccount()
	{
		return Http.get("/accountinfo");
	}

	private static getQueryParameterByName(name) {
		name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
        const regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
            results = regex.exec(location.search);
        return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
	}


	private static shouldLoadPrelim()
	{
		if(profile.isProd)
		{
            const isMasterUser = this.getQueryParameterByName("isMasterUser");

            if(isMasterUser!= 'true')
			{
				return true;
			}
		}

		return false;
	}

	private static LoadIfNeeded(loaders:IAnalyticsLoader[])
	{
		if(this.shouldLoadPrelim())
		{
			this.loadAccountStatus().then(data => {
				if (data.isApmUser)
				{
					this.loadUserAccount().then(data => {
						for(var ldr of loaders)
						{
							ldr.onLoad(data);
						}
					});
				}
			});
		}
	}


	static load()
	{
		const loaders:IAnalyticsLoader[] =[new IntercomAnalytics(), new AmplitudeAnalytics()];
		this.LoadIfNeeded(loaders)
	}

}

class IntercomAnalytics implements IAnalyticsLoader
{
	onLoad(data:IAccountInfo)
	{
		var intercom_appId = "6ityk7f0";
		var intercomObj = {
			app_id: intercom_appId,
			email: data.email,
			user_id: data.intercomId,
			created_at: data.createdAt,
			name: data.fullName,
			widget: {
				activator: '#IntercomDefaultWidget'
			}
		};
		(<any>window).Intercom('boot', intercomObj);
	}
}


export class AmplitudeAnalytics implements IAnalyticsLoader
{
	static enabled;

	onLoad(data:IAccountInfo)
	{
		AmplitudeAnalytics.enabled = true;
		amplitude.init("cc60b4fe9280721678ce67dba4bfb1b4");
		amplitude.setUserId(data.email);

        const identify = new amplitude.Identify()
            .setOnce('accountId', data.accId)
            .setOnce('isPro', data.isPro)
            .setOnce('hasTrial', data.hasTrial);
        amplitude.identify(identify);
	}

	static track(event: string)
	{
		if(this.enabled)
		{
			amplitude.logEvent(event);
		}
	}

	static trackWithProps(event: string, props:any)
	{
		if(this.enabled)
		{
			amplitude.logEvent(event, props);
		}
	}
}