// Seed script — run with: node drizzle/seed.js
import 'dotenv/config';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import argon2 from 'argon2';

const client = postgres(process.env.DATABASE_URL || 'postgresql://oratio:oratio_secret@localhost:5432/oratio');
const db = drizzle(client);

async function hash(pw) {
	return await argon2.hash(pw, {
		type: argon2.argon2id,
		memoryCost: 65536,   // 64 MiB
		timeCost: 3,         // 3 iterations
		parallelism: 4
	});
}

async function seed() {
	console.log('🌱 Seeding database...');

	// 1. Admin user
	await db.execute`
		INSERT INTO users (name, username, password_hash, role, is_active)
		VALUES ('Administrator', 'admin', ${await hash('admin123')}, 'admin', true)
		ON CONFLICT (username) DO NOTHING
	`;
	console.log('✅ Admin user created');

	// 2. Doctors
	const doctors = [
		{ name: 'drg. Andi Wijaya', code: 'AW', username: 'drg.andi' },
		{ name: 'drg. Budi Santoso', code: 'BS', username: 'drg.budi' },
		{ name: 'drg. Citra Dewi', code: 'CD', username: 'drg.citra' },
		{ name: 'drg. Dewi Kusuma', code: 'DK', username: 'drg.dewi' },
		{ name: 'drg. Eka Prasetyo', code: 'EP', username: 'drg.eka' },
		{ name: 'drg. Fajar Rahman', code: 'FR', username: 'drg.fajar' },
		{ name: 'drg. Gita Sari', code: 'GS', username: 'drg.gita' },
		{ name: 'drg. Hadi Nugroho', code: 'HN', username: 'drg.hadi' },
		{ name: 'drg. Indah Lestari', code: 'IL', username: 'drg.indah' },
		{ name: 'drg. Joko Susanto', code: 'JS', username: 'drg.joko' },
		{ name: 'drg. Kartika Putri', code: 'KP', username: 'drg.kartika' },
		{ name: 'drg. Lukman Hakim', code: 'LH', username: 'drg.lukman' },
		{ name: 'drg. Maya Anggraini', code: 'MA', username: 'drg.maya' },
		{ name: 'drg. Nanda Permata', code: 'NP', username: 'drg.nanda' }
	];

	for (const doc of doctors) {
		await db.execute`
			INSERT INTO users (name, username, password_hash, role, doctor_code, is_active)
			VALUES (${doc.name}, ${doc.username}, ${await hash('dokter123')}, 'dokter', ${doc.code}, true)
			ON CONFLICT (username) DO NOTHING
		`;
	}
	console.log('✅ 14 doctors created');

	// 3. Kasir users
	await db.execute`
		INSERT INTO users (name, username, password_hash, role, is_active)
		VALUES ('Kasir Utama', 'kasir1', ${await hash('kasir123')}, 'kasir', true)
		ON CONFLICT (username) DO NOTHING
	`;
	console.log('✅ Kasir user created');

	// 4. Sample shifts (BS = drg. Budi Santoso)
	const budiResult = await db.execute`SELECT id FROM users WHERE username = 'drg.budi' LIMIT 1`;
	if (budiResult.length > 0) {
		const budiId = budiResult[0].id;
		const shiftData = [
			{ day: 0, start: '10:00', end: '17:00' },  // Sunday
			{ day: 2, start: '13:00', end: '15:00' },  // Tuesday
			{ day: 5, start: '08:00', end: '10:00' }   // Friday
		];
		for (const s of shiftData) {
			await db.execute`
				INSERT INTO shifts (doctor_id, day_of_week, start_time, end_time)
				VALUES (${budiId}, ${s.day}, ${s.start}, ${s.end})
				ON CONFLICT DO NOTHING
			`;
		}
		console.log('✅ Sample shifts created');
	}

	// 5. Allergy reaction codes in terminology_master
	const reactions = [
		['39579001', 'Anaphylaxis'], ['271807003', 'Rash'], ['126485001', 'Urticaria'],
		['25064002', 'Headache'], ['422587007', 'Nausea'], ['422400008', 'Vomiting'],
		['62315008', 'Diarrhea'], ['267036007', 'Dyspnea'], ['49727002', 'Cough'],
		['418290006', 'Itching'], ['267101005', 'Rhinitis'], ['247472004', 'Wheezing'],
		['271757001', 'Swelling'], ['76067001', 'Sneezing'], ['84229001', 'Fatigue'],
		['386661006', 'Fever'], ['23924001', 'Chest tightness'], ['418363000', 'Pruritus'],
		['74776002', 'Itching of eye'], ['703630003', 'Red eye'], ['162397003', 'Pain in stomach'],
		['271681002', 'Angioedema'], ['56018004', 'Wheal'], ['64531003', 'Nasal congestion'],
		['279382005', 'Skin reaction'], ['73442001', 'Stevens-Johnson syndrome'],
		['16932000', 'Nausea and vomiting'], ['404640003', 'Dizziness'], ['267038008', 'Edema'],
		['267036007', 'Dyspnea (breathing difficulty)']
	];

	for (const [code, display] of reactions) {
		await db.execute`
			INSERT INTO terminology_master (system, code, display)
			VALUES ('SNOMED', ${code}, ${display})
			ON CONFLICT (system, code) DO NOTHING
		`;
	}
	console.log('✅ 30 allergy reaction codes seeded');

	// 6. Sample items for billing
	const sampleItems = [
		{ desc: 'Konsultasi', group: 'Konsultasi', price: 100000 },
		{ desc: 'Tambal Gigi (Komposit)', group: 'Restorasi', price: 350000 },
		{ desc: 'Cabut Gigi Biasa', group: 'Bedah Mulut', price: 500000 },
		{ desc: 'Scaling (Pembersihan Karang Gigi)', group: 'Periodonsia', price: 450000 },
		{ desc: 'Rontgen Periapikal', group: 'Radiologi', price: 150000 },
		{ desc: 'Bleaching Gigi', group: 'Estetik', price: 2500000 },
		{ desc: 'Pemasangan Bracket (Behel)', group: 'Ortodonti', price: 8000000 },
		{ desc: 'Perawatan Saluran Akar', group: 'Endodonsi', price: 1500000 },
		{ desc: 'Crown / Mahkota Gigi', group: 'Prosthodonsi', price: 3000000 },
		{ desc: 'Gigi Tiruan Lepasan', group: 'Prosthodonsi', price: 4000000 }
	];

	for (const item of sampleItems) {
		await db.execute`
			INSERT INTO items (description, item_group, price, is_active)
			VALUES (${item.desc}, ${item.group}, ${item.price}, true)
			ON CONFLICT DO NOTHING
		`;
	}
	console.log('✅ 10 sample billing items seeded');

	console.log('🎉 Seeding complete!');
	await client.end();
}

seed().catch(err => {
	console.error('❌ Seed error:', err);
	process.exit(1);
});
