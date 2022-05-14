import {checkWhere} from "./checkWhere";
import {checkOptions,checkOptionsT} from "./checkOptions";
import {checkTransformations} from "./checkTransformations";


export function checkValidity(query: any): boolean {
	let keys = Object.keys(query);
	if (!(keys.length >= 2)) {
		// not valid because there needs to be where and options
		// console.log("Failed because keys.length!=2");
		return false;
	}
	let where: any;
	let options: any;
	let validKeys: string[] = ["WHERE", "OPTIONS", "TRANSFORMATIONS"];
	let bool = true;
	keys.forEach((key) => {
		if (!(validKeys.includes(key))) {
			bool = false;
		}
	});
	if (!bool) {
		return bool;
	}
	where = query["WHERE"];
	options = query["OPTIONS"];
	let transBool = false;
	let trans;
	if (keys.includes("TRANSFORMATIONS")) {
		trans = query["TRANSFORMATIONS"];
		transBool = true;
		if(!checkTransformations(trans)) {
			return false;
		}
	}
	if (transBool) {
		return checkWhere(where) && checkOptionsT(options,transBool,trans);
	} else {
		return checkWhere(where) && checkOptions(options);
	}
}
