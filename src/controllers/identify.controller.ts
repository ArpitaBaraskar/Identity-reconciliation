import { Request, Response } from "express";
import {
  findContactsByEmailOrPhone,
  createPrimaryContact,
  createSecondaryContact,
  getAllLinkedContacts,
  mergePrimaries
} from "../repositories/contact.repository";

export const identifyController = async (
  req: Request,
  res: Response
) => {
  try {
    const { email, phoneNumber } = req.body;

    if (!email && !phoneNumber) {
      return res.status(400).json({
        error: "Either email or phoneNumber must be provided"
      });
    }

    const contacts = await findContactsByEmailOrPhone(email, phoneNumber);

    //  Case 1: No match → create primary
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

    //  Case 2: Match exists

    // Step 1: Extract unique primary IDs
    const primaryIds = new Set<number>(
      contacts.map(c =>
        c.linkedid ? c.linkedid : c.id
      )
    );

    let primaryId: number;

    // Step 2: If multiple primary chains → merge
    if (primaryIds.size > 1) {
      primaryId = await mergePrimaries([...primaryIds]);
    } else {
      primaryId = [...primaryIds][0]!;
    }

    // Step 3: Fetch full chain
    let allContacts = await getAllLinkedContacts(primaryId);

    // Step 4: Check if new information exists
    const emailExists = email
      ? allContacts.some(c => c.email === email)
      : true;

    const phoneExists = phoneNumber
      ? allContacts.some(c => c.phonenumber === phoneNumber)
      : true;

    // Step 5: If new info → create secondary
    if (!emailExists || !phoneExists) {
      await createSecondaryContact(
        email || null,
        phoneNumber || null,
        primaryId
      );

      // Re-fetch updated chain
      allContacts = await getAllLinkedContacts(primaryId);
    }

    // Step 6: Build response
    const primaryContact = allContacts.find(
      c => c.id === primaryId
    );

    // Remove duplicates but preserve order
    const emailSet = new Set<string>();
    const phoneSet = new Set<string>();

    // Add primary first
    if (primaryContact?.email) {
      emailSet.add(primaryContact.email);
    }
    if (primaryContact?.phonenumber) {
      phoneSet.add(primaryContact.phonenumber);
    }

    // Add remaining contacts
    for (const contact of allContacts) {
      if (contact.id !== primaryId) {
        if (contact.email) emailSet.add(contact.email);
        if (contact.phonenumber) phoneSet.add(contact.phonenumber);
      }
    }
    
    const emails = Array.from(emailSet);
    const phoneNumbers = Array.from(phoneSet);

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

  } catch (error) {
    console.error("Identify error:", error);
    return res.status(500).json({
      error: "Internal server error"
    });
  }
};