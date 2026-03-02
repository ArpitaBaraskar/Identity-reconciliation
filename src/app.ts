import express from "express";
import dotenv from "dotenv";
import identifyRoute from "./routes/identify.route";
import { pool } from "./config/db";

pool.connect()
  .then(() => console.log("Database connected"))
  .catch((err) => console.error("DB connection error:", err));

dotenv.config();

const app = express();
app.use(express.json());

app.use("/", identifyRoute);

app.listen(3000, () => {
   console.log("Server running on port 3000");
});