import * as fs from "fs-extra";
import {handleTrans} from "./handleApply";

function datasetAdded(id: string): boolean {
	let filesArr: string[] = [];
	if (!fs.existsSync("./data/")) {
		return false;
	}
	fs.readdirSync("./data/").forEach((file) => {
		filesArr.push(file.split(".")[0]);
	});
	// console.log(filesArr);
	return filesArr.includes(id);
}

function handleOr(orWhat: any, data: any) {
	// console.log(Object.keys(orWhat[0]));
	// let keys = Object.keys(orWhat);
	// console.log(keys);
	let op: any[] = [];
	// if (keys.length === 1) {
	// 	return handleWhere(orWhat,data);
	// }
	for (const item of orWhat) {
		// let obj: any = [];
		// if(orWhat.hasOwnProperty.call(orWhat,x)) {
		// 	obj.push(orWhat[x]);
		// 	console.log(obj);
		// }
		let temp = handleWhere(item,data);
		for (let y of temp) {
			if (!(op.includes(y))) {
				op.push(y);
			}
		}
	}
	return op;
}


function handleAnd(andWhat: any, data: any) {
	let op: any[] = data;
	// console.log(andWhat);
	for (const item of andWhat) {
		// let obj: any = [];
		// if(andWhat.hasOwnProperty.call(andWhat,x)) {
		// 	obj.push(andWhat[x]);
		// }
		// console.log(handleWhere(item,data));
		op = handleWhere(item,op);
		// outputs.push(handleWhere(item,data));
	}
	return op;
}

function handleMC(where: any, data: any, type: string) {
	let op: any[] = [];
	let keys: any[] = Object.keys(where);
	let key: number = keys[0];
	// console.log(key);
	let question: any = Object.keys(where[key])[0];
	let req: any = Object.values(where[key])[0];
	// console.log(typeof (Object.values(where[key])[0]));
	// console.log(data[0]);
	for (let x of data) {
		switch(type) {
			case "LT":
				if (x[question] < req) {
					op.push(x);
				}
				break;
			case "GT":
				// console.log(x);
				if (x[question] > req) {
					op.push(x);
				}
				break;
			case "EQ":
				if (x[question] === req) {
					op.push(x);
				}
				break;
		}
	}
	return op;
}


function handleIS(where: any, data: any) {
	// add support for * later
	let op: any[] = [];
	let keys: any[] = Object.keys(where);
	let key: number = keys[0];
	// console.log(key);
	let question: any = Object.keys(where[key])[0];
	let req: any = Object.values(where[key])[0];
	for (let x of data) {
		if (x[question] === req) {
			op.push(x);
		}
	}
	// console.log(op + " this is the op");
	return op;
}

function handleNOT(where: any, data: any) {
	let op: any[] = [];
	let keys: any[] = Object.keys(where);
	let key = keys[0];
	let req: string = where[key];
	for (let x of data) {
		if (x[key] !== req) {
			op.push(x);
		}
	}
	return op;
}

function handleWhere(where: any, data: any) {
	let op: any = [];
	let keys = Object.keys(where);
	let key = keys[0];
	if (keys.length === 0) {
		return data;
	}

	if (key === "OR") {
		op = handleOr(where["OR"],data);
	}
	if (key === "AND") {
		op = handleAnd(where["AND"],data);
	}
	if (key === "LT") {
		op = handleMC(where,data,"LT");
	}
	if (key === "GT") {
		op = handleMC(where,data,"GT");
	}
	if (key === "EQ") {
		op = handleMC(where,data,"EQ");
	}
	if (key === "IS") {
		op = handleIS(where,data);
	}
	if (key === "NOT") {
		op = handleNOT(where["NOT"],data);
	}
	return op;
}

function handleColumns(wOp: any, columns: any) {
	let output: any[] = [];
	for (let x of wOp) {
		output.push(Object.fromEntries(Object.entries(x).filter(([key]) => columns.includes(key))));
	}
	return output;
}

// Parts of this function were borrowed from:
// https://stackoverflow.com/questions/13211709/javascript-sort-array-by-multiple-number-fields

function sortHelperUp(keys: any): any {
	return function(a: any, b: any) {
		if (keys.length === 0) {
			return 0;
		}
		let key = keys[0];
		if (a[key] < b[key]) {
			return -1;
		} else if (a[key] > b[key]) {
			return 1;
		} else {
			return sortHelperUp(keys.slice(1))(a, b);
		}
	};
}

function sortHelperDown(keys: any): any {
	return function(a: any, b: any) {
		if (keys.length === 0) {
			return 0;
		}
		let key = keys[0];
		if (a[key] < b[key]) {
			return 1;
		} else if (a[key] > b[key]) {
			return -1;
		} else {
			return sortHelperUp(keys.slice(1))(a, b);
		}
	};
}

function handleOrder(op: any[], order: any) {
	// let output: any[];
	// output = columnsOutput.sort(function (a,b) {
	// 	return a.order - b.order;
	// });
	// return output;
	let dir = order["dir"];
	let keys = order["keys"];
	if (dir === "UP") {
		op.sort(sortHelperUp(keys));
	}
	if (dir === "DOWN") {
		op.sort(sortHelperDown(keys));
	}
	return op;
}

function handleOptions(wOp: any, options: any, data: any) {
	let keys = Object.keys(options);
	if (keys.length === 0) {
		return data;
	}
	let columns: any;
	let order: any;
	let columnsOutput: any;
	let orderOutput: any;
	if (keys.includes("COLUMNS")) {
		columns = options["COLUMNS"];
		columnsOutput = handleColumns(wOp,columns);
		orderOutput = columnsOutput;
	}
	if (keys.includes("ORDER")) {
		order = options["ORDER"];
		orderOutput = handleOrder(columnsOutput,order);
	}
	return orderOutput;
}

function handleOptionsT(gOp: Map<any, any[]>, options: any, data: any) {
	let op: any = [];
	let required = options["COLUMNS"];
	let keys = Object.keys(options);
	let order: any;
	let aop: any;
	gOp.forEach((k,v) => {
		console.log(k[5]);
		let temp: any = {};
		for (let x of required) {
			console.log(x);
			if (!(temp[x])) {
				if (k[0][x]) {
					temp[x] = k[0][x];
				} else {
					temp[x] = k.pop()[x];
				}
			}
		}
		op.push(temp);
	});
	if (keys.includes("ORDER")) {
		order = options["ORDER"];
		op = handleOrder(op,order);
	}
	return op;
}


function filterData(query: any,where: any,options: any, data: any, trans: any, bool: any) {
	let wOp = handleWhere(where,data);
	let op;
	if (bool) {
		let gOp = handleTrans(wOp,trans);
		op = handleOptionsT(gOp,options,data);
	} else {
		op = handleOptions(wOp,options,data);
	}

	return op;
}

export function doQuery(query: any) {
	// check if dataset exists
	let options: any = (Object.values(query));
	let opIds: any = Object.values(options[1]);
	let ids: any = Object.values(opIds[0]);
	let id = ids[0].split("_")[0];
	let data: any;
	let trans: any;
	if (datasetAdded(id)) {
		try {
			let json: any = fs.readFileSync("./data/" + id + ".json");
			data = JSON.parse(json);
			// console.log(data);
		} catch(err) {
			console.log("Stuck, could not parse json");
			console.log(err);
		}
		let where = query["WHERE"];
		let ops = query["OPTIONS"];
		let bool = false;
		if("TRANSFORMATIONS" in query) {
			trans = query["TRANSFORMATIONS"];
			bool = true;
		}
		return filterData(query, where,ops,data,trans,bool);
	}
}
