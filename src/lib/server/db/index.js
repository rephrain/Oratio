import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from './schema.js';

let _db;

function getDb() {
	if (!_db) {
		const connectionString = process.env.DATABASE_URL;
		if (!connectionString) {
			throw new Error('DATABASE_URL environment variable is required');
		}
		const client = postgres(connectionString);
		_db = drizzle(client, { schema });
	}
	return _db;
}

export const db = new Proxy({}, {
	get(_, prop) {
		return getDb()[prop];
	}
});

