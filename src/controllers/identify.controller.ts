import { Request, Response } from "express";

export const identifyController = async (
  req: Request,
  res: Response
) => {
  const { email, phoneNumber } = req.body;

  res.status(200).json({
    message: "Identify endpoint working",
    email,
    phoneNumber
  });
};