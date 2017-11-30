import * as React from "react";
import {CSSProperties} from "react";
import * as Boron from "boron";

export class NotAllowedDlg extends React.Component<{ref?:any},{}>
{
	showDlg()
	{
		this.toggleDlg();
	}

	onConfirm()
	{
		this.toggleDlg();
	}

	private toggleDlg()
	{
		var ref:any = this.refs["mydlg"];
		ref.toggle();
	}

	render()
	{
		var styles = {
			btn: {
				margin: '1em 1em',
				padding: '1em 2em',
				outline: 'none',
				fontSize: 16,
				fontWeight: 600,
				background: '#C94E50',
				color: '#FFFFFF',
				border: 'none'
			} as CSSProperties,
			container: {
				padding: '2em',
				textAlign: 'center'
			},
			title: {
				margin: 0,
				color: '#C94E50',
				fontWeight: 400
			} as CSSProperties
		};

		var confirmDlg = <div style={styles.container}>
			<h3 style={styles.title}>This operation is not permitted for your user role</h3>
			<button style={styles.btn} onClick={this.onConfirm.bind(this)}>Ok</button>
		</div>;

		return (<div>
			<Boron.WaveModal ref="mydlg">{confirmDlg}</Boron.WaveModal>
		</div>);
	}
}
