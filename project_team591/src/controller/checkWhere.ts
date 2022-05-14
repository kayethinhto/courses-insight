import * as fs from "fs-extra";
import {InsightError} from "./IInsightFacade";

function notFilter(filter: any, where: any): boolean {
	let negation = Object.keys(where[filter]);
	let nKeys = Object.keys(negation);
	if (nKeys.length === 0) {
		return false;
	}
	return checkWhere(negation);
}

function isFilter(filter: any, where: any): any {
	let sComparator = Object.keys(where[filter]);
	// let sKeys = Object.keys(sComparator);
	// if (sKeys.length > 1) {
	// 	console.log("line 52");
	// 	return false;
	// }
	// console.log(sKeys);
	let sExpression = sComparator[0].split("_")[1];
	let validSfields: any = ["dept","id","instructor","title","uuid", "fullname", "shortname" , "number",
		"name" , "address" , "type" , "furniture" , "href"];
	if (!(validSfields.includes(sExpression))) {
		return false;
	}
}

export function checkWhere(where: any): boolean {
	console.log("reached where");
	let filters = Object.keys(where);
	// Match against all entries if there is no filter
	if ((filters.length === 0)) {
		return true;
	}
	// There can only be one initial filter
	if (filters.length > 1) {
		return false;
	}
	let filter = filters[0];

	if (filter === "AND" || filter === "OR") {
		let logic = Object.keys(where[filter]);
		if (logic.length === 0) {
			return false;
		}
		for (let x of logic) {
			if (!(checkWhere(x))) {
				return false;
			}
		}
	}
	if (filter === "LT" || filter === "GT" || filter === "EQ") {
		let mComparator = Object.keys(where[filter]);
		if (mComparator.length > 1) {
			console.log("Failed because mKeys length  > 1");
			return false;
		}
		let mExpression = mComparator[0].split("_")[1];
		let dataset = mComparator[0].split("_")[0];
		let path = `./data/${dataset}.json`;
		if (!(fs.existsSync(path))) {
			throw new InsightError(`${dataset} has not been added yet`);
		}
		let validFields: any = ["avg","pass", "fail", "audit", "year", "lat" , "lon" , "seats"];
		if (!(validFields.includes(mExpression))) {
			// console.log(mExpression);
			console.log("Failed because not a valid where field");
			return false;
		}
	}
	if (filter === "IS") {
		return isFilter(filter,where);
	}
	if (filter === "NOT") {
		return notFilter(filter,where);
	}
	return true;
}
