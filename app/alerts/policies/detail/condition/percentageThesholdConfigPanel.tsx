import * as React from "react";
import {AbstractThresholdConfigPanel} from "./abstractThresholdPanel";

export class PercentageThresholdConfigPanel extends AbstractThresholdConfigPanel
{
	render ()
	{
		return this.doRender(0,100,"%");
	}
}