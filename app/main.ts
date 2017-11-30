import * as ReactDOM from "react-dom";
import {routes} from "./routes";
import {profile} from "./profile";
import {Analytics} from "./analytics";
import './antdcss'
import Highcharts = require('highcharts');

$.ajaxSetup({
	cache: false,
	xhrFields: {
		withCredentials: true
	}
});

$(document).ajaxError(function myErrorHandler(event, xhr: JQueryXHR) {
	if (xhr.status == 401)
	{
		window.location.replace(profile.loginUrl);
	}
});

Highcharts.setOptions({
	global: {
		useUTC: false
	},
	plotOptions: {
		series: {
			animation: false
		}
	}
});

ReactDOM.render(routes, document.getElementById('myapp'));

Analytics.load();
