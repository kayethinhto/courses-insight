// returns parsed dataset
import {InsightDataset, InsightDatasetKind, InsightError} from "./IInsightFacade";
import Course from "./Course";
import * as fs from "fs";
import InsightFacade from "./InsightFacade";
import HtmlParser from "./HtmlParser";
import JSZip from "jszip";
import Room from "./Room";

let zipCourse = new JSZip();
// let zipRooms = new JSZip();

export default class Dataset {
	public  coursesSkippedCounter: number = 0;
	public  datasetArray: any = [];
	public  parsedCourses: Course[] = [];
	public  courseFileCounter: number = 0;
	public  insightDataset: InsightDataset = {id: "",
		kind: InsightDatasetKind.Courses || InsightDatasetKind.Rooms,
		numRows: 0};

	private  DatasetMap: Map <InsightDataset,Course[]|Room[]>;
	public  datasetIDs: string[];
	public zipRooms = new JSZip();
	public html: HtmlParser = new HtmlParser();
	// ------------------------
	private shortNames: string[] = [];
	constructor(map: Map <InsightDataset,Course[]|Room[]>, ids: string[]) {
		this.DatasetMap = map;
		this.datasetIDs = ids;
	}

	public parseDataCourses(id: string, data: any): Promise<string[]> {
		this.datasetArray = [];
		return new Promise((resolve, reject) => {
			return zipCourse.loadAsync(data, {base64: true})
				.then((zip: JSZip) =>{
					let temp = zip.folder(id);
					if(temp === null || temp === undefined) {
						return reject(new InsightError("zip is null"));
					}
					for (let nameFile of Object.keys(temp.files)) {
						if (zip.file(nameFile) == null) {
							continue;
						}
						this.datasetArray.push(zip.file(nameFile)?.async("string"));
					}
					Promise.all(this.datasetArray).then((courseFiles: any) => {
						return this.extracted(courseFiles, reject, id, resolve);
					}).catch((e) => {
						return reject(new InsightError("Unable to parse data"));
					});
				}).catch((e) => {
					return reject(new InsightError("No dir exists with that name"));
				});
		});
	}

	// string[]
	public parseDataRooms(id: string, data: any): Promise<any> {
		this.datasetArray = [];
		let indexHtm: any = [];
		let temp: any;
		// let html: HtmlParser = new HtmlParser();
		return new Promise((resolve, reject) => {
			return this.zipRooms.loadAsync(data, {base64: true})
				.then((zip: JSZip) =>{
					this.zipRooms = zip;
					for (let nameFile of Object.keys(zip.files)) {
						temp = zip.file(nameFile);
						if ((nameFile === "rooms/index.htm") && (temp !== null)) {
							temp = zip.file(nameFile);
							let p: Promise<string> = (temp)?.async("string");
							indexHtm.push(p);
							// indexHtm.push(zip.file(nameFile)?.async("string"));
						}
					}
					Promise.all(indexHtm).then((roomFile: any) => {
						console.log("inside promise all");
						return resolve(this.html.parseHtml(roomFile));
					}).catch((e) => {
						return reject(new InsightError("Unable to parse data"));
					});
				}).catch((e) => {
					return reject(new InsightError("No dir exists with that name"));
				});
		});
	}

	public parseDataBuildings(id: string, data: any, roomLinks: string[]): Promise<any> {
		let indexHtm: any = [];
		// htmls of buildings to parse
		// let html: HtmlParser = new HtmlParser();
		let temp: any;
		return new Promise((resolve, reject) => {
			console.log("parsing buildings now");
			for (let link of roomLinks) {
				let link2 = "rooms/" + link.substring(link.indexOf("/") + 1);
				let path: any[] = link2.split("/");
				let folderPath: any|null = this.zipRooms.folder(path[0]);
				for (let files of Object.keys(folderPath.files)){
					// check index.htm link against folder links
					let zipFile: any|null = this.zipRooms.file(files);
					// console.log(zipFile);
					if (files !== link2) {
						continue;
					}
					if (files === link2) {
						// indexHtm.push(zipFile.async("string"));
						this.shortNames.push(files.split("/")[4]);
						// let shortName = files.split("/")[4];
						let p: Promise<string> = (zipFile)?.async("string");
						indexHtm.push(p);
					}
				}
			}
			// console.log(this.shortNames);
			Promise.allSettled(indexHtm).then((buildings: any) => {
				console.log("finished parsing building/rooms");
				return resolve(this.html.parseBuildings(buildings, this.shortNames));
			}).catch((e) => {
				return reject(new InsightError("Unable to parse data"));
			});
		});
	}

	public addRoomsToMap(id: string, kind: InsightDatasetKind, dataset: Room[]) {
		let counter = 0;
		for (let room in dataset) {
			counter++;
		}
		this.datasetIDs.push(id);
		this.insightDataset = {id: id, kind: InsightDatasetKind.Rooms, numRows: counter};
		this.DatasetMap.set(this.insightDataset, dataset);
	}

	public saveData(id: string, parsedData: any) {
		try {
			if (!fs.existsSync("./data")) {
				fs.mkdirSync("./data");
				fs.writeFileSync("./data/" + id + ".json", JSON.stringify(parsedData));
			} else {
				fs.writeFileSync("./data/" + id + ".json", JSON.stringify(parsedData));
			}
		} catch(error) {
			throw new InsightError("unable to write file");
		}
	}

	public returnDatasetIDs() {

		return this.datasetIDs;
	}

	public returnParsedData() {

		return this.parsedCourses;
	}

	public createCourse(courseObj: any, section: any) {
		if (courseObj["Section"] === "overall") {
			section = 1900;
		}
		let courseInfo = new Course(courseObj["Subject"], courseObj["Course"],
			courseObj["Avg"], courseObj["Professor"], courseObj["Title"],
			courseObj["Pass"], courseObj["Fail"], courseObj["Audit"],
			courseObj["id"].toString(), courseObj["Year"], section);
		return courseInfo;
	}

// FINISH REFACTORING
	public extracted(courseFiles: any, reject: any, id: string, resolve: any) { // add field Insightfacade.datasetmap
		let insightFacade = InsightFacade;
		let rowCounter: number = 0;
		if (typeof courseFiles === "undefined" || courseFiles.length === 0) {
			return reject(new InsightError(("invalid zip file")));
		}
		for (let c of courseFiles) {
			try {
				this.courseFileCounter++;
				c = JSON.parse(c);
				let courseResult = c["result"];
				let section = courseResult["Section"];
				if (courseResult.length > 0) {
					courseResult.forEach((courseObj: any) => {
						rowCounter++;
						let courseInfo = this.createCourse(courseObj, section);
						this.parsedCourses.push(courseInfo);
					});
				}
			} catch (e) {
				if (this.courseFileCounter !== courseFiles.length) {
					this.coursesSkippedCounter++;
					continue;
				} else if ((this.courseFileCounter === courseFiles.length) &&
					(this.coursesSkippedCounter === courseFiles.length - 1)) {
					return reject(new InsightError("Not a single valid course :("));
				}
			}
		}
		this.insightDataset = {id: id, kind: InsightDatasetKind.Courses, numRows: rowCounter};
		this.DatasetMap.set(this.insightDataset, this.parsedCourses);
		this.datasetIDs.push(id);
		rowCounter = 0;
		return resolve(this.datasetIDs);
	}
}
