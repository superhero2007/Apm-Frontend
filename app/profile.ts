export interface  IProfile
{
	restServerUrl  :string;
	websiteUrl     :string;
	loginUrl       :string;
	realtimeServer :string;
	isProd         :boolean;
	stripeKey       :string;
}

class DevProfile implements IProfile
{
	restServerUrl = "http://localhost:8080/rest";
	websiteUrl = "http://localhost:8082";
	loginUrl = "http://localhost:8082/test/login.html";
	realtimeServer = "https://realtime.dripstat.com";
	stripeKey = "pk_test_d4Fh6QsIRUlFHGka8oqCBdqj";
	isProd = false;
}

class ProdProfile implements IProfile
{
	restServerUrl = "https://apmgui.dripstat.com/rest";
	websiteUrl = "https://dripstat.com";
	loginUrl = "https://dripstat.com/login/";
	realtimeServer = "https://realtime.dripstat.com";
	stripeKey = "pk_live_7S3Oxlw2lt0tWNsL7gLlBSrQ";
	isProd = true;
}


declare let process: any;

let isProd = false;
let isDevProd = false;
try {
	isProd = process.env.NODE_ENV === "production";
	isDevProd = process.env.NODE_ENV === "devprod";
} catch (e) {
	if(!(e instanceof ReferenceError))
	{
		console.log("error while checking node env for profile", e);
	}
	isProd = false;
}


export let profile:IProfile;

let currentProfileType: string;

if(isProd)
{
	profile = new ProdProfile();
	currentProfileType = "Production";
}
else if (isDevProd)
{
	const devProdProfile = new ProdProfile();
	const tmpDevProfile = new DevProfile();
	devProdProfile.loginUrl = tmpDevProfile.loginUrl+"?profile=devprod";
	devProdProfile.stripeKey = tmpDevProfile.stripeKey;

	profile = devProdProfile;
	currentProfileType = "DevProd";
}
else {
	profile = new DevProfile();
	currentProfileType = "Dev";
}


console.log("using profile: ", currentProfileType);