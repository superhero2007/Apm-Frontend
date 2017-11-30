import * as React from 'react';
import {CSSProperties} from 'react';
import * as Boron from 'boron';

export class ConfirmDlg extends React.Component<{ref?:any, onYes:()=>void},{}>
{
	showDlg()
	{
		this.toggleDlg();
	}
	onConfirm()
	{
		this.props.onYes();
		this.toggleDlg();
	}

	onCancel()
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
			}as CSSProperties,
			title: {
				margin: 0,
				color: '#C94E50',
				fontWeight: 400
			} as CSSProperties
		};

		var confirmDlg = <div style={styles.container}>
			<h2 style={styles.title}>Are you sure?</h2>
			<button style={styles.btn} onClick={this.onConfirm.bind(this)}>Yes</button>
			<button style={styles.btn} onClick={this.onCancel.bind(this)}>No</button>
		</div>;

		return (<div>
			<Boron.WaveModal ref="mydlg">{confirmDlg}</Boron.WaveModal>
		</div>);
	}
}
