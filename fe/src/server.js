import { io } from "socket.io-client"

// const socket = io("http://localhost:5001")
const socket = io("https://flycarrot10011413.fly.dev", {
    path: '/socket.io',
    transports: ['websocket'],
    withCredentials: true,
    secure: true,
});

export default socket;
