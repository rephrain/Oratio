import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';

const require = createRequire(import.meta.url);
const PdfPrinter = require('pdfmake/src/printer');

// ── Colors ──────────────────────────────────────────────────────────────────
const C = {
	primary: '#3B82F6',
	primaryDim: '#BFDBFE',
	primaryContainer: '#DBEAFE',
	secondary: '#1E3A5F',
	surface: '#F8FAFC',
	surfaceContainer: '#F1F5F9',
	outline: '#E2E8F0',
	outlineVariant: '#CBD5E1',
	text: '#1E293B',
	textSec: '#64748B',
	error: '#EF4444',
	errorContainer: '#FEE2E2',
	errorOnContainer: '#991B1B',
	tertiary: '#10B981',
	white: '#FFFFFF',
};

// ── Resolve paths (dev vs production) ───────────────────────────────────────
function resolvePath(...candidates) {
	for (const p of candidates) {
		const resolved = path.resolve(p);
		if (fs.existsSync(resolved)) return resolved;
	}
	return null;
}

function getFontsDir() {
	const dir = resolvePath('static/fonts', 'build/client/fonts');
	if (!dir) throw new Error('Fonts directory not found');
	return dir;
}

function getLogoBase64() {
	const p = resolvePath('static/logo.png', 'build/client/logo.png');
	if (!p) return null;
	return 'data:image/png;base64,' + fs.readFileSync(p).toString('base64');
}

function createPrinter() {
	const dir = getFontsDir();
	return new PdfPrinter({
		Roboto: {
			normal: path.join(dir, 'Roboto-Regular.ttf'),
			bold: path.join(dir, 'Roboto-Medium.ttf'),
			italics: path.join(dir, 'Roboto-Italic.ttf'),
			bolditalics: path.join(dir, 'Roboto-BoldItalic.ttf'),
		},
	});
}

// ── Format helpers ──────────────────────────────────────────────────────────
const fmt = (v, fb = '-') => v || fb;

function fmtDate(d) {
	if (!d) return '-';
	return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Jakarta' });
}

function fmtNow() {
	const now = new Date();
	const date = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Asia/Jakarta' });
	const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Jakarta' });
	return `${date} | ${time} WIB`;
}

const GENDER_MAP = { male: 'Male', female: 'Female', other: 'Other' };
const MARITAL_MAP = { S: 'Single', M: 'Married', W: 'Widowed', D: 'Divorced' };
const CITIZEN_MAP = { WNI: 'WNI (Indonesian)', WNA: 'WNA (Foreign)' };

function fmtGender(g) { return g ? (GENDER_MAP[g.toLowerCase()] || g) : '-'; }
function fmtMarital(s) { return MARITAL_MAP[s] || s || '-'; }
function fmtCitizen(c) { return CITIZEN_MAP[c] || c || '-'; }
function fmtRhesus(r) { return r ? `RH${r}` : ''; }

function fmtPregnancy(p) {
	if (p.gender?.toLowerCase() !== 'female') return 'N/A (Male)';
	return p.pregnancy_status ? 'Yes' : 'No';
}

function fmtBpStatus(bp) {
	if (!bp) return null;
	const parts = bp.split('/').map(Number);
	if (parts.length !== 2 || isNaN(parts[0])) return null;
	const [sys] = parts;
	if (sys < 120) return { label: 'NORMAL', color: C.tertiary };
	if (sys < 130) return { label: 'ELEVATED', color: '#F59E0B' };
	if (sys < 140) return { label: 'HIGH', color: '#F97316' };
	return { label: 'CRITICAL', color: C.error };
}

function fmtAddress(p) {
	const lines = [];
	if (p.address) {
		let line1 = p.address;
		if (p.rt || p.rw) line1 += `, RT ${p.rt || '-'}/RW ${p.rw || '-'}`;
		lines.push(line1);
	}
	const admin = [p.village ? `Kel. ${p.village}` : null, p.district ? `Kec. ${p.district}` : null].filter(Boolean);
	if (admin.length) lines.push(admin.join(', '));
	const city = [p.city, p.province].filter(Boolean);
	if (city.length) lines.push(city.join(', '));
	return lines.join('\n') || '-';
}

// ── pdfmake DSL helpers ─────────────────────────────────────────────────────
const lbl = (t) => ({ text: (t || '').toUpperCase(), fontSize: 6.5, bold: true, color: C.textSec, characterSpacing: 0.5, margin: [0, 0, 0, 2] });
const val = (t, opts = {}) => ({ text: fmt(t), fontSize: 9, color: C.text, ...opts });

function secTitle(title, borderColor = C.primary) {
	return {
		table: {
			widths: [3, 'auto'],
			body: [[
				{ text: '', fillColor: borderColor },
				{ text: title.toUpperCase(), fontSize: 8, bold: true, color: C.secondary, characterSpacing: 1.2, margin: [8, 0, 0, 0] }
			]]
		},
		layout: 'noBorders',
		margin: [0, 0, 0, 8]
	};
}

const cardLayout = (opts = {}) => ({
	hLineWidth: () => opts.noBorder ? 0 : 0.5,
	vLineWidth: () => opts.noBorder ? 0 : 0.5,
	hLineColor: () => opts.borderColor || C.outline,
	vLineColor: () => opts.borderColor || C.outline,
	paddingLeft: () => opts.pad || 14,
	paddingRight: () => opts.pad || 14,
	paddingTop: () => opts.padY || opts.pad || 12,
	paddingBottom: () => opts.padY || opts.pad || 12,
});

function card(body, opts = {}) {
	return {
		table: { widths: ['*'], body: [[{ stack: body, fillColor: opts.fill || C.surface }]] },
		layout: cardLayout(opts),
		margin: opts.margin || [0, 0, 0, 0],
	};
}

function hline(w, color = C.outline) {
	return { canvas: [{ type: 'line', x1: 0, y1: 0, x2: w, y2: 0, lineWidth: 0.5, lineColor: color }], margin: [0, 8, 0, 8] };
}

// ── Build document definition ───────────────────────────────────────────────
function buildDocDefinition(data) {
	const { patient, allergies = [], diseases = [], medications = [] } = data;
	const logo = getLogoBase64();
	const personalDiseases = diseases.filter(d => d.type === 'personal');
	const familyDiseases = diseases.filter(d => d.type === 'family');
	const bpStatus = fmtBpStatus(patient.tekanan_darah);
	const sysRef = `OR-PR-${patient.id}-${Date.now().toString(36).toUpperCase().slice(-5)}`;

	// ── Header ──────────────────────────────────────────────────────────────
	const header = {
		columns: [
			{
				width: '*',
				columns: [
					...(logo ? [{ image: logo, width: 48, margin: [0, 0, 8, 0] }] : []),
					{
						stack: [
							{ text: 'Oratio Clinic', fontSize: 16, bold: true, color: C.secondary },
							{ text: 'MEDICAL EXCELLENCE & PRECISION', fontSize: 7, color: C.textSec, characterSpacing: 2, margin: [0, 2, 0, 0] }
						]
					}
				]
			},
			{
				width: 'auto', alignment: 'right',
				stack: [
					{ text: 'Patient Profile Report', fontSize: 12, bold: true, color: C.primary },
					{
						table: { body: [[{ text: `ID: ${patient.id}`, fontSize: 9, bold: true, color: C.secondary, fillColor: C.primaryContainer, margin: [8, 2, 8, 2] }]] },
						layout: 'noBorders', alignment: 'right', margin: [0, 4, 0, 0]
					},
					{ text: 'CONFIDENTIAL PATIENT RECORD', fontSize: 6, color: C.textSec, characterSpacing: 0.5, alignment: 'right', margin: [0, 6, 0, 0] }
				]
			}
		],
		margin: [0, 0, 0, 16]
	};

	const divider = {
		canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1.5, lineColor: C.primaryDim }],
		margin: [0, 0, 0, 20]
	};

	// ── Left: Patient Identity ──────────────────────────────────────────────
	const identitySec = {
		stack: [
			secTitle('Patient Identity'),
			card([
				{ table: { widths: ['*'], body: [[{ stack: [lbl('Full Name'), val(patient.nama_lengkap, { bold: true, color: C.secondary })] }]] }, layout: 'noBorders', margin: [0, 0, 0, 8] },
				{
					columns: [
						{ width: '50%', stack: [lbl('NIK (Identity Card)'), val(patient.nik)] },
						{ width: '50%', stack: [lbl('Family Card (KK)'), val(patient.nomor_kk)] }
					], margin: [0, 0, 0, 8]
				},
				{
					columns: [
						{ width: '50%', stack: [lbl('Birthplace & Date'), val(`${fmt(patient.birthplace)}, ${fmtDate(patient.birth_date)}`)] },
						{ width: '50%', stack: [lbl('Gender'), val(fmtGender(patient.gender))] }
					]
				}
			])
		],
		margin: [0, 0, 0, 16]
	};

	// ── Left: Contact & Address ─────────────────────────────────────────────
	const contactSec = {
		stack: [
			secTitle('Contact & Address'),
			card([
				{
					columns: [
						{ width: '50%', stack: [lbl('Handphone'), val(patient.handphone)] },
						{ width: '50%', stack: [lbl('Email'), val(patient.email)] }
					], margin: [0, 0, 0, 0]
				},
				hline(260),
				lbl('Full Residential Address'),
				{ text: fmtAddress(patient), fontSize: 9, lineHeight: 1.5 }
			])
		],
		margin: [0, 0, 0, 16]
	};

	// ── Left: Demographics ──────────────────────────────────────────────────
	const demoSec = {
		stack: [
			secTitle('Personal Demographics'),
			card([{
				columns: [
					{ width: '50%', stack: [lbl('Marital Status'), val(fmtMarital(patient.marital_status))] },
					{ width: '50%', stack: [lbl('Citizenship'), val(fmtCitizen(patient.citizenship))] }
				]
			}])
		]
	};

	// ── Right: Clinical Vitals ──────────────────────────────────────────────
	const vitalsSec = {
		stack: [
			secTitle('Clinical Vitals'),
			card([
				{
					columns: [
						{
							width: '*', stack: [
								{ text: 'BLOOD TYPE', fontSize: 6.5, bold: true, color: C.primaryDim, characterSpacing: 1, margin: [0, 0, 0, 4] },
								{
									columns: [
										{ text: fmt(patient.blood_type, '—'), fontSize: 24, bold: true, color: C.white, width: 'auto' },
										{ text: fmtRhesus(patient.rhesus), fontSize: 10, bold: true, color: C.primaryDim, margin: [4, 14, 0, 0], width: 'auto' }
									]
								}
							]
						},
						{
							width: 'auto', stack: [
								{ text: 'PREGNANCY', fontSize: 6.5, bold: true, color: C.primaryDim, characterSpacing: 1, margin: [0, 0, 0, 4] },
								{ text: fmtPregnancy(patient), fontSize: 8, bold: true, color: C.white }
							]
						}
					],
					margin: [0, 0, 0, 12]
				},
				hline(175, 'rgba(255,255,255,0.15)'),
				{ text: 'LATEST BLOOD PRESSURE', fontSize: 6.5, bold: true, color: C.primaryDim, characterSpacing: 1, margin: [0, 0, 0, 4] },
				{
					columns: [
						{ text: fmt(patient.tekanan_darah, '—/—'), fontSize: 18, bold: true, color: C.white, width: 'auto' },
						...(bpStatus ? [{
							table: { body: [[{ text: bpStatus.label, fontSize: 7, bold: true, color: C.white, fillColor: bpStatus.color, margin: [6, 2, 6, 2] }]] },
							layout: 'noBorders', margin: [8, 6, 0, 0], width: 'auto'
						}] : [])
					]
				},
				{ text: `Recorded: ${fmtDate(patient.created_at)}`, fontSize: 7, italics: true, color: 'rgba(255,255,255,0.5)', margin: [0, 4, 0, 0] }
			], { fill: C.secondary, borderColor: C.secondary, pad: 16 })
		],
		margin: [0, 0, 0, 16]
	};

	// ── Right: Allergies ────────────────────────────────────────────────────
	const allergyItems = allergies.length > 0
		? allergies.map((a, i) => ({
			stack: [
				...(i > 0 ? [hline(175, 'rgba(239,68,68,0.15)')] : []),
				{
					columns: [
						{ width: '*', stack: [{ text: 'SUBSTANCE', fontSize: 7, bold: true, color: C.errorOnContainer }, { text: fmt(a.substance), fontSize: 9, bold: true, margin: [0, 2, 0, 0] }] },
						{ width: '*', alignment: 'right', stack: [{ text: 'REACTION', fontSize: 7, bold: true, color: C.errorOnContainer, alignment: 'right' }, { text: fmt(a.reaction_display || a.reaction), fontSize: 9, alignment: 'right', margin: [0, 2, 0, 0] }] }
					]
				}
			]
		}))
		: [{ text: 'No known allergies', fontSize: 9, italics: true, color: C.textSec }];

	const allergySec = {
		stack: [
			secTitle('Allergies', C.error),
			card(allergyItems, { fill: C.errorContainer, borderColor: 'rgba(239,68,68,0.2)' })
		],
		margin: [0, 0, 0, 16]
	};

	// ── Right: QR Code ──────────────────────────────────────────────────────
	const qrSec = card([
		{ qr: `oratio://patient/${patient.id}`, fit: 80, alignment: 'center', margin: [0, 0, 0, 8] },
		{ text: 'VERIFY RECORD AUTHENTICITY', fontSize: 7, bold: true, color: C.secondary, characterSpacing: 1.5, alignment: 'center' },
		{ text: 'Scan to access digital clinical vault', fontSize: 7, color: C.textSec, alignment: 'center', margin: [0, 2, 0, 0] }
	], { fill: C.surfaceContainer });

	// ── Two-column bento grid ───────────────────────────────────────────────
	const bento = {
		columns: [
			{ width: '57%', stack: [identitySec, contactSec, demoSec] },
			{ width: '43%', stack: [vitalsSec, allergySec, qrSec] }
		],
		columnGap: 18,
		margin: [0, 0, 0, 24]
	};

	// ── Full-width: Medical History ─────────────────────────────────────────
	const diseaseList = (items) => items.length > 0
		? items.map(d => ({
			columns: [
				{ text: fmt(d.disease || d.display), fontSize: 9, bold: true, color: C.secondary, width: '*' },
				...(d.code ? [{ text: d.code, fontSize: 7, color: C.textSec, width: 'auto', margin: [4, 1, 0, 0] }] : [])
			], margin: [0, 0, 0, 6]
		}))
		: [{ text: 'No records', fontSize: 9, italics: true, color: C.textSec }];

	const historySec = {
		stack: [
			secTitle('Medical History (Chronic & Hereditary)'),
			{
				columns: [
					{
						width: '50%',
						...card([
							{ text: 'PERSONAL HISTORY', fontSize: 7.5, bold: true, color: C.primary, characterSpacing: 1.5, margin: [0, 0, 0, 8] },
							...diseaseList(personalDiseases)
						])
					},
					{
						width: '50%',
						...card([
							{ text: 'FAMILY HISTORY', fontSize: 7.5, bold: true, color: C.tertiary, characterSpacing: 1.5, margin: [0, 0, 0, 8] },
							...diseaseList(familyDiseases)
						])
					}
				],
				columnGap: 16
			}
		],
		margin: [0, 0, 0, 24]
	};

	// ── Full-width: Medications Table ────────────────────────────────────────
	const medBody = [
		[
			{ text: 'MEDICATION NAME', fontSize: 7, bold: true, color: C.secondary, characterSpacing: 0.8 },
			{ text: 'FORM', fontSize: 7, bold: true, color: C.secondary, characterSpacing: 0.8 },
			{ text: 'DOSAGE', fontSize: 7, bold: true, color: C.secondary, characterSpacing: 0.8 },
			{ text: 'NOTES / SCHEDULE', fontSize: 7, bold: true, color: C.secondary, characterSpacing: 0.8 }
		]
	];

	if (medications.length > 0) {
		medications.forEach(m => {
			medBody.push([
				{ text: fmt(m.medication || m.product_name || m.display), fontSize: 9, bold: true, color: C.secondary },
				{ text: fmt(m.dosage_form), fontSize: 9 },
				{ text: fmt(m.dosage), fontSize: 9 },
				{ text: fmt(m.note), fontSize: 9, color: C.textSec }
			]);
		});
	} else {
		medBody.push([
			{ text: 'No active medications', fontSize: 9, italics: true, color: C.textSec, colSpan: 4, alignment: 'center' }, {}, {}, {}
		]);
	}

	const medSec = {
		stack: [
			secTitle('Active Medications'),
			{
				table: { headerRows: 1, widths: ['*', 70, 55, '*'], body: medBody },
				layout: {
					hLineWidth: (i, node) => (i === 0 || i === 1 || i === node.table.body.length) ? 0.5 : 0.3,
					vLineWidth: () => 0,
					hLineColor: (i) => i === 1 ? C.outline : '#F1F5F9',
					fillColor: (i) => i === 0 ? '#E2E8F0' : (i % 2 === 0 ? C.white : null),
					paddingLeft: () => 12,
					paddingRight: () => 12,
					paddingTop: () => 8,
					paddingBottom: () => 8,
				}
			}
		],
		margin: [0, 0, 0, 30]
	};

	// ── Footer / Signature ──────────────────────────────────────────────────
	const footer = {
		columns: [
			{
				width: '50%',
				stack: [
					lbl('Generated On'),
					{ text: fmtNow(), fontSize: 9, margin: [0, 0, 0, 10] },
					lbl('System Reference'),
					{ text: sysRef, fontSize: 8, color: C.secondary, font: 'Roboto' }
				]
			},
			{
				width: '50%', alignment: 'center',
				stack: [
					lbl('Authorized Clinic Administrator'),
					{ text: ' ', margin: [0, 0, 0, 40] },
					{ canvas: [{ type: 'line', x1: 30, y1: 0, x2: 200, y2: 0, lineWidth: 0.5, lineColor: C.secondary }] },
					{ text: 'ORATIO CLINIC REGISTRY', fontSize: 8, bold: true, color: C.secondary, characterSpacing: 2, alignment: 'center', margin: [0, 6, 0, 0] }
				]
			}
		],
		margin: [0, 16, 0, 0]
	};

	// ── Assemble ────────────────────────────────────────────────────────────
	return {
		pageSize: 'A4',
		pageMargins: [40, 40, 40, 40],
		defaultStyle: { font: 'Roboto', fontSize: 9, color: C.text },
		content: [
			header,
			divider,
			bento,
			historySec,
			medSec,
			{ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 0.5, lineColor: C.outline }] },
			footer
		]
	};
}

// ── Public API ──────────────────────────────────────────────────────────────

/**
 * Generate a Patient Profile Report PDF.
 *
 * @param {Object} data
 * @param {Object} data.patient       — row from patients table
 * @param {Array}  data.allergies     — [{ substance, reaction_display }]
 * @param {Array}  data.diseases      — [{ type, disease|display, code? }]
 * @param {Array}  data.medications   — [{ medication|product_name, dosage_form, dosage, note }]
 * @returns {Promise<Buffer>} PDF file buffer
 */
export async function generatePatientProfilePdf(data) {
	const printer = createPrinter();
	const docDefinition = buildDocDefinition(data);

	return new Promise((resolve, reject) => {
		const doc = printer.createPdfKitDocument(docDefinition);
		const chunks = [];
		doc.on('data', (chunk) => chunks.push(chunk));
		doc.on('end', () => resolve(Buffer.concat(chunks)));
		doc.on('error', reject);
		doc.end();
	});
}
