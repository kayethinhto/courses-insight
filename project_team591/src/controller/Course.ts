export default class Course {
	public courses_dept: string;
	public courses_id: string;
	public courses_avg: number;
	public courses_instructor: string;
	public courses_title: string;
	public courses_pass: number;
	public courses_fail: number;
	public courses_audit: number;
	public courses_uuid: string;
	public courses_year: number;
	public courses_section: number;

	constructor(dept: string, id: string, avg: number, instructor: string, title: string,
		pass: number, fail: number, audit: number, uuid: string, year: number, section: number) {
		this.courses_dept = dept;
		this.courses_id = id;
		this.courses_avg = avg;
		this.courses_instructor = instructor;
		this.courses_title = title;
		this.courses_pass = pass;
		this.courses_fail = fail;
		this.courses_audit = audit;
		this.courses_uuid = uuid;
		this.courses_year = year;
		this.courses_section = section;
	}
}
