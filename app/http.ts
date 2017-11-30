import {profile} from './profile';

export class Http
{
	public static get(url: string): JQueryXHR
	{
		if (!url.startsWith("/"))
			console.log("passed url doesnt start with '/' " + url);

		return $.get(profile.restServerUrl + url);
	}

	public static post(url: string, params?: any): JQueryXHR
	{
		if (!url.startsWith("/"))
			console.log("passed url doesnt start with '/' " + url);

		return $.post(profile.restServerUrl + url, params);
	}

	public static postJSON(url: string, data: any): JQueryXHR
	{
		if (!url.startsWith("/"))
			console.log("passed url doesnt start with '/' " + url);

		return $.ajax({
			type: "POST",
			url: profile.restServerUrl + url,
			data: JSON.stringify(data),
			contentType: "application/json",
			processData: false
		});
	}

	public static postJSONRecvBinary(url: string, params: any): Promise<any>
	{
		if (!url.startsWith("/"))
			console.log("passed url doesnt start with '/' " + url);

		return new Promise(function (resolve, reject)
		{
			const paramString = $.param(params);
			const xhr = new XMLHttpRequest();
			xhr.responseType = 'arraybuffer';
			xhr.withCredentials = true;
			xhr.open('POST', profile.restServerUrl + url + "?" + paramString);
			xhr.onload = resolve;
			xhr.onerror = reject;
			xhr.send();
		});

	}
}