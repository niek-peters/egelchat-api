import { Socket } from "socket.io";
import { ExtendedError } from "socket.io/dist/namespace.js";
import { validateAuthToken } from "../models/user.js";

const auth = (
  socket: Socket,
  next: (err?: ExtendedError | undefined) => void
) => {
  const token = socket.handshake.auth.jwt;
  if (!token) return next(new Error("No auth token provided"));
  if (!validateAuthToken(token)) return next(new Error("Invalid auth token"));
  socket.data.token = token;
  next();
};

export default auth;
