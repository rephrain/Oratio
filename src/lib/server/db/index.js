import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from './schema.js';

const connectionString = process.env.DATABASE_URL || 'postgresql://oratio:Pwd%266w9RfK@localhost:5432/oratio';

const client = postgres(connectionString);
export const db = drizzle(client, { schema });
