const form = document.getElementById("search");
const form1 = document.getElementById("rooms");
const form2 = document.getElementById("remove");

const ctx = document.getElementById('myChart');

// fetch("http://localhost:4321/dataset/courses/courses",{
// 	method: 'PUT',
// 	headers:{
// 		"Content-Type": "application/x-zip-compressed"
// 	},
// 	body: Buffer.from(fs.readFileSync("./test/resources/archives/courses.zip"))
// })


form1.addEventListener("submit", function(event) {
	let capacity = document.getElementById("capacity").value;
	let furniture = document.getElementById("furniture").value.toString().replace("/","%2F");
	let url ="http://localhost:4321/room/" + capacity + "/" + furniture;
	fetch(url)
		.then(data =>{return data.json()})
		.then(res => {
			let data = res["result"];
			if (data.length === 0) {
				alert("no appropriate room was found");
				return;
			}
			let op = document.getElementById("roomsResult");
			let bold = document.createElement("b");
			op.appendChild(bold);
			let text = document.createTextNode("The room best suited for you is: ");
			bold.appendChild(text);
			let br = document.createElement("br");
			op.appendChild(br);
			for (let x of Object.keys(data[0])) {
				let br = document.createElement("br");
				const textnode = document.createTextNode(x + ": " + data[0][x]);
				op.appendChild(textnode);
				op.appendChild(br);
			}

		});
	event.preventDefault();
})


form.addEventListener("submit", function(event) {
	let title = document.getElementById("title").value
	let url = "http://localhost:4321/search/" + title
	let dataMap = new Map;
	let years = [];
	let avg = [];
	fetch(url)
		.then(data =>{return data.json()})
		.then(res => {
			let data = res["result"]
			if (data.length === 0) {
				alert("No valid courses");
				return;
			}
			for (let x of data) {
				dataMap.set((Number(x["courses_year"])),x["overallAvg"]);
			}
			// below is from https://www.geeksforgeeks.org/how-to-sort-a-map-in-javascript/
			dataMap = new Map([...dataMap.entries()].sort());
			// below is from https://stackoverflow.com/questions/16507866/iterate-through-a-map-in-javascript
			for (const [key, value] of dataMap.entries()) {
				years.push(key);
				avg.push(value);
			}
			const myChart = new Chart(ctx, {
				type: 'line',
				data: {
					labels: years,
					datasets: [{
						label: 'average',
						backgroundColor: '#00FF00',
						borderColor: '#000000',
						data: avg,
					}]
				},
				options: {
					responsive: false
				}
			});


		})
		.catch((err) => {
			console.log(err);
		})


	event.preventDefault();
});
