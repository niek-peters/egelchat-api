import express from "express";
import bcrypt from "bcrypt";
import pick from "lodash/pick.js";
import { db } from "../index.js";
import { createBinaryUUID, fromBinaryUUID, toBinaryUUID } from "binary-uuid";
import { UserFull, validate } from "../models/user.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.message);

  let emailTaken = await db("Users").where({ email: req.body.email });
  if (emailTaken.length)
    return res.status(400).send("Email already registered.");

  let nameTaken = await db("Users").where({ name: req.body.name });
  if (nameTaken.length)
    return res.status(400).send("Username is already taken.");

  const uuid = createBinaryUUID().buffer;

  const salt = await bcrypt.genSalt(10);

  let user: UserFull = {
    uuid: uuid,
    name: req.body.name,
    email: req.body.email,
    password: await bcrypt.hash(req.body.password, salt),
  };

  if (req.body.pf_pic) user.pf_pic = req.body.pf_pic;

  await db("Users").insert(user);

  const result = await db("Users").where({ uuid: uuid });
  let values = pick(result[0], ["uuid", "name", "email"]);
  values.uuid = fromBinaryUUID(values.uuid);

  res.send(values);
});

export default router;
