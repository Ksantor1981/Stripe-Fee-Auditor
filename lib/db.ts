// Neon PostgreSQL client — configure DATABASE_URL in .env.local
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export default sql;
