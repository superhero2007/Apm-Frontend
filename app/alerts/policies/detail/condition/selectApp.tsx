import * as React from 'react';
import {AbstractSelectEntity} from "../../../../es/pinned/selectJvm";

export interface ITargetApp
{
	id:     string;
	label:  string;
}

export class SelectApp  extends AbstractSelectEntity<ITargetApp>
{
	getMapper()
	{
		return (app: ITargetApp) =>({value: app.id, label:app.label});
	}

}