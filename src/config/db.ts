import { Pool } from "pg";

// const requiredEnvVars = ["DB_USER", "DB_HOST", "DB_NAME", "DB_PASSWORD", "DB_PORT"];
// const missingVars = requiredEnvVars.filter(v => !process.env[v]);

// if (missingVars.length > 0) {
//   throw new Error(`Missing environment variables: ${missingVars.join(", ")}`);
// }

export const pool = new Pool({
    
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT),
});