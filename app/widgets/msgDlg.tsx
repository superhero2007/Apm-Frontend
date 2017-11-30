import * as React from "react";
import {CSSProperties} from "react";
import * as Boron from "boron";

export class MsgDlg extends React.Component<{
	msg: string;
	ref?:any;
},{}>
{

	toggleDlg()
	{
		var ref:any = this.refs["mydlg"];
		ref.toggle();
	}

	private onOk()
	{
		this.toggleDlg();
	}

	render()
	{
		var styles = {
			dlg: {
				width: '800px'
			},
			container: {
				padding: '1em',
				textAlign: 'center'
			},
			btn: {
				margin: '1em 1em',
				padding: '1em 2em',
				outline: 'none',
				fontSize: 16,
				fontWeight: 600,
				background: '#C94E50',
				color: '#FFFFFF',
				border: 'none'
			} as CSSProperties
		};
		return (
			<div>
				<Boron.WaveModal ref="mydlg">
					<div style={styles.container}>
						<h3>{this.props.msg}</h3>
						<button style={styles.btn} onClick={this.onOk.bind(this)}>OK</button>
					</div>
				</Boron.WaveModal>

			</div>
		);
	}
}