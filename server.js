const express = require("express");
const socket = require("socket.io");
const app = express();
const port = 4100;

const regServer = app.listen(port, () =>
	console.log(`Example app listening on port ${port}! \n `)
);
let io = socket(regServer);

io.on("connection", (socket) => {
	console.log("socket id", socket.id, "\n");
	socket.emit("getMyId", socket.id);

	socket.on("getAllMembers", (roomName) => {
		const rooms = io.sockets.adapter.rooms;
		socket.emit("members", rooms.get(roomName) ? [...rooms.get(roomName)] : []);
	});

	socket.on("join", (roomName) => {
		const rooms = io.sockets.adapter.rooms;
		console.log("Room ", roomName, "\n");
		let room = rooms.get(roomName);

		if (room === undefined) {
			socket.join(roomName);
			room = rooms.get(roomName);
			console.log("Room Created with Name : ", roomName, "\n");
			socket.emit("created", [...room]);
		} else {
			if (room.size < 10) {
				socket.join(roomName);
				console.log("Room Joined by user : ", socket.id, "\n");
				socket.emit("joined", [...room]);
			} else {
				console.log("Room is full ", "\n");
				socket.emit("full", [...room]);
			}
		}
		console.log("The Room is : ", rooms, null, 2, "\n");
	});

	socket.on("ready", (roomName) => {
		console.log("\n", "On Ready");
		console.log("Room Name is : ", roomName);
		socket.broadcast.to(roomName).emit("ready");
	});

	socket.on("candidate", (candidate, roomName) => {
		console.log("\n", "OnIceCandidate");
		console.log("Room Name : ", roomName);
		console.log("IceCandidate : ", candidate);
		socket.broadcast.to(roomName).emit("candidate", candidate);
	});

	socket.on("offer", (offer, roomName) => {
		console.log("\n", "OnOffer");
		console.log("Room Name : ", roomName);
		console.log("offer : ", offer);
		socket.broadcast.to(roomName).emit("offer", offer);
	});

	socket.on("answer", (answer, roomName) => {
		console.log("\n", "OnAnswer");
		console.log("Room Name : ", roomName);
		console.log("offer : ", answer);
		socket.broadcast.to(roomName).emit("answer", answer);
	});
});
