import dotenv from "dotenv";

dotenv.config();

if (!process.env.DATABASE_URL) {
  console.error("❌ ENV NOT LOADED — DB_PASSWORD missing");
  
}

export const ENV = {
  BREVO_API_KEY: process.env.BREVO_API_KEY,
};

export {};