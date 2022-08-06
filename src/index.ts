import dotenv from "dotenv";
dotenv.config({ path: "../.env" });
import express from "express";
import cors from "cors";
import knex from "knex";
import users from "./routes/users.js";
import auth from "./routes/auth.js";
import chats from "./routes/chats.js";
import messages from "./routes/messages.js";

import http from "http";
import { Server } from "socket.io";
import socketAuth from "./sockets/socketAuth.js";
import saveAndEmitMessage from "./sockets/message.js";
import { Message } from "./models/message.js";

const app = express();
const server = http.createServer(app);

// Connect to the database
export const db = knex({
  client: "mysql2",
  connection: {
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "") || 3306,
    user: process.env.DB_ROOT || "root",
    password: process.env.DB_PASSWORD || "1234",
    database: process.env.DB_DATABASE || "test",
  },
  pool: { min: 0, max: 10 },
  //   debug: true,
  //   asyncStackTraces: true,
});

// Middleware
app.use(express.json());
app.use(
  cors({ origin: "http://127.0.0.1:5173", exposedHeaders: "Authorization" })
);

// Routes
app.use("/api/users", users);
app.use("/api/auth", auth);
app.use("/api/chats", chats);
app.use("/api/messages", messages);

// Socket.io initialization
export const io = new Server(server, {
  cors: {
    origin: "http://127.0.0.1:5173",
  },
});

io.use(socketAuth);

io.on("connection", (socket) => {
  // console.log("User connected", socket.handshake.auth);

  const defaultChatUUID = "acdf90a0-1408-11ed-8f13-436d0cf1e378";
  socket.join(defaultChatUUID);

  socket.on("chat_join", async (chatUUID: string) => {
    for (let room of socket.rooms) {
      await socket.leave(room);
    }
    socket.join(chatUUID);
  });

  socket.on("message", (message: Message) => {
    saveAndEmitMessage(socket, message);
  });
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});
