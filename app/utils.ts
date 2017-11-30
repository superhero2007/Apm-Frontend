import * as React from 'react';
import {Http} from "./http";
import {profile} from "./profile";
import {RouteComponentProps} from "react-router";
import * as _ from 'lodash';

export interface ICancellablePromise {
	promise: Promise<any>;
	cancel: ()=>void;
}
export function makeCancelable(promise:JQueryGenericPromise<any>):ICancellablePromise
{
	let hasCanceled_ = false;

	return {
		promise: new Promise(
			(resolve, reject) => promise
				.then(r => hasCanceled_
					? reject({isCanceled: true})
					: resolve(r)
				)
		),
		cancel() {
			hasCanceled_ = true;
		}
	};
}

export function logout()
{
	Http.post("/logout").then(()=> {
		window.location.replace(profile.websiteUrl);
	});
}

export function getRouteParam(props, paramName:string)
{
	const routeParams = (props as RouteComponentProps<any,any>).params;
	return routeParams[paramName];
}

export function updateComponentState(component:React.Component<any,any>, updatedState:any)
{
	const newState = Object.assign({}, component.state, updatedState);
	component.setState(newState);
}

export function isNotPresent(obj: any)
{
	return obj === null || _.isUndefined(obj);
}

export function isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}