import * as React from 'react';
import {CSSProperties} from 'react';
import * as Boron from 'boron';


export class CustomRangeDlg extends React.Component<{}, {}>
{
    showDlg()
    {
        this.toggleDlg();
    }

    private toggleDlg()
    {
        var ref:any = this.refs["custDlg"];
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
                width: '600px'
            },
            container: {
                padding: '2em',
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
            <div >
                <Boron.WaveModal ref="custDlg" modalStyle={styles.dlg} >
                    <div style={styles.container}>
                        <h4>Select range in chart</h4>
                        <p>Select an area of the chart to zoom into it.</p>
                        <img src="assets/img/chartselect.png"/>
                        <button style={styles.btn} onClick={this.onOk.bind(this)}>OK</button>
                    </div>
                </Boron.WaveModal>
            </div>
        )
    }
}
