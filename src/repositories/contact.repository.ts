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

export const createPrimaryContact = async (
  email?: string,
  phoneNumber?: string
) => {
  const result = await pool.query(
    `
    INSERT INTO Contact (email, phoneNumber, linkPrecedence)
    VALUES ($1, $2, 'primary')
    RETURNING *
    `,
    [email || null, phoneNumber || null]
  );

  return result.rows[0];
};

export const getAllLinkedContacts = async (primaryId: number) => {
  const result = await pool.query(
    `
    SELECT * FROM Contact
    WHERE 
      id = $1 
      OR linkedId = $1
    `,
    [primaryId]
  );

  return result.rows;
};

export const createSecondaryContact = async (
  email: string | null,
  phoneNumber: string | null,
  primaryId: number
) => {
  const result = await pool.query(
    `
    INSERT INTO Contact (email, phoneNumber, linkedId, linkPrecedence)
    VALUES ($1, $2, $3, 'secondary')
    RETURNING *
    `,
    [email, phoneNumber, primaryId]
  );

  return result.rows[0];
};

export const mergePrimaries = async (primaryIds: number[]) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Get all primary rows sorted by createdAt
    const result = await client.query(
      `
      SELECT * FROM Contact
      WHERE id = ANY($1)
      ORDER BY createdAt ASC
      `,
      [primaryIds]
    );

    const primaries = result.rows;

    // Oldest stays primary
    const oldestPrimary = primaries[0];

    // Others become secondary
    const otherPrimaries = primaries.slice(1);

    for (const p of otherPrimaries) {
      await client.query(
        `
        UPDATE Contact
        SET linkPrecedence = 'secondary',
            linkedId = $1,
            updatedAt = CURRENT_TIMESTAMP
        WHERE id = $2
        `,
        [oldestPrimary.id, p.id]
      );
    }

    await client.query("COMMIT");

    return oldestPrimary.id;

  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};