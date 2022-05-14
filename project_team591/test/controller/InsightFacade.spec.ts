import {
	IInsightFacade,
	InsightDatasetKind,
	InsightError,
	NotFoundError,
	ResultTooLargeError
} from "../../src/controller/IInsightFacade";
import InsightFacade from "../../src/controller/InsightFacade";
import chai, {assert, expect} from "chai";
import chaiAsPromised from "chai-as-promised";
import {clearDisk, getContentFromArchives} from "../TestUtil";


chai.use(chaiAsPromised);

describe("InsightFacade", function() {
	let courses: string ;

	before(function() {
		courses = getContentFromArchives("courses.zip");
	});

	describe("adding rooms", function() {

		let facade: IInsightFacade;
		let rooms: string;
		let rooms2: string;
		before(function() {
			rooms = getContentFromArchives("rooms.zip");
			rooms2 = getContentFromArchives("rooms2.zip");
		});

		beforeEach(function () {
			clearDisk();
			facade = new InsightFacade();
		});

		it("should add one rooms dataset", async function() {
			const result1 = await facade.addDataset("rooms", rooms, InsightDatasetKind.Rooms);
			// const result2 = await facade.addDataset("someValidCourses",someValidCourses,InsightDatasetKind.Courses);
			expect(result1).to.be.an.instanceof(Array);
			// expect(result1).to.deep.equal(["courses-4"]);
		});
		it("should add one shorter rooms dataset", async function() {
			const result1 = await facade.addDataset("rooms2", rooms2, InsightDatasetKind.Rooms);
			// const result2 = await facade.addDataset("someValidCourses",someValidCourses,InsightDatasetKind.Courses);
			expect(result1).to.be.an.instanceof(Array);
			// expect(result1).to.deep.equal(["courses-4"]);
		});

	});

	describe("Transformations", function() {
		let facade: IInsightFacade;

		beforeEach(async function() {
			facade = new InsightFacade();
		});

		// it("should be a valid simple avg transformation", async function() {
		// 	const result = await facade.performQuery({
		// 		WHERE: {},
		// 		OPTIONS: {
		// 			COLUMNS: ["courses_title", "overallAvg"]
		// 		},
		// 		TRANSFORMATIONS: {
		// 			GROUP: ["courses_title"],
		// 			APPLY: [{
		// 				overallAvg: {
		// 					AVG: "courses_avg"
		// 				}
		// 			}]
		// 		}
		// 	});
		//
		// 	expect(result).to.be.an.instanceof(Array);
		// 	expect(result).to.have.deep.members([
		// 		{courses_title : "310", overallAvg: 87.5},
		// 		{courses_title : "210", overallAvg: 77.25}
		// 	]);
		// 	console.log(result);
		// });
		//
		// it("should be a valid simple max transformation", async function() {
		// 	const result = await facade.performQuery({
		// 		WHERE: {},
		// 		OPTIONS: {
		// 			COLUMNS: ["courses_title", "overallAvg"]
		// 		},
		// 		TRANSFORMATIONS: {
		// 			GROUP: ["courses_title"],
		// 			APPLY: [{
		// 				overallAvg: {
		// 					MAX: "courses_avg"
		// 				}
		// 			}]
		// 		}
		// 	});
		//
		// 	expect(result).to.be.an.instanceof(Array);
		// 	expect(result).to.have.deep.members([
		// 		{courses_title : "310", overallAvg: 95},
		// 		{courses_title : "210", overallAvg: 85}
		// 	]);
		// 	console.log(result);
		// });
		//
		// it("should be a valid simple min transformation", async function() {
		// 	const result = await facade.performQuery({
		// 		WHERE: {},
		// 		OPTIONS: {
		// 			COLUMNS: ["courses_title", "overallAvg"]
		// 		},
		// 		TRANSFORMATIONS: {
		// 			GROUP: ["courses_title"],
		// 			APPLY: [{
		// 				overallAvg: {
		// 					MIN: "courses_avg"
		// 				}
		// 			}]
		// 		}
		// 	});
		//
		// 	expect(result).to.be.an.instanceof(Array);
		// 	expect(result).to.have.deep.members([
		// 		{courses_title : "310", overallAvg: 80},
		// 		{courses_title : "210", overallAvg: 72}
		// 	]);
		// 	console.log(result);
		// });
		//
		// it("should be a valid simple count transformation", async function() {
		// 	const result = await facade.performQuery({
		// 		WHERE: {},
		// 		OPTIONS: {
		// 			COLUMNS: ["courses_title", "overallAvg"]
		// 		},
		// 		TRANSFORMATIONS: {
		// 			GROUP: ["courses_title"],
		// 			APPLY: [{
		// 				overallAvg: {
		// 					COUNT: "courses_avg"
		// 				}
		// 			}]
		// 		}
		// 	});
		//
		// 	expect(result).to.be.an.instanceof(Array);
		// 	expect(result).to.have.deep.members([
		// 		{courses_title : "310", overallAvg: 4},
		// 		{courses_title : "210", overallAvg: 4}
		// 	]);
		// 	console.log(result);
		// });
		//
		// it("should be a valid simple sum transformation", async function() {
		// 	const result = await facade.performQuery({
		// 		WHERE: {},
		// 		OPTIONS: {
		// 			COLUMNS: ["courses_title", "overallAvg"]
		// 		},
		// 		TRANSFORMATIONS: {
		// 			GROUP: ["courses_title"],
		// 			APPLY: [{
		// 				overallAvg: {
		// 					SUM: "courses_avg"
		// 				}
		// 			}]
		// 		}
		// 	});
		//
		// 	expect(result).to.be.an.instanceof(Array);
		// 	expect(result).to.have.deep.members([
		// 		{courses_title : "310", overallAvg: 350},
		// 		{courses_title : "210", overallAvg: 309}
		// 	]);
		// 	console.log(result);
		// });
		//
		// it("should be a valid simple order transformation", async function() {
		// 	const result = await facade.performQuery({
		// 		WHERE: {},
		// 		OPTIONS: {
		// 			COLUMNS: ["courses_title", "overallAvg"],
		// 			ORDER: {
		// 				dir: "DOWN",
		// 				keys: ["overallAvg"]
		// 			}
		// 		},
		// 		TRANSFORMATIONS: {
		// 			GROUP: ["courses_title"],
		// 			APPLY: [{
		// 				overallAvg: {
		// 					AVG: "courses_avg"
		// 				}
		// 			}]
		// 		}
		// 	});
		//
		// 	expect(result).to.be.an.instanceof(Array);
		// 	console.log(result);
		// 	expect(result).to.deep.equal([
		// 		{courses_title : "310", overallAvg: 87.5},
		// 		{courses_title : "210", overallAvg: 77.25}
		// 	]);
		// 	// console.log(result);
		// });

		it("should be a valid simple room transformation", async function() {
			const result = await facade.performQuery({
				WHERE: {
					GT: {
						rooms_seats: 300
					}
				},
				OPTIONS: {
					COLUMNS: [
						"rooms_shortname",
						"maxSeats"
					],
					ORDER: {
						dir: "DOWN",
						keys: [
							"maxSeats"
						]
					}
				},
				TRANSFORMATIONS: {
					GROUP: [
						"rooms_shortname"
					],
					APPLY: [
						{
							maxSeats: {
								MAX: "rooms_seats"
							}
						}
					]
				}
			});

			expect(result).to.be.an.instanceof(Array);
			console.log(result);
			// expect(result).to.deep.equal([
			// 	{courses_title : "310", overallAvg: 87.5},
			// 	{courses_title : "210", overallAvg: 77.25}
			// ]);
			// console.log(result);
		});
	//
	//
	});

	describe("List Datasets", function() {

		let facade: IInsightFacade;

		beforeEach(function() {
			clearDisk();
			facade = new InsightFacade();
		});


		it("should list no datasets", function() {
			return facade.listDatasets().then((insightDatasets) => {
				expect(insightDatasets).to.be.an.instanceof(Array);
				expect(insightDatasets).to.have.length(0);
			});
		});

		it("should list one dataset", function() {
			return facade.addDataset("courses", courses, InsightDatasetKind.Courses)
				.then((addedIds) => facade.listDatasets())
				.then((insightDatasets) => {
					expect(insightDatasets).to.deep.equal([{
						id: "courses",
						kind: InsightDatasetKind.Courses,
						numRows: 64612
					}]);
				});
		});

		it("should list multiple datasets", function() {
			return facade.addDataset("courses-3", courses, InsightDatasetKind.Courses)
				.then(() => {
					return facade.addDataset("courses-2", courses, InsightDatasetKind.Courses);
				})
				.then(() => {
					return facade.listDatasets();
				})
				.then((insightDatasets) => {
					expect(insightDatasets).to.be.instanceof(Array);
					expect(insightDatasets).to.have.length(2);
					const insightDatasetCourses = insightDatasets.find((dataset) => dataset.id === "courses-2");
					expect(insightDatasetCourses).to.exist;
					expect(insightDatasetCourses).to.deep.equal({
						id: "courses-2",
						kind: InsightDatasetKind.Courses,
						numRows: 64612,
					});
				});
		});
	});

	describe("Perform Query", function() {

		let facade: IInsightFacade;

		beforeEach(async function() {
			facade = new InsightFacade();
		});

		it("should be an empty valid GT", async function() {
			await facade.addDataset("courses", courses, InsightDatasetKind.Courses);
			const result = await facade.performQuery({
				WHERE: {
					GT: {
						courses_avg: 999
					}
				},
				OPTIONS: {
					COLUMNS: [
						"courses_dept",
						"courses_avg"
					]
				}
			});

			expect(result).to.be.an.instanceof(Array);
			console.log(result);
		});

		it("should be a valid GT", async function() {
			await facade.addDataset("courses", courses, InsightDatasetKind.Courses);
			const result = await facade.performQuery({
				WHERE:{
					GT:{
						courses_avg:97
					}
				},
				OPTIONS:{
					COLUMNS:[
						"courses_dept",
						"courses_avg"
					]
				}
			});

			expect(result).to.be.an.instanceof(Array);
			expect(result).to.have.deep.members( [{courses_dept:"cnps",courses_avg:99.19},
				{courses_dept:"cnps",courses_avg:97.47},{courses_dept:"cnps",courses_avg:97.47},
				{courses_dept:"crwr",courses_avg:98},{courses_dept:"crwr",courses_avg:98},
				{courses_dept:"educ",courses_avg:97.5},{courses_dept:"eece",courses_avg:98.75},
				{courses_dept:"eece",courses_avg:98.75},{courses_dept:"epse",courses_avg:98.08},
				{courses_dept:"epse",courses_avg:98.7},{courses_dept:"epse",courses_avg:98.36},
				{courses_dept:"epse",courses_avg:97.29},{courses_dept:"epse",courses_avg:97.29},
				{courses_dept:"epse",courses_avg:98.8},{courses_dept:"epse",courses_avg:97.41},
				{courses_dept:"epse",courses_avg:98.58},{courses_dept:"epse",courses_avg:98.58},
				{courses_dept:"epse",courses_avg:98.76},{courses_dept:"epse",courses_avg:98.76},
				{courses_dept:"epse",courses_avg:98.45},{courses_dept:"epse",courses_avg:98.45},
				{courses_dept:"epse",courses_avg:97.78},{courses_dept:"epse",courses_avg:97.41},
				{courses_dept:"epse",courses_avg:97.69},{courses_dept:"epse",courses_avg:97.09},
				{courses_dept:"epse",courses_avg:97.09},{courses_dept:"epse",courses_avg:97.67},
				{courses_dept:"math",courses_avg:97.25},{courses_dept:"math",courses_avg:97.25},
				{courses_dept:"math",courses_avg:99.78},{courses_dept:"math",courses_avg:99.78},
				{courses_dept:"math",courses_avg:97.48},{courses_dept:"math",courses_avg:97.48},
				{courses_dept:"math",courses_avg:97.09},{courses_dept:"math",courses_avg:97.09},
				{courses_dept:"nurs",courses_avg:98.71},{courses_dept:"nurs",courses_avg:98.71},
				{courses_dept:"nurs",courses_avg:98.21},{courses_dept:"nurs",courses_avg:98.21},
				{courses_dept:"nurs",courses_avg:97.53},{courses_dept:"nurs",courses_avg:97.53},
				{courses_dept:"nurs",courses_avg:98.5},{courses_dept:"nurs",courses_avg:98.5},
				{courses_dept:"nurs",courses_avg:98.58},{courses_dept:"nurs",courses_avg:98.58},
				{courses_dept:"nurs",courses_avg:97.33},{courses_dept:"nurs",courses_avg:97.33},
				{courses_dept:"spph",courses_avg:98.98},{courses_dept:"spph",courses_avg:98.98}]);
		});

		it("should be a valid LT", async function() {
			const result = await facade.performQuery((
				{
					WHERE:{
						LT:{
							courses_avg:33
						}
					},
					OPTIONS:{
						COLUMNS:[
							"courses_dept",
							"courses_avg"
						]
					}
				}
			));
			expect(result).to.be.instanceof(Array);
			expect(result).to.have.deep.members([
				{courses_dept:"busi",courses_avg:4},{courses_dept:"busi",courses_avg:4},
				{courses_dept:"fopr",courses_avg:4.5},{courses_dept:"frst",courses_avg:0},
				{courses_dept:"lfs",courses_avg:0},{courses_dept:"lfs",courses_avg:0},
				{courses_dept:"wood",courses_avg:1}]);
		});

		it("should be a valid EQ", async function() {
			const result = await facade.performQuery((
				{
					WHERE:{
						EQ:{
							courses_avg:33
						}
					},
					OPTIONS:{
						COLUMNS:[
							"courses_dept",
							"courses_avg"
						]
					}
				}
			));
			expect(result).to.be.instanceof(Array);
			expect(result).to.have.deep.members([{courses_dept:"civl",courses_avg:33}]);
		});

		it("should be a valid return", async function() {
			const result = await facade.performQuery({
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
			} );
			expect(result).to.be.an.instanceof(Array);
			expect(result).to.have.length(49);
			expect(result).to.have.deep.members([{courses_dept: "epse", courses_avg: 97.09},
				{courses_dept: "math", courses_avg: 97.09},
				{courses_dept: "math", courses_avg: 97.09},
				{courses_dept: "epse", courses_avg: 97.09},
				{courses_dept: "math", courses_avg: 97.25},
				{courses_dept: "math", courses_avg: 97.25},
				{courses_dept: "epse", courses_avg: 97.29},
				{courses_dept: "epse", courses_avg: 97.29},
				{courses_dept: "nurs", courses_avg: 97.33},
				{courses_dept: "nurs", courses_avg: 97.33},
				{courses_dept: "epse", courses_avg: 97.41},
				{courses_dept: "epse", courses_avg: 97.41},
				{courses_dept: "cnps", courses_avg: 97.47},
				{courses_dept: "cnps", courses_avg: 97.47},
				{courses_dept: "math", courses_avg: 97.48},
				{courses_dept: "math", courses_avg: 97.48},
				{courses_dept: "educ", courses_avg: 97.5},
				{courses_dept: "nurs", courses_avg: 97.53},
				{courses_dept: "nurs", courses_avg: 97.53},
				{courses_dept: "epse", courses_avg: 97.67},
				{courses_dept: "epse", courses_avg: 97.69},
				{courses_dept: "epse", courses_avg: 97.78},
				{courses_dept: "crwr", courses_avg: 98},
				{courses_dept: "crwr", courses_avg: 98},
				{courses_dept: "epse", courses_avg: 98.08},
				{courses_dept: "nurs", courses_avg: 98.21},
				{courses_dept: "nurs", courses_avg: 98.21},
				{courses_dept: "epse", courses_avg: 98.36},
				{courses_dept: "epse", courses_avg: 98.45},
				{courses_dept: "epse", courses_avg: 98.45},
				{courses_dept: "nurs", courses_avg: 98.5},
				{courses_dept: "nurs", courses_avg: 98.5},
				{courses_dept: "epse", courses_avg: 98.58},
				{courses_dept: "nurs", courses_avg: 98.58},
				{courses_dept: "nurs", courses_avg: 98.58},
				{courses_dept: "epse", courses_avg: 98.58},
				{courses_dept: "epse", courses_avg: 98.7},
				{courses_dept: "nurs", courses_avg: 98.71},
				{courses_dept: "nurs", courses_avg: 98.71},
				{courses_dept: "eece", courses_avg: 98.75},
				{courses_dept: "eece", courses_avg: 98.75},
				{courses_dept: "epse", courses_avg: 98.76},
				{courses_dept: "epse", courses_avg: 98.76},
				{courses_dept: "epse", courses_avg: 98.8},
				{courses_dept: "spph", courses_avg: 98.98},
				{courses_dept: "spph", courses_avg: 98.98},
				{courses_dept: "cnps", courses_avg: 99.19},
				{courses_dept: "math", courses_avg: 99.78},
				{courses_dept: "math", courses_avg: 99.78}] );
		});
		it("should be a valid very complex return", async function() {
			const result = await facade.performQuery({
				WHERE:{
					OR:[
						{
							AND:[
								{
									GT:{
										courses_avg:90
									}
								},
								{
									IS:{
										courses_dept:"adhe"
									}
								}
							]
						},
						{
							EQ:{
								courses_avg:95
							}
						}
					]
				},
				OPTIONS:{
					COLUMNS:[
						"courses_dept",
						"courses_id",
						"courses_avg"
					],
					ORDER:"courses_avg"
				}
			}  );
			expect(result).to.be.an.instanceof(Array);
			expect(result).to.have.length(56);
			expect(result).to.have.deep.members([{courses_dept: "adhe", courses_id: "329", courses_avg: 90.02},
				{courses_dept: "adhe", courses_id: "412", courses_avg: 90.16},
				{courses_dept: "adhe", courses_id: "330", courses_avg: 90.17},
				{courses_dept: "adhe", courses_id: "412", courses_avg: 90.18},
				{courses_dept: "adhe", courses_id: "330", courses_avg: 90.5},
				{courses_dept: "adhe", courses_id: "330", courses_avg: 90.72},
				{courses_dept: "adhe", courses_id: "329", courses_avg: 90.82},
				{courses_dept: "adhe", courses_id: "330", courses_avg: 90.85},
				{courses_dept: "adhe", courses_id: "330", courses_avg: 91.29},
				{courses_dept: "adhe", courses_id: "330", courses_avg: 91.33},
				{courses_dept: "adhe", courses_id: "330", courses_avg: 91.33},
				{courses_dept: "adhe", courses_id: "330", courses_avg: 91.48},
				{courses_dept: "adhe", courses_id: "329", courses_avg: 92.54},
				{courses_dept: "adhe", courses_id: "329", courses_avg: 93.33},
				{courses_dept: "rhsc", courses_id: "501", courses_avg: 95},
				{courses_dept: "bmeg", courses_id: "597", courses_avg: 95},
				{courses_dept: "bmeg", courses_id: "597", courses_avg: 95},
				{courses_dept: "cnps", courses_id: "535", courses_avg: 95},
				{courses_dept: "cnps", courses_id: "535", courses_avg: 95},
				{courses_dept: "cpsc", courses_id: "589", courses_avg: 95},
				{courses_dept: "cpsc", courses_id: "589", courses_avg: 95},
				{courses_dept: "crwr", courses_id: "599", courses_avg: 95},
				{courses_dept: "crwr", courses_id: "599", courses_avg: 95},
				{courses_dept: "crwr", courses_id: "599", courses_avg: 95},
				{courses_dept: "crwr", courses_id: "599", courses_avg: 95},
				{courses_dept: "crwr", courses_id: "599", courses_avg: 95},
				{courses_dept: "crwr", courses_id: "599", courses_avg: 95},
				{courses_dept: "crwr", courses_id: "599", courses_avg: 95},
				{courses_dept: "sowk", courses_id: "570", courses_avg: 95},
				{courses_dept: "econ", courses_id: "516", courses_avg: 95},
				{courses_dept: "edcp", courses_id: "473", courses_avg: 95},
				{courses_dept: "edcp", courses_id: "473", courses_avg: 95},
				{courses_dept: "epse", courses_id: "606", courses_avg: 95},
				{courses_dept: "epse", courses_id: "682", courses_avg: 95},
				{courses_dept: "epse", courses_id: "682", courses_avg: 95},
				{courses_dept: "kin", courses_id: "499", courses_avg: 95},
				{courses_dept: "kin", courses_id: "500", courses_avg: 95},
				{courses_dept: "kin", courses_id: "500", courses_avg: 95},
				{courses_dept: "math", courses_id: "532", courses_avg: 95},
				{courses_dept: "math", courses_id: "532", courses_avg: 95},
				{courses_dept: "mtrl", courses_id: "564", courses_avg: 95},
				{courses_dept: "mtrl", courses_id: "564", courses_avg: 95},
				{courses_dept: "mtrl", courses_id: "599", courses_avg: 95},
				{courses_dept: "musc", courses_id: "553", courses_avg: 95},
				{courses_dept: "musc", courses_id: "553", courses_avg: 95},
				{courses_dept: "musc", courses_id: "553", courses_avg: 95},
				{courses_dept: "musc", courses_id: "553", courses_avg: 95},
				{courses_dept: "musc", courses_id: "553", courses_avg: 95},
				{courses_dept: "musc", courses_id: "553", courses_avg: 95},
				{courses_dept: "nurs", courses_id: "424", courses_avg: 95},
				{courses_dept: "nurs", courses_id: "424", courses_avg: 95},
				{courses_dept: "obst", courses_id: "549", courses_avg: 95},
				{courses_dept: "psyc", courses_id: "501", courses_avg: 95},
				{courses_dept: "psyc", courses_id: "501", courses_avg: 95},
				{courses_dept: "econ", courses_id: "516", courses_avg: 95},
				{courses_dept: "adhe", courses_id: "329", courses_avg: 96.11}]  );
		});

		it("should be an invalid return, resultTooLarge", async function() {
			try {
				await facade.performQuery({
					WHERE: {
						GT: {
							courses_avg: 55
						}
					},
					OPTIONS: {
						COLUMNS: [
							"courses_dept",
							"courses_avg"
						],
						ORDER: "courses_avg"
					}
				});
				expect.fail("Rejection is expected");
			} catch (err) {
				expect(err).to.be.instanceof(ResultTooLargeError);
			}
		});

		it("Should reject, because incorrectly formatted query", async function() {
			try {
				await facade.performQuery({
					WHEE: {
						GT: {
							courses_avg: 95
						}
					},
					OPS: {
						COS: [
							"courses_dept",
							"courses_avg"
						],
						OR: "courses_avg"
					}
				});
				expect.fail("Rejection is expected");
			} catch (err) {
				console.log(err);
				expect(err).to.be.instanceof(InsightError);
			}

		});

		it("Should reject, because file does not exist", async function() {
			try {
				await facade.performQuery({
					WHERE: {
						GT: {
							"courses-72_avg": 95
						}
					},
					OPTIONS: {
						COLUMNS: [
							"courses-72_dept",
							"courses-72_avg"
						],
						ORDER: "courses-72_avg"
					}
				});
				expect.fail("Rejection is expected");
			} catch (err) {
				expect(err).to.be.instanceof(InsightError);
			}

		});

		it("Should reject, because references multiple datasets", async function() {
			try {
				await facade.performQuery({
					WHERE: {
						GT: {
							rooms_avg: 99
						}
					},
					OPTIONS: {
						COLUMNS: [
							"courses_dept",
							"courses_avg"
						],
						ORDER: "courses_avg"
					}
				});
				expect.fail("Rejection is expected");
			} catch (err) {
				expect(err).to.be.instanceof(InsightError);
			}

		});

		it("Should reject, because invalidQueryKeys", async function() {
			try {
				await facade.performQuery({
					WHERE: {
						GT: {
							courses_avg: 99
						}
					},
					OPTIONS: {
						COLUMNS: [
							"courses_dept",
							"courses_age"
						],
						ORDER: "courses_avg"
					}
				});
				expect.fail("Rejection is expected");
			} catch (err) {
				expect(err).to.be.instanceof(InsightError);
			}

		});

	});

	describe("Remove Dataset", function() {

		let facade: IInsightFacade;

		beforeEach(function() {
			facade = new InsightFacade();
			clearDisk();
		});

		it("should be a valid return, removeDataset", async function() {
			return facade.addDataset("courses-10", courses, InsightDatasetKind.Courses);
			const result = await facade.removeDataset("courses-10");
			expect(result).to.equal("courses");
		});

		it("should throw error, because file not added yet", async function() {
			try {
				await facade.removeDataset("nonexistent");
				expect.fail("Should have rejected!");
			} catch (err) {
				expect(err).to.be.instanceof(NotFoundError);
			}
		});

		it("should throw error, because id contains underscore", async function() {
			try {
				await facade.removeDataset("hi_hello");
				expect.fail("Should have rejected!");
			} catch (err) {
				expect(err).to.be.instanceof(InsightError);
			}
		});

		it("should throw error, because id is only blank spaces", async function() {
			try {
				await facade.removeDataset("  ");
				expect.fail("Should have rejected!");
			} catch (err) {
				expect(err).to.be.instanceof(InsightError);
			}
		});

	});

	describe("Add Dataset", function() {

		let facade: IInsightFacade;

		beforeEach(function () {
			clearDisk();
			facade = new InsightFacade();
		});
		let someValidCourses = getContentFromArchives("someValidCourses.zip");
		// let notCourses = getContentFromArchives("notCourses.zip");
		let noValidCourse = getContentFromArchives("noValidCourse.zip");
		let notCourses: string;

		it("should add one dataset", async function() {
			const result1 = await facade.addDataset("courses", courses, InsightDatasetKind.Courses);
			// const result2 = await facade.addDataset("someValidCourses",someValidCourses,InsightDatasetKind.Courses);
			expect(result1).to.be.an.instanceof(Array);
			expect(result1).to.deep.equal(["courses"]);
		});


		it("should fail because no directory named courses", async function() {
			try {
				await facade.addDataset("notCourses", notCourses, InsightDatasetKind.Courses);
				expect.fail("Should have rejected!");
			} catch (err) {
				expect(err).to.be.instanceof(InsightError);
			}
		});

		it("should fail because id contains _", async function() {
			try {
				await facade.addDataset("hi_hello", notCourses, InsightDatasetKind.Courses);
				expect.fail("Should have rejected!");
			} catch (err) {
				expect(err).to.be.instanceof(InsightError);
			}
		});

		it("should fail because id is only   ", async function() {
			try {
				await facade.addDataset("   ", notCourses, InsightDatasetKind.Courses);
				expect.fail("Should have rejected!");
			} catch (err) {
				expect(err).to.be.instanceof(InsightError);
			}
		});

		it("should fail because id already exists", async function() {
			// const added =  await facade.addDataset("courses", courses, InsightDatasetKind.Courses);
			try {
				const added =  await facade.addDataset("courses", courses, InsightDatasetKind.Courses);
				const addedAgain = await facade.addDataset("courses", courses, InsightDatasetKind.Courses);
				await expect(addedAgain).to.be.instanceof(InsightError);
			} catch (err) {
				await expect(err).to.be.instanceof(InsightError);
			}
		});


		it("should fail because no valid course", async function() {
			try {
				await facade.addDataset("noValidCourse", noValidCourse, InsightDatasetKind.Courses);
				// expect.fail("Should have rejected!");
			} catch (err) {
				await expect(err).to.be.instanceof(InsightError);
			}
		});

		it("should skip invalid courses", async function() {
			const result = await facade.addDataset("someValidCourses",someValidCourses,InsightDatasetKind.Courses);
			await expect(result).to.be.an.instanceof(Array);
			// expect(result).to.have.length(1);
			await expect(result).to.include("someValidCourses");
		});


		it("should add multiple datasets", async function() {
			return facade.addDataset("courses-7", courses, InsightDatasetKind.Courses)
				.then(() => {
					return facade.addDataset("courses-8", courses, InsightDatasetKind.Courses);
				}).then(() => {
					return facade.addDataset("courses-9", courses, InsightDatasetKind.Courses);
				})
				.then(() => {
					return facade.listDatasets();
				})
				.then((insightDatasets) => {
					expect(insightDatasets).to.be.instanceof(Array);
					// expect(insightDatasets).to.have.length(2);
					const insightDatasetCourses = insightDatasets.find((dataset) => dataset.id === "courses-9");
					expect(insightDatasetCourses).to.contain({
						id: "courses-9",
						kind: InsightDatasetKind.Courses,
						numRows: 64612,
					});
				});
		});
	});

	describe("EBNF", function() {

		let facade: IInsightFacade;

		beforeEach(function () {
			clearDisk();
			facade = new InsightFacade();
		});

		it("Should reject, because incorrect semantic EBNF", async function() {
			try {
				await facade.performQuery(getContentFromArchives("invalidSemanticEBNF.json"));
				expect.fail("Rejection is expected");
			} catch (err) {
				expect(err).to.be.instanceof(InsightError);
			}

		});

	});
	describe("adding rooms", function() {

		let facade: IInsightFacade;
		let rooms: string;
		let rooms2: string;
		before(function() {
			rooms = getContentFromArchives("rooms.zip");
			rooms2 = getContentFromArchives("rooms2.zip");
		});

		beforeEach(function () {
			clearDisk();
			facade = new InsightFacade();
		});

		it("should add one rooms dataset", async function() {
			const result1 = await facade.addDataset("rooms", rooms, InsightDatasetKind.Rooms);
			// const result2 = await facade.addDataset("someValidCourses",someValidCourses,InsightDatasetKind.Courses);
			expect(result1).to.be.an.instanceof(Array);
			expect(result1).to.deep.equal(["rooms"]);
		});
		it("should add one shorter rooms dataset", async function() {
			const result1 = await facade.addDataset("rooms2", rooms2, InsightDatasetKind.Rooms);
			// const result2 = await facade.addDataset("someValidCourses",someValidCourses,InsightDatasetKind.Courses);
			expect(result1).to.be.an.instanceof(Array);
			expect(result1).to.deep.equal(["rooms2"]);
		});

	});

});


