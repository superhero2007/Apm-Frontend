import * as React from "react";
import {AbstractThresholdConfigPanel} from "./abstractThresholdPanel";

export class MemoryThresholdConfigPanel extends AbstractThresholdConfigPanel
{
	render ()
	{
		return this.doRender(0,10000000,"MB");
	}
}