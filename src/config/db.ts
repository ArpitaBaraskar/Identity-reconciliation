import { Pool } from "pg";

export const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "bitespeed",
  password: process.env.DB_PASSWORD || "BaraskarA@14",
  port: 5432,
});