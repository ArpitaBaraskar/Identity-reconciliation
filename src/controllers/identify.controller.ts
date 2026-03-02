import { Request, Response } from "express";
import { findContactsByEmailOrPhone } from "../repositories/contact.repository";

export const identifyController = async (
  req: Request,
  res: Response
) => {
  const { email, phoneNumber } = req.body;

  const contacts = await findContactsByEmailOrPhone(email, phoneNumber);

  res.status(200).json({
    foundContacts: contacts
  });
};