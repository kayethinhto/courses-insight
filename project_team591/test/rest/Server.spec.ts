import Server from "../../src/rest/Server";
import InsightFacade from "../../src/controller/InsightFacade";
import chai, {expect, use} from "chai";

import chaiHttp from "chai-http";
import * as fs from "fs";
import {getContentFromArchives} from "../TestUtil";
import {InsightDatasetKind} from "../../src/controller/IInsightFacade";

let URL = "http://localhost:4321";

describe("Facade D3", function () {

	let facade: InsightFacade;
	let server: Server;

	use(chaiHttp);

	before(function () {
		facade = new InsightFacade();
		server = new Server(4321);
		try {
			server.start();
		} catch (error) {
			console.log(error);
		}
		// TODO: start server here once and handle errors properly
	});

	after(function () {
		// TODO: stop server here once!
		try {
			server.stop();
		} catch (error) {
			console.log(error);
		}
	});

	beforeEach(function () {
		// might want to add some process logging here to keep track of what"s going on
		console.log("starting test");
	});

	afterEach(function () {
		// might want to add some process logging here to keep track of what"s going on
		console.log("finished test");
	});

	// Sample on how to format PUT requests
	it("PUT test for courses dataset", function () {
		try {
			return chai.request(URL)
				.put("/dataset/courses/courses")
				.send(fs.readFileSync("./test/resources/archives/courses.zip"))
				.set("Content-Type", "application/x-zip-compressed")
				.then(function (res: ChaiHttp.Response) {
					// console.log(res.body);
					expect(res.status).to.be.equal(200);
				})
				.catch(function (err) {
					console.log(err);
					expect.fail();
				});
		} catch (err) {
			console.log(err);
		}
	});


	// The other endpoints work similarly. You should be able to find all instructions at the chai-http documentation
});
