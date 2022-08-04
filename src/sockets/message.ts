import { Socket } from "socket.io";
import { db } from "../index.js";
import { toBinaryUUID } from "binary-uuid";
import { Message, MessageDB, validate } from "../models/message.js";

const saveAndEmitMessage = async (socket: Socket, message: Message) => {
  const { error } = validate(message);
  if (error) return;

  const { chat_uuid, sender_uuid, content, sent_at } = message;
  const messageDB: MessageDB = {
    chat_uuid: toBinaryUUID(chat_uuid),
    sender_uuid: toBinaryUUID(sender_uuid),
    content: content,
    sent_at: sent_at,
  };

  await db("Messages").insert(messageDB);

  socket.to(chat_uuid).emit("message", message);
};

export default saveAndEmitMessage;
