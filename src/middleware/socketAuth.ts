import { io } from "../index.js";
import { Socket } from "socket.io";
import { ExtendedError } from "socket.io/dist/namespace.js";

export const auth = (
  socket: Socket,
  next: (err?: ExtendedError | undefined) => void
) => {};
