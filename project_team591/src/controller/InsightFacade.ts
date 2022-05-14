import {
	IInsightFacade,
	InsightDataset,
	InsightDatasetKind,
	InsightError,
	InsightResult,
	NotFoundError,
	ResultTooLargeError
} from "./IInsightFacade";
import * as fs from "fs-extra";
import Dataset from "./Dataset";
import {doQuery} from "./performQueryHelper";
import Course from "./Course";
import {checkValidity} from "./checkValidity";
import Room from "./Room";

/**
 * This is the main programmatic entry point for the project.
 * Method documentation is in IInsightFacade
 *
 */
let q = {
	WHERE:{
		GT:{
			courses_avg:97
		}
	},
	OPTIONS:{
		COLUMNS:[
			"courses_dept",
			"courses_avg"
		],
		ORDER:"courses_avg"
	}
};

export default class InsightFacade implements IInsightFacade {
	private datasetlist: InsightDataset[] = [];
	public  DatasetMap: Map <InsightDataset,Course[] | Room[]>;
	public  datasetIDs: string[];

	constructor() {
		console.log("InsightFacadeImpl::init()");
		this.DatasetMap = new Map <InsightDataset,Course[] | Room[]>();
		this.datasetIDs = [];
	}

	public addDataset(id: string, content: string, kind: InsightDatasetKind): Promise<string[]> {
		let datasetProcess: Dataset = new Dataset(this.DatasetMap, this.datasetIDs);

		if (id === null || id.trim().length === 0) {
			return Promise.reject(new InsightError("Invalid ID"));
		}
		if (id.includes("_")) {
			return Promise.reject(new InsightError(("ID can't contain an underscore")));
		}
		if (this.datasetIDs.includes(id)) {
			return Promise.reject(new InsightError(("ID already exists")));
		}
		if (kind === null) {
			return Promise.reject(new InsightError("Invalid kind"));
		}
		/* if (kind !== "courses") {
			return Promise.reject(new InsightError("Kind must be a Course"));
		} */
		return new Promise(function (resolve, reject) {
			try {
				if (kind === InsightDatasetKind.Courses) {
					datasetProcess.parseDataCourses(id, content).then(function (result) {
						datasetProcess.saveData(id, datasetProcess.returnParsedData());
						return resolve(datasetProcess.returnDatasetIDs());
					}).catch(function (error: any) {
						return reject(new InsightError("unable to addDataset" + error));
					});
				} else if (kind === InsightDatasetKind.Rooms) {
					datasetProcess.parseDataRooms(id, content).then(function (roomLinks) {
						console.log("finished parsing rooms index.htm");
						datasetProcess.parseDataBuildings(id, content, roomLinks).then(function (dataset) {
							console.log(dataset);
							datasetProcess.addRoomsToMap(id, kind, dataset);
							datasetProcess.saveData(id, dataset);
							return resolve(datasetProcess.returnDatasetIDs());
						}); // .then resolve
					}).catch(function (error: any) {
						return reject(new InsightError("unable to addDataset" + error));
					});
				}
			} catch (error) {
				return reject(new InsightError("unable to addDataset" + error));
			}
		});
	}

	public removeDataset(id: string): Promise<string> {
		const path = `data/${id}.json`;
		const exists1: boolean = fs.existsSync(path);
		let mapToDelete: InsightDataset = {id: "", kind: InsightDatasetKind.Courses, numRows: 0};
		if (id.indexOf("_") > -1) {
			return Promise.reject(new InsightError("id contains an underscore"));
		}
		if (id.trim().length === 0) {
			return Promise.reject(new InsightError("id is only blank spaces"));
		}
		if (!exists1) {
			return Promise.reject(new NotFoundError("No such dataset exists"));
		}
		fs.unlink(path, function(err){
			if(err){
				return Promise.reject(new InsightError());
			}
		});
		this.datasetIDs.forEach((element, index) => {
			if(element === id) {
				this.datasetIDs.splice(index,1);
			}
		});
		// removed from dataset IDs
		this.DatasetMap.forEach((p1: Course[] | Room[], p2: InsightDataset) => {
			if (p2.id === id) {
				mapToDelete = p2;
			}
		});
		this.DatasetMap.delete(mapToDelete);
		return Promise.resolve(`${id}`);
	}

	public performQuery(query: unknown): Promise<InsightResult[]> {
		let output: InsightResult[] = [];
		// validate transformations too
		if (!checkValidity(query)) {
			return Promise.reject(new InsightError("Invalid query!"));
		}
		if (checkValidity(query)) {
			output = doQuery(query);
		}
		if (output) {
			if (output.length > 5000) {
				throw new ResultTooLargeError();
			}
		}
		return Promise.resolve(output);
	}

	public async listDatasets(): Promise<InsightDataset[]> {
		this.DatasetMap.forEach((value, key) =>{
			this.datasetlist.push(key);
		});
		return Promise.resolve(this.datasetlist);
	}
}

