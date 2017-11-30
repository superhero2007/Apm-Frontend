import * as React from "react";
import * as _ from "lodash";
import {Loading} from "./loading";
import {Http} from "../http";
import {makeCancelable, updateComponentState, ICancellablePromise} from "../utils";

export abstract class LoadableComponent<P,S> extends React.Component<P,{
	loaded:boolean;
	data: S;
}>
{
	private cancellablePromise:ICancellablePromise = null;

	constructor(props, context)
	{
		super(props, context);
		this.state = this.initialLoadingState();
	}

	protected initialLoadingState()
	{
		return {
			loaded: false,
			data: this.initialState()
		};
	};

	componentWillMount()
	{
		this.loadData();
	}

	protected loadData(props?:P)
	{
		let promise:any = this.getPromiseToLoad(props);
		if (promise == null) {

			promise = this.loadHttpRequests(props);
			if(promise == null) {
				let url = this.getPostUrl();
				if (url) {
					promise = Http.post(url, this.getPostData());
				}
			}
		}

		this.loadPromise(promise);
	}


	private loadHttpRequests(props?: P)
	{
		if (_.isUndefined(props))
			props = this.props;

		const requests:any[] = this.getHttpRequests(props);

		if(requests == null || requests.length == 0)
			return null;

		return Promise.all(requests);
	}

	protected getHttpRequests(props:P) :JQueryXHR[]
	{
		return null;
	}

	protected reloadData(nextProps)
	{
		this.cancelExistingPromise();
		updateComponentState(this, this.initialLoadingState());
		this.loadData(nextProps);
	}

	protected loadPromise(promise:any)
	{
		this.cancelExistingPromise();

		if (promise != null) {
			this.cancellablePromise = makeCancelable(promise);
			this.cancellablePromise.promise.then((data)=>
				{
					this.setState({loaded: true, data: this.getStateFromPostResponse(data)});
				})
				.catch((e)=>
				{
					if (!(e && e.isCanceled)) {
						//exception due to something other than cancellation
						throw e;
					}
				});
		}
		else {
			//proimse was null
			this.setState({loaded: true, data: this.getStateFromPostResponse(null)});
		}
	};

	getPromiseToLoad(props?:P):Promise<any>
	{
		return null;
	}

	protected updateMyState(newState:S)
	{
		this.setState({loaded: this.state.loaded, data: newState});
	}

	protected update_myStateProps(newData:any)
	{
		this.updateMyState(Object.assign({}, this.getMyState(), newData));
	}

	protected getMyState():S
	{
		return this.state.data;
	}


	componentWillUnmount()
	{
		this.cancelExistingPromise();
	}

	private cancelExistingPromise()
	{
            if(this.cancellablePromise)
			{
                this.cancellablePromise.cancel();
            }
    }

	render()
	{
		try {
			var content;
			if (!this.state.loaded) {
				content = <Loading/>;
			}
			else {
				content = this.renderContent(this.state.data);
			}
			return (
				<div>
					{content}
				</div>
			);
		} catch (e)
		{
			console.log("error rendering loadable component ", this, e);
			return <h3>Error occured</h3>;
		}

	}

	protected getPostData():any
	{
		return null;
	}

	protected getPostUrl():string
	{
		return null;
	}
	
	protected abstract initialState():S;

	protected abstract getStateFromPostResponse(responseData:any):S;

	protected abstract renderContent(data:S):any;

}
