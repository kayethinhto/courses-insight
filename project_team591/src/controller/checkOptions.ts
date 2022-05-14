import {copySync} from "fs-extra";

export function checkOptions(options: any): boolean {
	console.log("reached options");
	if (options.length > 2) {
		return false;
	}
	let opKeys = Object.keys(options);
	let validOptions = ["COLUMNS","ORDER"];
	for (let x of opKeys) {
		if (!(validOptions.includes(x))) {
			return false;
		}
	}
	let columns: any[] = [];
	if ("COLUMNS" in options) {
		columns = options["COLUMNS"];
		if (columns.length === 0) {
			console.log("Failed because columns length = 0");
			return false;
		}
	}
	let validFields: any = ["dept","id" ,"instructor","title","uuid","fullname","shortname","number",
		"name","address","type","furniture","href","avg","pass","fail","audit","year","lat" , "lon" , "seats"];
	for (let x of columns) {
		if (x.indexOf("_") === -1) {
			return false;
		}
		x = x.split("_")[1];
		if (!(validFields.includes(x))) {
			return false;
		}
	}
	let order: any[] = [];
	if ("ORDER" in options) {
		order = [options["ORDER"]];
		if (order.length === 0) {
			return false;
		}
		if (order.length !== 0) {
			order.forEach((x) => {
				if (!(columns.includes(x))) {
					console.log("Failed because not everything in order is in columns");
					return false;
				}
			});
		}
	}
	return true;
}

export function checkOptionsT(options: any,transBool: any, trans: any): boolean {
	console.log("reached optionst");
	if (options.length > 2) {
		console.log(1);
		return false;
	}
	let opKeys = Object.keys(options);
	let validOptions = ["COLUMNS","ORDER"];
	for (let x of opKeys) {
		if (!(validOptions.includes(x))) {
			console.log(2);
			return false;
		}
	}
	let columns: any[] = [];
	if ("COLUMNS" in options) {
		columns = options["COLUMNS"];
		if (columns.length === 0) {
			console.log(3);
			return false;
		}
	}
	let validFields: any = ["dept","id" ,"instructor","title","uuid","fullname","shortname","number",
		"name","address","type","furniture","href","avg","pass","fail","audit","year","lat" , "lon" , "seats"];
	let unknowns: any[] = [];
	console.log(columns);
	for (let x of columns) {
		if (!((x.indexOf("_")) === -1)) {
			x = x.split("_")[1];
		}
		if (!(validFields.includes(x))) {
			unknowns.push(x);
		}
	}
	let applyKeys: any = [];
	let apply = trans["APPLY"];
	console.log(apply);
	for (let x of apply) {
		applyKeys.push(Object.keys(x)[0]);
	}
	for (let x of unknowns) {
		if (!(applyKeys.includes(x))) {
			return false;
		}
	}
	if ("ORDER" in options) {
		return orderHelper(options,columns,transBool,applyKeys);
	}
	return true;
}

function orderHelper(options: any, columns: any, transBool: any, applyKeys: any): boolean {
	let order: any;
	order = [options["ORDER"]];
	if (order.length === 0) {
		console.log(5);
		return false;
	}
	if (order.length !== 0) {
		for (let x of order) {
			let keys = Object.keys(x);
			console.log("this is x " + Object.keys(x));
			let validKeys = ["dir", "keys"];
			for (let y of keys) {
				if (!(validKeys.includes(y))) {
					console.log(y);
					console.log("invalid key");
					return false;
				}
			}
		}
		let dir: any;
		if ("dir" in order[0]) {
			let validDir = ["UP","DOWN"];
			dir = order[0]["dir"];
			if (!(validDir.includes(dir))) {
				console.log(7);
				return false;
			}
		}
		let dirKeys: any;
			// checking that all the keys are in columns
		if ("keys" in order[0]) {
			dirKeys = order[0]["keys"];
			for (let x of dirKeys) {
				if (!(columns.includes(x))) {
					console.log(8);
					return false;
				}
			}
		}
	}
	return true;
}


