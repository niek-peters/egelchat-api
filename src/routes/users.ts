import express from "express";
import { User, validate } from "../models/user";



const router = express.Router();

router.post("/", (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.message);
});
