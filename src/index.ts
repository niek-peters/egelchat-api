import dotenv from "dotenv";
dotenv.config({ path: "../.env" });
import express from "express";
import knex from "knex";

const app = express();

app.use(express.json());

// Connect to the database
export const db = knex({
  client: "mysql2",
  connection: {
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "") || 3306,
    user: process.env.DB_ROOT || "root",
    password: process.env.DB_PASSWORD || "1234",
    database: process.env.DB_DATABASE || "test",
  },
  pool: { min: 0, max: 10 },
  //   debug: true,
  //   asyncStackTraces: true,
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});
