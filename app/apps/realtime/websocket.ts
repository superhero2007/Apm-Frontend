import {profile} from "../../profile";
declare const require: any;
const SockJS = require('sockjs-client');
const stomp = require('webstomp-client');

export interface IWS_JVMVals {
	hs: string;
	v: number[]; //values [total time, thp, err count, heap, cpu, gc time]
	s; //segments
}

export class WebSocketManager
{
	client;

	private stopped;

	constructor(private onClientConnect: (client)=>void, private onStop: ()=>void)
	{
	}

	setup()
	{
		let connected = false;

		const client = this.stompOver();
		client.connect({}, (frame) => {

			if(this.stopped)
				return;

			connected = true;
			this.onConnect(client);

		}, () => {
			if (connected) {
				connected = false;
				console.log("reconnecting websocket in 5s...  ");
				this.reconnect();
			}
		});
	}

	private reconnect()
	{
		let connected = false;
		const reconInv = setInterval(() => {
			const client = this.stompOver();
			client.connect({}, (frame) => {

				clearInterval(reconInv);

				if(this.stopped)
					return;

				connected = true;
				this.onConnect(client);
			}, () => {
				if (connected) {
					connected = false;
					console.log("reconnecting websocket in 5s...  ");
					this.reconnect();
				}
			});
		}, 5000);
	}


	private stompOver()
	{
		const sock = new SockJS(profile.realtimeServer + "/datacollect");
		return stomp.over(sock, {debug: !profile.isProd});
	}

	private onConnect(client)
	{
		this.client = client;
		this.onClientConnect(client);
	}

	stop()
	{
		this.stopped = true;
		this.onStop();
		if (this.client)
		{
			this.client.disconnect();
			this.client = null;
		}
	}
}


