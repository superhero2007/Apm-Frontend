import {Dispatch} from "redux";
import {IRR_ESDETAIL} from "../reducers/esReducer";

export interface IESViewProps
{
    esDetail?   :IRR_ESDETAIL;
    dispatch?   :Dispatch<any>;
}
