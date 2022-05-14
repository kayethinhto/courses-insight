import express, {Application, Request, Response} from "express";
import * as http from "http";
import cors from "cors";
import InsightFacade from "../controller/InsightFacade";
import {InsightDatasetKind} from "../controller/IInsightFacade";
import {getContentFromArchives} from "../../test/TestUtil";

export default class Server {
	private readonly port: number;
	private express: Application;
	private server: http.Server | undefined;
	private static facade = new InsightFacade();

	constructor(port: number) {
		console.info(`Server::<init>( ${port} )`);
		this.port = port;
		this.express = express();
		this.registerMiddleware();
		this.registerRoutes();

		// NOTE: you can serve static frontend files in from your express server
		// by uncommenting the line below. This makes files in ./frontend/public
		// accessible at http://localhost:<port>/
		// this.express.use(express.static("./frontend/public"))
	}

	/**
	 * Starts the server. Returns a promise that resolves if success. Promises are used
	 * here because starting the server takes some time and we want to know when it
	 * is done (and if it worked).
	 *
	 * @returns {Promise<void>}
	 */
	public start(): Promise<void> {
		return new Promise((resolve, reject) => {
			console.info("Server::start() - start");
			if (this.server !== undefined) {
				console.error("Server::start() - server already listening");
				reject();
			} else {
				this.server = this.express.listen(this.port, () => {
					console.info(`Server::start() - server listening on port: ${this.port}`);
					resolve();
				}).on("error", (err: Error) => {
					// catches errors in server start
					console.error(`Server::start() - server ERROR: ${err.message}`);
					reject(err);
				});
			}
		});
	}

	/**
	 * Stops the server. Again returns a promise so we know when the connections have
	 * actually been fully closed and the port has been released.
	 *
	 * @returns {Promise<void>}
	 */
	public stop(): Promise<void> {
		console.info("Server::stop()");
		return new Promise((resolve, reject) => {
			if (this.server === undefined) {
				console.error("Server::stop() - ERROR: server not started");
				reject();
			} else {
				this.server.close(() => {
					console.info("Server::stop() - server closed");
					resolve();
				});
			}
		});
	}

	// Registers middleware to parse request before passing them to request handlers
	private registerMiddleware() {
		// JSON parser must be place before raw parser because of wildcard matching done by raw parser below
		this.express.use(express.json());
		this.express.use(express.raw({type: "application/*", limit: "10mb"}));

		// enable cors in request headers to allow cross-origin HTTP requests
		this.express.use(cors());
	}

	// Registers all request handlers to routes
	private registerRoutes() {
		// This is an example endpoint this you can invoke by accessing this URL in your browser:
		// http://localhost:4321/echo/hello
		this.express.get("/echo/:msg", Server.echo);
		this.express.get("/search/:id", Server.search);
		this.express.get("/room/:capacity/:furniture", Server.findRoom);
		this.express.put("/dataset/:id/:kind",Server.addDataset);
		this.express.delete("/dataset/:id",Server.removeDataset);
		this.express.post("/query",Server.performQuery);
		this.express.get("/datasets", Server.listDatasets);
	}

	private static listDatasets(req: Request, res: Response) {
		try {
			Server.facade.listDatasets()
				.then((value) => {
					res.status(200).json({result: value});
				}).catch((error) => {
					res.status(400).json({error: error});
				});
		} catch (error) {
			res.status(400).json({error: error});
		}
	}

	private static removeDataset(req: Request, res: Response) {
		try {
			let id = req.params.id;
			Server.facade.removeDataset(id)
				.then((output) => {
					res.status(200).json({result: output});
				}).catch((error) => {
					res.status(400).json({error: error});
				});
		} catch (error) {
			res.status(400).json({error: error});
		}
	}

	private static performQuery(req: Request, res: Response) {
		try {
			console.log(`Server::echo(..) - params: ${JSON.stringify(req.params)}`);
			const query = req.params.body;
			Server.facade.performQuery(query)
				.then((output) => {
					res.status(200).json({result: output});
				}).catch((error) => {
					res.status(400).json({error: error});
				});

		} catch (err) {
			console.log(err);
		}
	}

	private static addDataset(req: Request, res: Response) {
		try {
			console.log(`Server::echo(..) - params: ${JSON.stringify(req.params)}`);
			let id = req.params.id;
			let kind = req.params.kind;
			let body = req.params.body;
			let insightKind: InsightDatasetKind = InsightDatasetKind.Courses;
			let buffer = Buffer.from(body).toString("base64");
			if (kind === "courses") {
				insightKind = InsightDatasetKind.Courses;
			}
			if (kind === "rooms") {
				insightKind = InsightDatasetKind.Rooms;
			}
			Server.facade.addDataset(id, buffer, insightKind)
				.then((value) => {
					res.status(200).json({result: value});
				}).catch((error) => {
					res.status(400).json({error: error});
				});
		} catch (err) {
			res.status(400).json({error: err});
		}
	}

	private static echo(req: Request, res: Response) {
		try {
			const response = Server.performEcho(req.params.msg);
			res.status(200).json({result: response});
		} catch (err) {
			res.status(400).json({error: err});
		}
	}

	private static performEcho(msg: string): string {
		if (typeof msg !== "undefined" && msg !== null) {
			return `${msg}...${msg}`;
		} else {
			return "Message not provided";
		}
	}

	private static async findRoom(req: Request,res: Response) {
		try {
			const {
				capacity,
				furniture
			} = req.params;
			const response = await Server.performRoom(capacity,furniture);
			res.status(200).json({result: response});
		} catch (err) {
			res.status(400).json({error: err});
		}
	}

	private static async  search(req: Request, res: Response) {
		try {
			const response = await Server.performSearch(req.params.id);
			res.status(200).json({result: response});
		} catch (err) {
			res.status(400).json({error: err});
		}

	}

	private  static async performSearch(id: string) {
		if (typeof id !== "undefined" && id !== null) {
			let op: any;
			await Server.facade.performQuery({
				WHERE:{
					EQ:{
						courses_title:id.toString()
					}
				},
				OPTIONS:{
					COLUMNS:[
						"courses_dept",
						"courses_title",
						"courses_year",
						"overallAvg"
					]
				},
				TRANSFORMATIONS: {
					GROUP: ["courses_title","courses_year"],
					APPLY: [{
						overallAvg: {
							AVG: "courses_avg"
						}
					}]
				}
			}).then(((value) => op = value));
			console.log(op);
			return op;
		} else {
			return "Id not provided";
		}
	}

	private static async performRoom(capacity: string, furniture: string) {
		if (typeof capacity !== "undefined" && capacity !== null) {
			if (typeof furniture !== "undefined" && furniture !== null) {
				let op: any;
				await Server.facade.performQuery({
					WHERE:{
						AND:[
							{
								GT:{
									rooms_seats:Number(capacity)
								}
							},
							{
								IS:{
									rooms_furniture:furniture.toString()
								}
							}
						]
					},
					OPTIONS:{
						COLUMNS:[
							"rooms_fullname",
							"rooms_number",
							"rooms_address",
							"rooms_seats",
							"rooms_furniture"
						],
						ORDER: {
							dir: "DOWN",
							keys: ["rooms_seats"]
						}
					},
					TRANSFORMATIONS: {
						GROUP: [],
						APPLY: [{
							max: {
								MAX: "rooms_seats"
							}
						}]
					}
				}).then(((value) => op = value));
				console.log(op);
				return op;
			} else {
				return "Id not provided";
			}
		}
	}
}
