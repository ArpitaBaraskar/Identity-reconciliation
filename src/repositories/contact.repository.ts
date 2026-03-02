import { pool } from "../config/db";

export const findContactsByEmailOrPhone = async (
  email?: string,
  phoneNumber?: string
) => {
  const result = await pool.query(
    `
    SELECT * FROM Contact
    WHERE 
      (email = $1 OR phoneNumber = $2)
      AND deletedAt IS NULL
    `,
    [email || null, phoneNumber || null]
  );

  return result.rows;
};