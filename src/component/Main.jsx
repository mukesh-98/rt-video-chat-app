import { Box, TextField, Button } from "@mui/material";
import React, { useState } from "react";

import { io } from "socket.io-client";
const socketUri = "http://192.168.2.24:4100";

let iceServers = {
	iceServers: [
		{ urls: "stun:stun.services.mozilla.com" },
		{ urls: "stun:stun.l.google.com:19302" },
	],
};
let rtcPeerConnection;

let socket = io(socketUri, { transports: ["websocket"] });

export default function Main() {
	/**
	 *  Room Id for the room where the clients want to join
	 */
	const [roomId, setRoomId] = useState("");

	/**
	 * User Stream is the creator Media Stream
	 */
	const [userStream, setUserStream] = useState(null);

	const [creator, setCreator] = useState(false);

	/**
	 * @function
	 *  OnIceCandidate Function
	 */
	function OnIceCandidateFunction(e) {
		if (e.candidate) {
			socket.emit("candidate", e.candidate, roomId);
		}
	}

	/**
	 * @function
	 *  OnTrack Function
	 */
	function OnTrackFunction(e) {
		console.log(e.streams);
		var peerVideo = document.getElementById("peer-video");
		peerVideo.srcObject = e.streams[0];
		peerVideo.onloadedmetadata = (e) => {
			peerVideo.play();
		};
	}

	/**
	 * Wether the room is full or not
	 */
	socket.on("full", (room) => {
		alert("Room is full");
	});

	/**
	 * Occuring when room is created
	 */
	socket.on("created", () => {
		/**
		 * Creating user Media Stream when room created
		 */
		setCreator(true);

		navigator.mediaDevices
			.getUserMedia({ audio: true, video: true })
			.then((success) => {
				/**
				 * Setting User Media Stream
				 */
				setUserStream(success);
				/**
				 * Appending user stream into ui
				 */
				var userVideo = document.getElementById("user-video");
				userVideo.srcObject = success;
				userVideo.onloadedmetadata = (e) => {
					userVideo.play();
				};
			})
			.catch((error) => {
				console.log(error);
			});
	});

	/**
	 * Occuring when someone joined
	 */
	socket.on("joined", (room) => {
		/**
		 *  Creating user media stream when joind in room
		 */
		setCreator(false);

		navigator.mediaDevices
			.getUserMedia({ audio: true, video: true })
			.then((success) => {
				/**
				 * Setting remote user media stream
				 */
				setUserStream(success);
				/**
				 * Appending user stream into ui
				 */
				var userVideo = document.getElementById("user-video");
				userVideo.srcObject = success;
				userVideo.onloadedmetadata = (e) => {
					userVideo.play();
				};
				/**
				 * Emmiting Ready event when someone join the room
				 *
				 */
				socket.emit("ready", roomId);
			})
			.catch((error) => {
				console.log(error);
			});
	});

	/**
	 * Occuring when read event
	 */
	socket.on("ready", () => {
		/**
		 * Creating rtc peer connection
		 */
		if (creator) {
			if (
				!rtcPeerConnection &&
				userStream &&
				userStream.getTracks().length > 0
			) {
				rtcPeerConnection = new RTCPeerConnection(iceServers);
				rtcPeerConnection.onicecandidate = OnIceCandidateFunction;
				rtcPeerConnection.ontrack = OnTrackFunction;
				rtcPeerConnection.addTrack(userStream.getTracks()[0], userStream);
				rtcPeerConnection.addTrack(userStream.getTracks()[1], userStream);
				rtcPeerConnection
					.createOffer()
					.then((offer) => {
						rtcPeerConnection.setLocalDescription(offer);
						socket.emit("offer", offer, roomId);
					})

					.catch((error) => {
						console.log(error);
					});
			}
		}
	});
	socket.on("candidate", (candidate) => {
		let icecandidate = new RTCIceCandidate(candidate);
		rtcPeerConnection.addIceCandidate(icecandidate);
	});

	socket.on("offer", (offer) => {
		if (!creator) {
			if (
				!rtcPeerConnection &&
				userStream &&
				userStream.getTracks().length > 0
			) {
				rtcPeerConnection = new RTCPeerConnection(iceServers);
				rtcPeerConnection.onicecandidate = OnIceCandidateFunction;
				rtcPeerConnection.ontrack = OnTrackFunction;
				rtcPeerConnection.addTrack(userStream.getTracks()[0], userStream);
				rtcPeerConnection.addTrack(userStream.getTracks()[1], userStream);
				rtcPeerConnection.setRemoteDescription(offer);
				rtcPeerConnection
					.createAnswer()
					.then((answer) => {
						rtcPeerConnection.setLocalDescription(answer);
						socket.emit("answer", answer, roomId);
					})
					.catch((error) => {
						console.log(error);
					});
			}
		}
	});
	socket.on("answer", (answer) => {
		rtcPeerConnection.setRemoteDescription(answer);
	});

	function joinRoom(params) {
		if (roomId) {
			socket.emit("join", roomId);
		} else {
			alert("Enter Valid Room Id");
		}
	}
	return (
		<Box
			sx={{
				display: "flex",
				alignItems: "center",
				flexDirection: "column",
			}}
		>
			<Box
				sx={{
					height: "150px",
					width: "500px",
					display: "flex",
					justifyContent: "space-evenly",
					flexDirection: "column",
				}}
				id="lobby"
			>
				<TextField
					id="room"
					label="Room"
					onChange={({ target: { value } }) => setRoomId(value)}
				/>
				<Button variant="contained" onClick={joinRoom}>
					Join Room
				</Button>
			</Box>
			<Box id="room">
				<video id="user-video" />
				<video id="peer-video" />
			</Box>
		</Box>
	);
}
