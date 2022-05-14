import Decimal from "decimal.js";

function handleApplyToken(applyToken: string, group: any, applyOn: string, applyKey: string) {
	if (applyToken === "MAX") {
		let max = -99999;
		for (let x of group) {
			let num = x[applyOn];
			if (num > max) {
				max = num;
			}
		}
		let temp: any = {};
		temp[applyKey] = max;
		group.push(temp);
	}
	if (applyToken === "MIN") {
		let min = 99999;
		for (let x of group) {
			let num = x[applyOn];
			if (num < min) {
				min = num;
			}
		}
		let temp: any = {};
		temp[applyKey] = min;
		group.push(temp);
	}
	if (applyToken === "COUNT") {
		let count = 0;
		for (let x of group) {
			count = count + 1;
		}
		let temp: any = {};
		temp[applyKey] = count;
		group.push(temp);
	}
	if (applyToken === "SUM") {
		let sum = 0;
		for (let x of group) {
			let num = x[applyOn];
			sum = sum + num;
		}
		let temp: any = {};
		temp[applyKey] = Number(sum.toFixed(2));
		group.push(temp);
	}
}

export function handleApply(apply: any, group: any) {
	let applyKey: string = Object.keys(apply)[0];
	let applyReq: any = apply[applyKey];
	let applyToken: string = Object.keys(applyReq)[0];
	let applyOn: string = applyReq[applyToken];
	if (applyToken === "AVG") {
		let total = new Decimal(0);
		let count = 0;
		for (let x of group) {
			let num = new Decimal(x[applyOn]);
			total = total.add(num);
			count++;
		}
		let avg = total.toNumber() / count;
		let temp: any = {};
		temp[applyKey] = Number(avg.toFixed(2));
		group.push(temp);
		// console.log(group);
	}
	handleApplyToken(applyToken, group, applyOn, applyKey);
	return group;
}

export function handleTrans(temp: any, trans: any) {
	let group = trans["GROUP"];
	console.log(group);
	let apply = trans["APPLY"];
	let groups = handleGroup(group,temp,apply);
	// let op = handleApply(apply,groups);
	// console.log(groups);

	return groups;
}

export function handleGroup(group: any, temp: any, apply: any) {
	// console.log(temp);
	let common: Map<any, any[]> = new Map();
	let req: any = [];
	temp.forEach((x: any) => {
		let t: any = {};
		group.forEach((y: any) => {
			t[y] = x[y];
		});
		req.push(t);
	});
	// console.log(req);
	for (let x = 0; x < req.length; x++) {
		if (common.has((Object.values(req[x])).join("-"))) {
			let t: any = common.get((Object.values(req[x])).join("-"));
			t.push(temp[x]);
		} else {
			common.set((Object.values(req[x])).join("-"),[temp[x]]);
		}
	}
	common.forEach((key,value) => {
		apply.forEach((rule: any) => {
			value = handleApply(rule,key);
		});
	});
	return common;
}
