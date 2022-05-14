import http from "http";
import {InsightError} from "./IInsightFacade";

function processIt(data: any) {
	console.log("in processIt");
	console.log(data);
	// let g: GeoLocation = new GeoLocation();
	// g.adr = data;
	// return data;
}

export function getGeoLocation2(address: any): Promise<any> {
	// console.log("inside geoloc");
	return new Promise((resolve, reject) => {
		let data = "";
		let addr = address.replace(/\s+/gi, "%20");
		// let link = encodeURI(`http://cs310.students.cs.ubc.ca:11316/api/v1/project_team591/${address}`);
		http.get(`http://cs310.students.cs.ubc.ca:11316/api/v1/project_team591/${addr}`, (response) => {
			// response.setEncoding("utf8");
			response.on("data", (location: any) => {
				data += location;
			});
			response.on("end", () => {
				// processIt(JSON.parse(data));
				return resolve(JSON.parse(data));
				// return;
			});
			response.on("error", (err: any) => {
				reject(new InsightError("http failed"));
			});
		});
	});
}

// http://cs310.students.cs.ubc.ca:11316/api/v1/project_team591/2211%20Wesbrook%20Mall
// getGeoLocation("2211%20Wesbrook%20Mall").then((x) => console.log(x));

// getGeoLocation("2211%20Wesbrook%20Mall");


// console.log(getGeoLocation("2211%20Wesbrook%20Mall"));
// `http://cs310.students.cs.ubc.ca:11316/api/v1/project_team591/${address}`
