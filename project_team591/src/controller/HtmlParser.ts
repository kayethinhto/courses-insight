// returns parsed dataset
import {InsightDataset, InsightDatasetKind, InsightError} from "./IInsightFacade";
import Course from "./Course";
import * as fs from "fs";
import InsightFacade from "./InsightFacade";
import JSZip from "jszip";
import Room from "./Room";
import parse5, {ChildNode, Element, Node, Document} from "parse5";
import {getContentFromArchives} from "../../test/TestUtil";
import Dataset from "./Dataset";
let zipFiles = new JSZip();
const http = require("http");
import {getGeoLocation2} from "./Geo";

export default class HtmlParser {
	public fullNames: string[] = [];
	public shortNames: string[] = [];
	public address: string[] = [];
	public roomLat: number[] = []; // from HTTP
	public roomLon: number[] = []; // from HTTP

	public roomName: string[] = []; // room id, shortName + " " + roomNumber

	// for each building, get these, crate room
	public roomNumber: string[] = [];
	public roomSeats: number[] = [];
	public roomType: string[] = [];
	public roomFurniture: string[] = [];
	public roomHref: string[] = [];
	// public roomsDataset: Room[] = [];
	public roomDataset: Room[] = [];
	public  namesMap: Map <string,string> = new Map<string, string>();
	public  addressMap: Map <string,string> = new Map<string, string>();


	public validShortNames: string[] = [];
	public validFullNames: any = [];


	public parseHtml(roomFilesHtm: string[]): Promise<any> {
		// use parse5 to get links
		// let roomLinks: any = [];
		let roomLinks: any = [];
		let node: any;
		return new Promise((resolve, reject) => {
			try {
				// let parse5 = require("parse5");
				let findRoomsInHtml = roomFilesHtm[0].substring((roomFilesHtm[0].indexOf("</tbody>")),
					roomFilesHtm[0].indexOf("<tbody>") + 8);
				// let fileString: string = roomFilesHtm[0];
				let parsedFile = parse5.parse(findRoomsInHtml);
				// start dfs search here in parsedFile
				// let demoNode: ChildNode[] = parsedFile.childNodes;
				roomLinks = this.parseRoom(parsedFile);
				return resolve(roomLinks);
			} catch (err) {
				return reject(new InsightError("index.htm not parsed"));
			}
		});
	}

	public parseRoom(tree: any) {
		// console.log("inside dfs");
		const node1 = this.find(tree, "html");
		const node2 = this.find(node1, "body");
		const listNodes = this.recurse(node2);
		return listNodes;
	}

	public recurse(tree: any) {
		let returnLinks: any[] = [];
		const listANodes: any[] = [];
		const shortAndAdr: string[] = []; // make these global
		if (tree == null) {
			throw new InsightError("Node is null");
		}
		for (let node of tree.childNodes) {
			if (node.nodeName === "a") {
				listANodes.push(node);
			}
			if (node.nodeName === "#text") {
				shortAndAdr.push(node.value.trim());
			}
		}
		shortAndAdr.shift();
		// make shortNames[] and address[] global variables
		this.shortNames = shortAndAdr.filter((elem, index) => {
			if (index % 3 === 0) {
				// console.log(elem);
				return elem;
			}
		});
		this.address = shortAndAdr.filter((elem, index) => {
			if (index % 3 === 1) {
				return elem;
			}
		});
		for (let i = 0; i < this.address.length; i++) {
			this.addressMap.set(this.shortNames[i], this.address[i]);
		}
		returnLinks = this.getInfo(listANodes);
		return returnLinks;
	}

	public getInfo(listANodes: any[]) {
		let links: string[] = []; // make these global
		// let fullNames: string[] = []; // make these global
		for (let node of listANodes) {
			for (let atr of node.attrs) {
				if (atr.name === "href") {
					if (!links.includes(atr.value.trim())) {
						links.push(atr.value.trim());
					}
				}
			}
			for (let child of node.childNodes) {
				if (child.nodeName === "#text" && child.value !== "More info") {
					this.fullNames.push(child.value);
				}
			}
		}
		for (let i = 0; i < this.fullNames.length; i++){
			this.namesMap.set(this.shortNames[i], this.fullNames[i]);
		}
		// console.log(this.fullShortNames);
		return links;
	}

	public find(tree: any, string: string) {
		// let returnNode: any[] = [];
		if (tree == null) {
			throw new InsightError("Node is null");
		}
		// All the children except the last
		for (let node of tree.childNodes) {
			if (node.nodeName === string) {
				return (node);
			}
		}
		// return returnNode;
	}

	public parseBuildings(buildingFiles: any, validNames: any): Promise<any[]> {
		return new Promise(   (resolve, reject) => {
			let retV: any;
			for (let i = 0; i < buildingFiles.length; i++) {
				if ((buildingFiles[i].value).includes("<tbody>")) { // this checks if there is a room
					let findtable = buildingFiles[i].value.substring((buildingFiles[i].value.indexOf("<tbody>")),
						buildingFiles[i].value.indexOf("</tbody>"));
					retV = parse5.parse(findtable);
					// console.log(validNames[i]);
					this.validShortNames.push(validNames[i]);
					let short = validNames[i];
					let full: any = this.getValidFull(validNames[i]);
					let adr: any = this.getValidAdr(validNames[i]);
					let location: Promise<any> = this.getGeo(adr);
					Promise.resolve(location).then((geo) => {
						this.recurseBuilding(retV, short, full, adr, geo);
					});
				}
			}
			return resolve(this.roomDataset);
			// Promise.allSettled(this.roomDataset).then((buildings: any) => {
			// 	console.log("buildings",buildings);
			// 	return resolve(buildings);
			// }).catch((e) => {
			// 	return reject(new InsightError("unable to parse buildings"));
			// });

		});
	}

	public recurseBuilding(tree: any, short: string, full: string, adr: string, geo: any) {
		let listANodes: any = [];
		let roomInfo = [];
		const node1 = this.find(tree, "html");
		const node2 = this.find(node1, "body");
		// console.log(node2);
		for (let node of node2.childNodes) {
			if (node.nodeName === "a" && (!listANodes.includes(node))) {
				// for href
				listANodes.push(node);
			}
			if (node.nodeName === "#text") {
				// for # seats, type, furniture
				roomInfo.push(node.value.trim());
			}
		}
		roomInfo.shift();

		let seat: number = 0;
		for (let i = 0; i < roomInfo.length; i++) {
			if (i % 2 === 0) {
				let str = roomInfo[i].replace(/ {2,}/g, "_");
				let str2: [] = str.split("_");
				let seatString: any = str2.at(0);
				if (seatString === null) {
					seat = 0;
				}
				seat = +seatString;
				let furniture: any = str2.at(3);
				let type: any = str2.at(6);
				this.roomSeats.push(seat);
				this.roomFurniture.push(furniture);
				this.roomType.push(type);
			}
		}
		this.getHref(listANodes);
		let lat: number = geo.lat;
		let lon: number = geo.lon;
		if (this.roomSeats.length === this.roomHref.length) {
			for (let i = 0; i < this.roomType.length; i++) {
				let roomName = short + " " + this.roomNumber[i];
				let room = new Room(full, short, this.roomNumber[i], roomName,
					adr, this.roomSeats[i], this.roomType[i], this.roomFurniture[i], this.roomHref[i],
					lat, lon);
				this.roomDataset.push(room);
				// console.log("adding to the roomDataset",room);
			}
		}
		this.clearRoomData();
	}

	public async getGeo(address: string): Promise<any> {
		let loc =  new Promise( (resolve, reject) => {
			getGeoLocation2(address).then((res) => {
				// console.log("res",res);
				resolve(res);
			});
		});
		return loc;
	}

	public clearRoomData() {
		this.roomSeats = [];
		this.roomType = [];
		this.roomFurniture = [];
		this.roomHref = [];
		this.roomNumber = [];
		this.roomLon = [];
		this.roomLat = [];
	}

	public getValidFull(short: string) {
		for (const [key, value] of this.namesMap) {
			// console.log(this.validShortNames);
			if (key === short) {
				// console.log(value);
				return value;
			}
		}
	}

	public getValidAdr(short: string) {
		for (const [key, value] of this.addressMap) {
			if (key === short) {
				return value;
			}
		}
	}

	public getHref(listANodes: any) {
		for (let node of listANodes) {
			for (let atr of node.attrs) {
				if ((atr.name === "href") && (node.attrs.length === 2)) {
					if (!this.roomHref.includes(atr.value)) {
						this.roomHref.push(atr.value);
					}
				}
			}
			for (let child of node.childNodes) {
				//  && child.value !== "More info"
				if (child.nodeName === "#text" && child.value !== "More info") {
					// this.fullNames.push(child.value);
					this.roomNumber.push(child.value);
				}
			}
		}
	}
}
