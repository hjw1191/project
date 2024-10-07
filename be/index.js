import app from "./src/app.js";
import dotenv from "dotenv";
import { Server } from "socket.io";
import { createServer } from "http";
import { socketIo } from "./src/utils/chat/socket.js";

dotenv.config();

const httpServer = createServer(app);

const allowedOrigins = [
  "https://carrotfe10011341.fly.dev",
  "http://localhost:3000"
];

const io = new Server(httpServer, {
  cors: {
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        console.log(`Blocked by CORS: ${origin}`);
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type'],
    credentials: true,
  },
});

socketIo(io);

const port = process.env.SOCKET_PORT || 5001;
httpServer.listen(port, () => {
  console.log("server listening on port", port);
});
