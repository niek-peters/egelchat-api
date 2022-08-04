import express from "express";
import bcrypt from "bcrypt";
import Joi from "joi";
import pick from "lodash/pick.js";
import { db } from "../index.js";
import { fromBinaryUUID } from "binary-uuid";
import { UserLogin, generateAuthToken } from "../models/user.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.message);

  let user = (await db("Users").where({ email: req.body.email }))[0];
  if (!user) return res.status(400).send("Invalid email or password.");

  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword) return res.status(400).send("Invalid email or password.");

  let values = pick(user, ["uuid", "name", "email", "pf_pic"]);
  values.uuid = fromBinaryUUID(values.uuid);

  const token = generateAuthToken(values);

  res.header("Authorization", "Bearer " + token).send();
});

function validate(user: UserLogin) {
  const schema = Joi.object({
    email: Joi.string().email().required().min(3).max(255),
    password: Joi.string().required().min(3).max(255),
  });

  return schema.validate(user);
}

export default router;
