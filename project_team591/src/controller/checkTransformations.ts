import * as fs from "fs-extra";

export function checkTransformations(trans: any) {
	let keys = Object.keys(trans);
	let validKeys = ["GROUP", "APPLY"];
	for (let x of keys) {
		if (!validKeys.includes(x)) {
			return false;
		}
	}
	if ((!(trans["GROUP"])) || (!(trans["APPLY"])) ) {
		return false;
	}
	let group = trans["GROUP"];
	let apply = trans["APPLY"];
	for (let x of group) {
		if (x.indexOf("_") === -1) {
			return false;
		}
		let expression = x.split("_")[1];
		let dataset = x.split("_")[0];
		let path = `./data/${dataset}.json`;
		if (!(fs.existsSync(path))) {
			return false;
		}
		let validFields: any = ["avg","pass", "fail", "audit", "year", "dept","id","instructor", "title","uuid",
			"fullname","shortname", "number","name","address","lat","lon","seats","type","furniture","href"];
		if (!(validFields.includes(expression))) {
			return false;
		}
	}
	console.log(apply);
	let applyKeys: any = [];
	for (let x of apply) {
		let applyKey = Object.keys(x)[0];
		if (applyKeys.includes(applyKey)) {
			return false;
		}
		applyKeys.push(applyKey);
		let applyKeyKey = x[applyKey];
		let token = Object.keys(applyKeyKey)[0];
		let applyOn = applyKeyKey[token];
		let validMMAS = ["avg","pass", "fail", "audit", "year", "lat","lon","seats"];
		if (["MAX","MIN","AVG","SUM"].includes(token)) {
			if ((!validMMAS.includes(applyOn.split("_")[1]))) {
				return false;
			}
		}
	}

	return true;
}
