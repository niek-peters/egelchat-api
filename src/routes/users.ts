import express from "express";
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { db } from "../index.js";
import { createBinaryUUID, fromBinaryUUID, toBinaryUUID } from "binary-uuid";
import {
  User,
  UserDB,
  validate,
  validatePut,
  generateAuthToken,
} from "../models/user.js";
import auth from "../middleware/auth.js";
import sameUser from "../middleware/same-user.js";
import pick from "lodash/pick.js";
import clone from "lodash/clone.js";

const router = express.Router();

router.get("/:uuid", auth, async (req: Request, res: Response) => {
  if (!req.params.uuid) return res.status(400).send("Missing uuid parameter");

  const uuid = req.params.uuid;
  const result: UserDB = (
    await db("Users").where({ uuid: toBinaryUUID(uuid) })
  )[0];

  if (!result) return res.status(400).send("User not found");

  const resultFormatted: User = {
    uuid: fromBinaryUUID(result.uuid),
    name: result.name,
    email: result.email,
    pf_pic: result.pf_pic,
  };

  res.send(resultFormatted);
});

router.post("/", async (req: Request, res: Response) => {
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

  let user: UserDB = {
    uuid: uuid,
    name: req.body.name,
    email: req.body.email,
    password: await bcrypt.hash(req.body.password, salt),
  };

  if (req.body.pf_pic) user.pf_pic = req.body.pf_pic;

  await db("Users").insert(user);

  let result: User = {
    uuid: fromBinaryUUID(uuid),
    name: user.name,
    email: user.email,
  };

  const token = generateAuthToken(result);

  res.header("Authorization", "Bearer " + token).send(result);
});

router.put("/", [auth, sameUser], async (req: Request, res: Response) => {
  const { error } = validatePut(req.body);
  if (error) return res.status(400).send(error.message);

  const uuid = res.locals.user.uuid;

  let userCurrent: UserDB = (
    await db("Users").where({ uuid: toBinaryUUID(uuid) })
  )[0];
  if (!userCurrent) return res.status(400).send("User not found");

  const validPassword = await bcrypt.compare(
    req.body.password,
    userCurrent.password
  );
  if (!validPassword) return res.status(400).send("Invalid password.");

  const userBefore: UserDB = clone(userCurrent);

  // If the user changed their username, check if the new username is already taken.
  if (req.body.name !== userCurrent.name) {
    let nameTaken = await db("Users").where({ name: req.body.name });
    if (nameTaken.length)
      return res.status(400).send("Username is already taken.");
    userCurrent.name = req.body.name;
  }

  // If the user changed their password
  if (req.body.password !== req.body.newPassword) {
    const salt = await bcrypt.genSalt(10);
    userCurrent.password = await bcrypt.hash(req.body.newPassword, salt);
  }

  // If the user changed their pf_pic
  if (req.body.pf_pic && req.body.pf_pic !== userCurrent.pf_pic)
    userCurrent.pf_pic = req.body.pf_pic;

  console.log(userBefore);
  console.log(userCurrent);

  if (JSON.stringify(userBefore) === JSON.stringify(userCurrent))
    return res.status(400).send("Nothing changed");

  await db("Users")
    .update(pick(userCurrent, ["name", "password", "pf_pic"]))
    .where({ uuid: toBinaryUUID(uuid) });

  const result: User = {
    uuid: fromBinaryUUID(userCurrent.uuid),
    name: userCurrent.name,
    email: userCurrent.email,
    pf_pic: userCurrent.pf_pic,
  };

  const token = generateAuthToken(result);

  res.header("Authorization", "Bearer " + token).send(result);
});

export default router;
