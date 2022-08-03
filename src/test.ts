import { createBinaryUUID, fromBinaryUUID, toBinaryUUID } from "binary-uuid";
import { db } from "./index.js";

const uuid = createBinaryUUID().buffer;

await db("Users").insert({
  uuid: uuid,
  name: "Sjhonnie Doe",
  email: "jarvis12@gmail.com",
  password: "123456",
});

const result = await db("Users").where({ uuid });

console.log(result);
