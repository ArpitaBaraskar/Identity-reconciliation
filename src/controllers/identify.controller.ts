import { Request, Response } from "express";
import {
  findContactsByEmailOrPhone,
  createPrimaryContact,
  getAllLinkedContacts
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

  //  No match → create primary
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

  //  Match exists → find primary
  const primary =
    contacts.find(c => c.linkprecedence === "primary") ||
    contacts[0];

  const primaryId =
    primary.linkedid ? primary.linkedid : primary.id;

  const allContacts = await getAllLinkedContacts(primaryId);

  const emails = [...new Set(allContacts.map(c => c.email).filter(Boolean))];
  const phoneNumbers = [...new Set(allContacts.map(c => c.phonenumber).filter(Boolean))];

  const secondaryContactIds = allContacts
    .filter(c => c.linkprecedence === "secondary")
    .map(c => c.id);

  return res.status(200).json({
    contact: {
      primaryContactId: primaryId,
      emails,
      phoneNumbers,
      secondaryContactIds
    }
  });
};