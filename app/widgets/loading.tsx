import * as React from "react";
import "./loading.css";

export const Loading = ()=> (
	<div className="spinner spinner--orange">
		<div className="spinner__item1"></div>
		<div className="spinner__item2"></div>
		<div className="spinner__item3"></div>
		<div className="spinner__item4"></div>
	</div>
);