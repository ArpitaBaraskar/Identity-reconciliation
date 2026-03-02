import express from "express";
import dotenv from "dotenv";
import identifyRoute from "./routes/identify.route";

dotenv.config();

const app = express();
app.use(express.json());

app.use("/", identifyRoute);

app.listen(3000, () => {
   console.log("Server running on port 3000");
});