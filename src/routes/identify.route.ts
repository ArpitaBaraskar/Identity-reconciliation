import express from "express";
import { identifyController } from "../controllers/identify.controller";

const router = express.Router();

router.post("/identify", identifyController);

export default router;