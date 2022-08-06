import jwt from "jsonwebtoken";
import { validateAuthToken } from "../models/user.js";
import { Request, Response, NextFunction } from "express";

export default function auth(req: Request, res: Response, next: NextFunction) {
  const token = req.header("Authorization");
  if (!token)
    return res.status(401).send("Access denied. No auth token provided.");

  if (!validateAuthToken(token))
    return res.status(401).send("Invalid auth token");

  const decoded = jwt.verify(token, process.env.JWT_PRIVATE_KEY as string);

  res.locals.user = decoded;
  next();
}
