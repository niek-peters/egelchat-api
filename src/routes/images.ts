import express from "express";
import multer from "multer";
import sharp from "sharp";
import glob from "glob";
import { unlink } from "fs";
import { Request, Response } from "express";
import auth from "../middleware/auth.js";
import sameUser from "../middleware/same-user.js";
import { User, UserDB, generateAuthToken } from "../models/user.js";
import { db } from "../index.js";
import { createBinaryUUID, fromBinaryUUID, toBinaryUUID } from "binary-uuid";

const uploadDir = "../public/";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const fileName = createBinaryUUID().uuid;
    cb(null, fileName);
  },
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype == "image/png" ||
      file.mimetype == "image/jpg" ||
      file.mimetype == "image/jpeg"
    ) {
      cb(null, true);
    } else {
      cb(null, false);
      return cb(new Error("Only .png, .jpg and .jpeg format allowed!"));
    }
  },
}).single("pf_pic");

const router = express.Router();

router.put(
  "/",
  [auth, sameUser, upload],
  async (req: Request, res: Response) => {
    // User's uuid
    const uuid = res.locals.user.uuid;

    const base64Uuid = toBinaryUUID(uuid).toString("base64url");

    if (!req.file) return res.status(400).send("No file uploaded.");

    const base64ImgUuid = createBinaryUUID().buffer.toString("base64url");

    const filePath = `../public/${req.file.filename}`;
    const newFilePath = `../public/pf_pic_${base64Uuid}_${base64ImgUuid}.webp`;

    sharp.cache(false);
    await sharp(filePath).resize(100, 100).toFile(newFilePath);

    glob(`../public/pf_pic_${base64Uuid}*`, (err, files) => {
      if (err) {
        console.log(err);
      } else if (files.length !== 0) {
        files.forEach((file) => {
          if (!file.includes(base64ImgUuid))
            unlink(file, (err) => {
              if (err) {
                console.log(err);
              }
            });
        });
      }
    });

    unlink(filePath, (err) => {
      if (err) console.error(err);
    });

    await db("Users")
      .update({
        pf_pic: `http://localhost:3000/pf_pic_${base64Uuid}_${base64ImgUuid}.webp`,
      })
      .where({ uuid: toBinaryUUID(uuid) });

    const result: UserDB = (
      await db("Users").where({
        uuid: toBinaryUUID(uuid),
      })
    )[0];

    const user: User = {
      uuid: fromBinaryUUID(result.uuid),
      name: result.name,
      email: result.email,
      pf_pic: result.pf_pic,
    };

    const token = generateAuthToken(user);

    res.header("Authorization", "Bearer " + token).send();
  }
);

export default router;
