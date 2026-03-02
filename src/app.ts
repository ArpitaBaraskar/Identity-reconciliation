import dotenv from "dotenv";
dotenv.config(); 

import express from "express";
import identifyRoute from "./routes/identify.route";
import { pool } from "./config/db";

// Now DB connect AFTER dotenv loads
pool.connect()
  .then(() => console.log("Database connected"))
  .catch((err) => console.error("DB connection error:", err));

const app = express();
app.use(express.json());

app.use("/", identifyRoute);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});