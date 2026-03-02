import { Request, Response } from "express";
import {
  findContactsByEmailOrPhone,
  createPrimaryContact
} from "../repositories/contact.repository";

export const identifyController = async (
  req: Request,
  res: Response
) => {
  const { email, phoneNumber } = req.body;

  if (!email && !phoneNumber) {
    return res.status(400).json({
      error: "Either email or phoneNumber must be provided"
    });
  }

  const contacts = await findContactsByEmailOrPhone(email, phoneNumber);

  // If no match → create new primary
  if (contacts.length === 0) {
    const newContact = await createPrimaryContact(email, phoneNumber);

    return res.status(200).json({
      contact: {
        primaryContactId: newContact.id,
        emails: [newContact.email].filter(Boolean),
        phoneNumbers: [newContact.phoneNumber].filter(Boolean),
        secondaryContactIds: []
      }
    });
  }

  // For now just return matches (next step we'll merge)
  return res.status(200).json({
    message: "Match found, merging logic coming next",
    contacts
  });
};