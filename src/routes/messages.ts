import express from "express";
import { db } from "../index.js";
import { toBinaryUUID, fromBinaryUUID } from "binary-uuid";
import {
  Message,
  MessageDB,
  MessageDBRes,
  validate,
} from "../models/message.js";

const router = express.Router();

router.get("/", async (_req, res) => {
  const result: MessageDBRes[] = await db("Messages");

  const resultFormatted: Message[] = result.map((message) => ({
    id: message.id,
    chat_uuid: fromBinaryUUID(message.chat_uuid),
    sender_uuid: fromBinaryUUID(message.sender_uuid),
    content: message.content,
    sent_at: message.sent_at,
  }));

  res.send(resultFormatted);
});

router.get("/:chat_uuid", async (req, res) => {
  if (!req.params.chat_uuid)
    return res.status(400).send("Missing chat_uuid parameter");
  const chat_uuid = req.params.chat_uuid;

  let result: MessageDBRes[];

  result = await db("Messages").where({
    chat_uuid: toBinaryUUID(chat_uuid),
  });

  if (!result.length)
    return res.status(204).send("No messages were found for this chat");

  const resultFormatted: Message[] = result.map((message) => ({
    id: message.id,
    chat_uuid: fromBinaryUUID(message.chat_uuid),
    sender_uuid: fromBinaryUUID(message.sender_uuid),
    content: message.content,
    sent_at: message.sent_at,
  }));

  res.send(resultFormatted);
});

router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.message);

  const { chat_uuid, sender_uuid, content, sent_at } = req.body;
  const message: MessageDB = {
    chat_uuid: toBinaryUUID(chat_uuid),
    sender_uuid: toBinaryUUID(sender_uuid),
    content: content,
    sent_at: sent_at,
  };

  const id = await db("Messages").insert(message);

  const result: Message = {
    id: id[0],
    chat_uuid: chat_uuid,
    sender_uuid: sender_uuid,
    content: content,
    sent_at: sent_at,
  };

  res.send(result);
});

export default router;
