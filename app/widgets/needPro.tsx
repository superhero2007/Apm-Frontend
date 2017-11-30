import * as React from 'react';
import {UpgradeProButton} from "./upgradeProButton";

export class NeedPro extends React.Component<{pageName: string},{}>
{
    render()
    {
        return (
            <div>
                <h2>Upgrade to Pro Account to see {this.props.pageName}</h2>
                <div className="top2">
                    <UpgradeProButton/>
                </div>
            </div>
        );
    }
}
