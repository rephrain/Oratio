export function formatDate(date, locale = 'id-ID') {
	if (!date) return '-';
	return new Date(date).toLocaleDateString(locale, {
		year: 'numeric', month: 'long', day: 'numeric',
		timeZone: 'Asia/Jakarta'
	});
}

export function formatDateTime(date, locale = 'id-ID') {
	if (!date) return '-';
	return new Date(date).toLocaleDateString(locale, {
		year: 'numeric', month: 'short', day: 'numeric',
		hour: '2-digit', minute: '2-digit',
		timeZone: 'Asia/Jakarta'
	});
}

export function formatTime(date) {
	if (!date) return '-';
	return new Date(date).toLocaleTimeString('id-ID', {
		hour: '2-digit', minute: '2-digit',
		timeZone: 'Asia/Jakarta'
	});
}

export function formatCurrency(amount) {
	if (amount == null) return 'Rp 0';
	return new Intl.NumberFormat('id-ID', {
		style: 'currency', currency: 'IDR', minimumFractionDigits: 0
	}).format(amount);
}

export function formatElapsedTime(startTime) {
	const diff = Date.now() - new Date(startTime).getTime();
	const minutes = Math.floor(diff / 60000);
	const hours = Math.floor(minutes / 60);
	const mins = minutes % 60;

	if (hours > 0) return `${hours}j ${mins}m`;
	return `${mins}m`;
}

export function getWaitTimeClass(startTime) {
	const diff = Date.now() - new Date(startTime).getTime();
	const minutes = Math.floor(diff / 60000);
	if (minutes < 15) return 'wait-green';
	if (minutes < 30) return 'wait-yellow';
	return 'wait-red';
}

export function generatePatientId(lastId) {
	if (!lastId) return 'O000001';
	const num = parseInt(lastId.substring(1)) + 1;
	return 'O' + String(num).padStart(6, '0');
}

export function generateEncounterId(doctorCode, lastId) {
	// Ensure we use Jakarta time for the ID prefix
	const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }));
	const prefix = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${doctorCode}`;
	if (!lastId || !lastId.startsWith(prefix)) {
		return prefix + '000001';
	}
	const num = parseInt(lastId.substring(prefix.length)) + 1;
	return prefix + String(num).padStart(6, '0');
}

export function getShiftCountdown(shifts) {
	// Get current time in Jakarta more robustly
	const nowStr = new Date().toLocaleString('en-US', { timeZone: 'Asia/Jakarta', hour12: false });
	const [datePart, timePart] = nowStr.split(', ');
	const [nowH, nowM] = timePart.split(':').map(Number);
	const currentTimeInMinutes = nowH * 60 + nowM;

	// getDay() is tricky with the toLocaleString hack, let's use a safer way
	const dayOfWeek = new Date(datePart).getDay();

	const todayShifts = shifts
		.filter(s => s.day_of_week === dayOfWeek)
		.sort((a, b) => a.start_time.localeCompare(b.start_time));

	for (const shift of todayShifts) {
		const [startH, startM] = shift.start_time.split(':').map(Number);
		const [endH, endM] = shift.end_time.split(':').map(Number);
		const startMin = startH * 60 + startM;
		const endMin = endH * 60 + endM;

		if (currentTimeInMinutes >= startMin && currentTimeInMinutes < endMin) {
			const remaining = endMin - currentTimeInMinutes;
			const hours = Math.floor(remaining / 60);
			const mins = remaining % 60;
			return {
				active: true,
				endTime: shift.end_time,
				remaining: `${hours}j ${mins}m`,
				totalMinutes: remaining,
				status: remaining < 10 ? 'critical' : remaining < 30 ? 'warning' : 'normal'
			};
		}
	}

	// Find next shift
	const allShifts = shifts.sort((a, b) => {
		if (a.day_of_week !== b.day_of_week) return a.day_of_week - b.day_of_week;
		return a.start_time.localeCompare(b.start_time);
	});

	for (const shift of allShifts) {
		const [startH, startM] = shift.start_time.split(':').map(Number);
		const startMin = startH * 60 + startM;

		if (shift.day_of_week > dayOfWeek || (shift.day_of_week === dayOfWeek && startMin > currentTimeInMinutes)) {
			const DAYS = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
			return {
				active: false,
				nextShift: `${DAYS[shift.day_of_week]} ${shift.start_time}`,
				status: 'inactive'
			};
		}
	}

	if (allShifts.length > 0) {
		const DAYS = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
		const next = allShifts[0];
		return {
			active: false,
			nextShift: `${DAYS[next.day_of_week]} ${next.start_time}`,
			status: 'inactive'
		};
	}

	return { active: false, status: 'no-shifts' };
}

export function truncate(str, len = 50) {
	if (!str) return '';
	return str.length > len ? str.substring(0, len) + '...' : str;
}

export function getWhatsAppUrl(phone) {
	if (!phone) return '#';
	// Remove non-numeric characters
	let cleaned = phone.replace(/\D/g, '');
	// Standardize to international format (starting with 62 for Indonesia)
	if (cleaned.startsWith('0')) {
		cleaned = '62' + cleaned.substring(1);
	}
	return `https://wa.me/${cleaned}`;
}

/**
 * Generate structured SOAP text from SOAP_WHO encounter data.
 *
 * @param {Object} params
 * @param {string}  params.reasonDisplay  – encounter_reason_id.display value
 * @param {Array}   params.details        – odontogram.details array (grouped by tooth)
 * @param {Object}  params.constants      – { KEADAAN, RESTORASI, BAHAN_RESTORASI, PROTESA, BAHAN_PROTESA, TOOTH_SURFACES }
 * @returns {{ subjective: string, objective: string, assessment: string, plan: string }}
 */
export function generateSOAPWHOText({ reasonDisplay, details, constants }) {
	const { KEADAAN, RESTORASI, BAHAN_RESTORASI, PROTESA, BAHAN_PROTESA, TOOTH_SURFACES } = constants;

	// Helper: look up display label from a {key,label}[] list
	function label(list, key) {
		if (!key) return '';
		const found = list.find(item => item.key === key);
		return found ? found.label : key;
	}

	function surfaceLabel(key) {
		if (!key) return '';
		const found = TOOTH_SURFACES.find(s => s.key === key);
		return found ? found.label : key;
	}

	// ── S (Subjective) ──────────────────────────────────
	const subjective = reasonDisplay || '-';

	// ── O (Objective) ───────────────────────────────────
	// List every tooth mentioned with condition details but NO ICD codes
	const objectiveLines = [];
	for (const tooth of (details || [])) {
		const tn = tooth.tooth_number;
		const keadaanLabel = label(KEADAAN, tooth.keadaan);
		if (!keadaanLabel) continue;

		let line = `Gigi ${tn}: ${keadaanLabel} (${tooth.keadaan})`;

		// Restorations (surface + restorasi + bahan)
		if (tooth.restorations && tooth.restorations.length > 0) {
			const restParts = tooth.restorations.map(r => {
				const parts = [];
				if (r.surfaces && r.surfaces.length > 0) {
					parts.push(`Surface: ${r.surfaces.map(s => `${s} (${surfaceLabel(s)})`).join(', ')}`);
				}
				if (r.restorasi) {
					parts.push(`Restorasi: ${label(RESTORASI, r.restorasi)} (${r.restorasi})`);
				}
				if (r.bahan_restorasi) {
					parts.push(`Bahan: ${label(BAHAN_RESTORASI, r.bahan_restorasi)} (${r.bahan_restorasi})`);
				}
				return parts.join(', ');
			}).filter(Boolean);

			if (restParts.length > 0) {
				line += '\n' + restParts.map(p => `    • ${p}`).join('\n');
			}
		}

		// Protesa
		if (tooth.protesa) {
			let protesaLine = `    • Protesa: ${label(PROTESA, tooth.protesa)} (${tooth.protesa})`;
			if (tooth.bahan_protesa) {
				protesaLine += `, Bahan: ${label(BAHAN_PROTESA, tooth.bahan_protesa)} (${tooth.bahan_protesa})`;
			}
			line += '\n' + protesaLine;
		}

		objectiveLines.push(line);
	}
	const objective = objectiveLines.length > 0
		? objectiveLines.join('\n\n')
		: '-';

	// ── A (Assessment) ──────────────────────────────────
	// Tooth number → ICD-10 display
	const assessmentLines = [];
	for (const tooth of (details || [])) {
		const tn = tooth.tooth_number;
		const diagnoses = tooth.diagnoses || [];
		for (const diag of diagnoses) {
			const display = diag.diagnosis_display || diag.icd10_display;
			const code = diag.diagnosis_code || diag.icd10_code;
			if (display || code) {
				const primary = diag.is_primary ? ' [Primer]' : '';
				assessmentLines.push(`Gigi ${tn}: ${display || ''}${primary}`);
			}
		}
	}
	const assessment = assessmentLines.length > 0
		? assessmentLines.join('\n')
		: '-';

	// ── P (Plan) ────────────────────────────────────────
	// Tooth number → ICD-9-CM display
	const planLines = [];
	for (const tooth of (details || [])) {
		const tn = tooth.tooth_number;
		const procedures = tooth.procedures || [];
		for (const proc of procedures) {
			const display = proc.procedure_display || proc.icd9cm_display;
			const code = proc.procedure_code || proc.icd9cm_code;
			if (display || code) {
				planLines.push(`Gigi ${tn}: ${display || ''}`);
			}
		}
	}
	const plan = planLines.length > 0
		? planLines.join('\n')
		: '-';

	return { subjective, objective, assessment, plan };
}
