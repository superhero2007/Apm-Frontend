import * as React from "react";
import {AbstractThresholdConfigPanel} from "./abstractThresholdPanel";

export class THPThresholdConfigPanel extends AbstractThresholdConfigPanel
{
	render ()
	{
		return this.doRender(0,100000000,"RPM");
	}
}
