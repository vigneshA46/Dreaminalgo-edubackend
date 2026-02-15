import dotenv from "dotenv";

dotenv.config();

if (!process.env.DATABASE_URL) {
  console.error("❌ ENV NOT LOADED — DB_PASSWORD missing");
  process.exit(1);
}

export {};