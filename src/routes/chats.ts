import express from "express";
import { db } from "../index.js";
import { createBinaryUUID, toBinaryUUID, fromBinaryUUID } from "binary-uuid";
import { Chat, ChatDB, validate } from "../models/chat.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.get("/", auth, async (_req, res) => {
  const result: ChatDB[] = await db("Chats");

  const resultFormatted: Chat[] = await Promise.all(
    result.map(async (chat) => {
      if (!chat.owner_uuid) {
        const egelchat_uuid: string = (
          await db("Users").where({ name: "Egelchat" }).select("uuid")
        )[0];

        chat.owner_uuid = toBinaryUUID(egelchat_uuid);
      }

      return {
        uuid: fromBinaryUUID(chat.uuid),
        owner_uuid: fromBinaryUUID(chat.owner_uuid),
        name: chat.name,
      };
    })
  );

  res.send(resultFormatted);
});

router.get("/:uuid", auth, async (req, res) => {
  if (!req.params.uuid) return res.status(400).send("Missing uuid parameter");

  const result: ChatDB = (
    await db("Chats").where({
      uuid: toBinaryUUID(req.params.uuid),
    })
  )[0];

  if (!result) return res.status(400).send("Chat not found");

  if (!result.owner_uuid) {
    const egelchat_uuid: string = (
      await db("Users").where({ name: "Egelchat" }).select("uuid")
    )[0];

    result.owner_uuid = toBinaryUUID(egelchat_uuid);
  }

  const resultFormatted: Chat = {
    uuid: fromBinaryUUID(result.uuid),
    owner_uuid: fromBinaryUUID(result.owner_uuid),
    name: result.name,
  };

  res.send(resultFormatted);
});

router.post("/", auth, async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.message);

  const uuid = createBinaryUUID().buffer;

  const chat: ChatDB = {
    uuid: uuid,
    owner_uuid: toBinaryUUID(req.body.owner_uuid),
    name: req.body.name,
  };

  await db("Chats").insert(chat);

  const result: Chat = {
    uuid: fromBinaryUUID(uuid),
    owner_uuid: req.body.owner_uuid,
    name: req.body.name,
  };

  res.send(result);
});

export default router;
