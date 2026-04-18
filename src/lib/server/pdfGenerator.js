import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer';

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

function calculateAge(birthDate) {
	if (!birthDate) return '-';
	const dob = new Date(birthDate);
	const diff_local = Date.now() - dob.getTime();
	if (isNaN(diff_local)) return '-';
	const age_dt = new Date(diff_local);
	return Math.abs(age_dt.getUTCFullYear() - 1970);
}

const GENDER_MAP = { male: 'Male', female: 'Female', other: 'Other', l: 'Male', p: 'Female' };
const MARITAL_MAP = { S: 'Single', M: 'Married', W: 'Widowed', D: 'Divorced' };
const CITIZEN_MAP = { WNI: 'WNI (Indonesian)', WNA: 'WNA (Foreign)' };

function fmtGender(g) { return g ? (GENDER_MAP[g.toLowerCase()] || g) : '-'; }
function fmtMarital(s) { return MARITAL_MAP[s] || s || '-'; }
function fmtCitizen(c) { return CITIZEN_MAP[c] || c || '-'; }
function fmtRhesus(r) { return r ? `RH${r}` : ''; }

function fmtPregnancy(p) {
	if (p.gender?.toLowerCase() !== 'female' && p.gender?.toLowerCase() !== 'p') return 'N/A (Male)';
	return p.pregnancy_status ? 'Yes' : 'No';
}

function fmtBpStatus(bp) {
	if (!bp) return null;
	const parts = bp.split('/').map(Number);
	if (parts.length !== 2 || isNaN(parts[0])) return null;
	const [sys] = parts;
	if (sys < 120) return { label: 'NORMAL', bg: 'bg-emerald-100', text: 'text-emerald-800' };
	if (sys < 130) return { label: 'ELEVATED', bg: 'bg-amber-100', text: 'text-amber-800' };
	if (sys < 140) return { label: 'HIGH', bg: 'bg-orange-100', text: 'text-orange-800' };
	return { label: 'CRITICAL', bg: 'bg-red-100', text: 'text-red-800' };
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
	return lines.join('<br>') || '-';
}

function resolvePath(...candidates) {
	for (const p of candidates) {
		const resolved = path.resolve(p);
		if (fs.existsSync(resolved)) return resolved;
	}
	return null;
}

function getLogoBase64() {
	const p = resolvePath('static/logo.png', 'build/client/logo.png');
	if (!p) return 'https://lh3.googleusercontent.com/aida/ADBb0ugkoJjiR39Et5_D-3ACRzFJ3c7tkkvDC9e3c8DrpH2lFk8Zfafuf2HWT87RZCWcXPR3nkZNHF560v1IwKPSSFTWG8UtDyAMysKE8eze6BXIJX5R3BT0QpSECwr34llkij_v2xFaJuMf9VssrP-o_eHOW_UbxnsvHM9ZKscc_h0UjpuWjIVxSXgpUKeZz2Zwjf70Ugbn3hrwrcWfKFPYsuVJaZG9V8n3l2zhNqQfOuCYdC7jevVoakaMq9bhSxNqf9CMh-B8GzOHRw';
	return 'data:image/png;base64,' + fs.readFileSync(p).toString('base64');
}

export async function generatePatientProfilePdf(data) {
	const { patient, allergies = [], diseases = [], medications = [], origin } = data;
	const logo = getLogoBase64();
	const bpStatus = fmtBpStatus(patient.tekanan_darah);
	const sysRef = `AZ-CLINIC-PR-${patient.id}-${Date.now().toString(36).toUpperCase().slice(-5)}`;

	// Clinical Flags
	let alerts = [];
	if (allergies && allergies.length > 0) {
		alerts.push(`<div class="bg-red-50 text-red-900 px-4 py-3 rounded-lg border border-red-200 flex items-center gap-3">
			<span class="material-symbols-outlined text-red-600 shrink-0">warning</span>
			<div><span class="font-bold text-[10px] uppercase tracking-widest block text-red-600">Allergy Alert</span><span class="text-sm font-semibold">${allergies.length} recorded allergies</span></div>
		</div>`);
	}
	if (bpStatus && (bpStatus.label === 'HIGH' || bpStatus.label === 'CRITICAL')) {
		alerts.push(`<div class="bg-orange-50 text-orange-900 px-4 py-3 rounded-lg border border-orange-200 flex items-center gap-3">
			<span class="material-symbols-outlined text-orange-600 shrink-0">monitor_heart</span>
			<div><span class="font-bold text-[10px] uppercase tracking-widest block text-orange-600">Blood Pressure: ${bpStatus.label}</span><span class="text-sm font-semibold">${patient.tekanan_darah}</span></div>
		</div>`);
	}
	if (patient.pregnancy_status) {
		alerts.push(`<div class="bg-purple-50 text-purple-900 px-4 py-3 rounded-lg border border-purple-200 flex items-center gap-3">
			<span class="material-symbols-outlined text-purple-600 shrink-0">pregnant_woman</span>
			<div><span class="font-bold text-[10px] uppercase tracking-widest block text-purple-600">Notice</span><span class="text-sm font-semibold">Patient is Pregnant</span></div>
		</div>`);
	}

	let flagsHtml = '';
	if (alerts.length > 0) {
		const gridCols = alerts.length === 1 ? 'grid-cols-1' : (alerts.length === 2 ? 'grid-cols-2' : 'grid-cols-3');
		flagsHtml = `
		<div class="mb-8 avoid-break">
			<h3 class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
				<span class="h-px bg-slate-200 flex-1"></span>
				Critical Clinical Highlights
				<span class="h-px bg-slate-200 flex-1"></span>
			</h3>
			<div class="grid ${gridCols} gap-4">
				${alerts.join('')}
			</div>
		</div>`;
	}

	// Allergies List
	let allergiesHtml = "";
	if (allergies.length > 0) {
		allergies.forEach((a, index) => {
			const border = index > 0 ? ' border-t border-red-100 pt-3 mt-3' : '';
			allergiesHtml += `
			<div class="flex justify-between items-start ${border}">
				<div>
					<p class="text-[9px] font-bold text-red-400 uppercase tracking-widest">Substance</p>
					<p class="text-sm font-bold text-red-600">${fmt(a.substance)}</p>
				</div>
				<div class="text-right">
					<p class="text-[9px] font-bold text-red-400 uppercase tracking-widest">Reaction</p>
					<p class="text-sm font-medium text-slate-700">${fmt(a.reaction_display || a.reaction)}</p>
				</div>
			</div>`;
		});
	} else {
		allergiesHtml = `<p class="text-sm italic text-slate-500">No known allergies reported.</p>`;
	}

	// Diseases List
	const personalDiseases = diseases.filter(d => d.type === 'personal');
	const familyDiseases = diseases.filter(d => d.type === 'family');

	const renderDiseases = (items) => {
		if (items.length === 0) return `<p class="text-sm italic text-slate-500 px-1">No reported records</p>`;
		let html = '<ul class="space-y-4">';
		items.forEach(d => {
			html += `
			<li class="flex justify-between items-start border-l-2 border-slate-300 pl-3">
				<div>
					<span class="block text-sm font-bold text-secondary">${fmt(d.disease || d.display)}</span>
					${d.description ? `<span class="block text-xs text-slate-500 mt-0.5">${d.description}</span>` : ''}
				</div>
				${d.code ? `<span class="text-[10px] font-mono text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200 shrink-0 mt-0.5 ml-2 shadow-sm">${d.code}</span>` : ''}
			</li>`;
		});
		html += '</ul>';
		return html;
	};

	// Medications
	let medicationsHtml = "";
	if (medications.length > 0) {
		medications.forEach((m, i) => {
			const bg = i % 2 !== 0 ? ' bg-slate-50/50' : ' bg-white';
			medicationsHtml += `
			<tr class="${bg}">
				<td class="px-5 py-3 font-semibold text-secondary">
					<div class="flex items-center gap-2">
						<span class="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block"></span>
						${fmt(m.medication || m.product_name || m.display)}
					</div>
				</td>
				<td class="px-5 py-3 text-sm text-slate-700">${fmt(m.dosage_form)}</td>
				<td class="px-5 py-3 text-sm font-bold text-slate-700">${fmt(m.dosage)}</td>
				<td class="px-5 py-3 text-xs text-slate-500">${fmt(m.note)}</td>
			</tr>`;
		});
	} else {
		medicationsHtml = `
		<tr class="bg-white">
			<td colspan="4" class="px-5 py-8 text-sm italic text-slate-500 text-center">No active medications currently reported by the patient.</td>
		</tr>`;
	}

	const htmlBody = `<!DOCTYPE html>
<html class="light" lang="en">
<head>
    <meta charset="utf-8"/>
    <meta content="width=device-width, initial-scale=1.0" name="viewport"/>
    <title>Patient Profile - ${fmt(patient.nama_lengkap)}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet"/>
    <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>
    <script id="tailwind-config">
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        primary: "#2563EB",
                        secondary: "#0F172A",
                        tertiary: "#059669",
                        error: "#DC2626",
                        "on-surface": "#0F172A",
                    },
                    fontFamily: {
                        body: ["Inter", "sans-serif"],
                    }
                }
            }
        }
    </script>
    <style>
        .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
            vertical-align: middle;
            font-size: 1.25rem;
        }
        @media print {
            body { background: white !important; margin: 0; padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .avoid-break { page-break-inside: avoid; }
            .page-break { page-break-before: always; }
        }
    </style>
</head>
<body class="bg-white font-body text-on-surface antialiased">
    <!-- Premium Header Banner -->
    <div class="bg-secondary text-white px-10 py-8 flex justify-between items-center rounded-b-[2rem] shadow-sm mb-8 mx-0 avoid-break" style="background: linear-gradient(135deg, #1E293B 0%, #0F172A 100%);">
        <div class="flex items-center gap-6">
            <div class="w-20 h-20 bg-white rounded-2xl p-2 flex items-center justify-center shadow-lg">
                <img alt="Logo" class="max-w-full max-h-full" src="${logo}"/>
            </div>
            <div>
                <div class="flex items-center gap-3 mb-1">
                    <h1 class="text-3xl font-black tracking-tight">${fmt(patient.nama_lengkap)}</h1>
                    <span class="bg-white/20 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-widest backdrop-blur-sm shadow-sm">${calculateAge(patient.birth_date)} YRS</span>
                </div>
                <p class="text-sm font-medium text-slate-300 mt-1 flex items-center gap-2">
                    <span class="material-symbols-outlined text-[1.1rem]">person</span>${fmtGender(patient.gender)}
                    <span class="opacity-50">|</span>
                    <span class="material-symbols-outlined text-[1.1rem]">badge</span>ID: ${patient.id}
                </p>
            </div>
        </div>
        <div class="text-right">
            <h2 class="text-xl font-bold text-blue-400 mb-1">Patient Profile</h2>
            <p class="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-bold mb-2">${sysRef}</p>
            <p class="text-xs font-medium text-slate-300 flex items-center justify-end gap-1.5"><span class="material-symbols-outlined text-[1.1rem]">calendar_today</span>${fmtDate(patient.created_at)}</p>
        </div>
    </div>

    <!-- Main Content Container with standard padding -->
    <div class="px-10 space-y-8">
        
        ${flagsHtml}

        <!-- 2-Column Grid: Left (Demographics) / Right (Vitals & Allergies) -->
        <div class="grid grid-cols-12 gap-8 avoid-break">
            
            <!-- Left Column -->
            <div class="col-span-7 space-y-8">
                <!-- Identity Box -->
                <div>
                    <div class="flex items-center gap-2 mb-3">
                        <div class="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-primary"><span class="material-symbols-outlined text-lg">fingerprint</span></div>
                        <h3 class="text-sm font-bold text-secondary uppercase tracking-widest">Identity & Registration</h3>
                    </div>
                    <div class="bg-slate-50 rounded-xl p-5 border border-slate-200">
                        <dl class="grid grid-cols-2 gap-y-5 gap-x-4">
                            <div class="col-span-2">
                                <dt class="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Full Legal Name</dt>
                                <dd class="text-sm font-black text-secondary">${fmt(patient.nama_lengkap)}</dd>
                            </div>
                            <div>
                                <dt class="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">NIK (ID Card)</dt>
                                <dd class="text-sm font-bold text-slate-800">${fmt(patient.nik)}</dd>
                            </div>
                            <div>
                                <dt class="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Family Card (KK)</dt>
                                <dd class="text-sm font-bold text-slate-800">${fmt(patient.nomor_kk)}</dd>
                            </div>
                            <div>
                                <dt class="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Place & Date of Birth</dt>
                                <dd class="text-sm font-bold text-slate-800">${fmt(patient.birthplace)}, ${fmtDate(patient.birth_date)}</dd>
                            </div>
                            <div>
                                <dt class="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Citizenship</dt>
                                <dd class="text-sm font-bold text-slate-800">${fmtCitizen(patient.citizenship)}</dd>
                            </div>
                        </dl>
                    </div>
                </div>

                <!-- Contact & Address -->
                <div>
                    <div class="flex items-center gap-2 mb-3 mt-4">
                        <div class="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600"><span class="material-symbols-outlined text-lg">location_on</span></div>
                        <h3 class="text-sm font-bold text-secondary uppercase tracking-widest">Contact & Residence</h3>
                    </div>
                    <div class="bg-slate-50 rounded-xl p-5 border border-slate-200">
                        <dl class="grid grid-cols-2 gap-y-5 gap-x-4 mb-5">
                            <div>
                                <dt class="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Mobile Phone</dt>
                                <dd class="text-sm font-bold text-slate-800">${fmt(patient.handphone)}</dd>
                            </div>
                            <div>
                                <dt class="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Email Address</dt>
                                <dd class="text-sm font-bold text-slate-800">${fmt(patient.email)}</dd>
                            </div>
                        </dl>
                        <div class="pt-5 border-t border-slate-200">
                            <dt class="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-2">Residential Address</dt>
                            <dd class="text-sm font-medium leading-relaxed text-slate-700">${fmtAddress(patient)}</dd>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Right Column -->
            <div class="col-span-5 space-y-8">
                <!-- Clinical Vitals Focus Box -->
                <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden relative">
                    <div class="absolute top-0 left-0 w-1 h-full bg-primary"></div>
                    <div class="p-5">
                        <h3 class="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-5 flex items-center gap-2">
                            <span class="material-symbols-outlined text-primary text-[1.1rem]">vital_signs</span> Key Clinical Information
                        </h3>
                        
                        <div class="grid grid-cols-2 gap-4 mb-5">
                            <div class="bg-blue-50/70 rounded-lg p-3 text-center border border-blue-100">
                                <span class="block text-[9px] font-bold text-blue-600 uppercase tracking-widest mb-1">Blood Group</span>
                                <div class="text-xl font-black text-secondary flex items-end justify-center">
                                    ${fmt(patient.blood_type, '-')}
                                    <span class="text-sm font-bold text-blue-500 mb-[1px] ml-0.5">${fmtRhesus(patient.rhesus)}</span>
                                </div>
                            </div>
                            <div class="bg-purple-50/70 rounded-lg p-3 text-center border border-purple-100">
                                <span class="block text-[9px] font-bold text-purple-600 uppercase tracking-widest mb-1">Pregnancy</span>
                                <div class="text-base font-bold text-secondary mt-1.5">${fmtPregnancy(patient)}</div>
                            </div>
                        </div>

                        <div class="bg-slate-50 rounded-lg p-4 text-center border border-slate-200">
                            <span class="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-2">Latest Blood Pressure</span>
                            <div class="flex items-center justify-center gap-1.5 mb-2">
                                <span class="text-2xl font-black text-secondary">${fmt(patient.tekanan_darah, '-/-')}</span>
                                <span class="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">mmHg</span>
                            </div>
                            ${bpStatus ? `<div class="inline-block"><span class="text-[9px] font-black px-2 py-1 rounded-full ${bpStatus.bg} ${bpStatus.text} uppercase tracking-widest shadow-sm">${bpStatus.label}</span></div>` : ''}
                        </div>
                    </div>
                </div>

                <!-- Allergies Panel -->
                <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden relative">
                    <div class="absolute top-0 left-0 w-1 h-full ${allergies.length > 0 ? 'bg-red-500' : 'bg-slate-300'}"></div>
                    <div class="p-5">
                        <h3 class="text-[11px] font-bold ${allergies.length > 0 ? 'text-red-500' : 'text-slate-500'} uppercase tracking-widest mb-4 flex items-center gap-2">
                            <span class="material-symbols-outlined text-[1.1rem]">vaccines</span> Drug & Substance Alerts
                        </h3>
                        <div class="space-y-4">
                            ${allergiesHtml}
                        </div>
                    </div>
                </div>
            </div>

        </div>

        <!-- Divider -->
        <hr class="border-slate-200 my-2 avoid-break" />

        <!-- Full Width: Medical History -->
        <div class="avoid-break space-y-5">
            <div class="flex items-center gap-2">
                <div class="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center text-purple-600"><span class="material-symbols-outlined text-lg">history_edu</span></div>
                <h3 class="text-sm font-bold text-secondary uppercase tracking-widest">Medical Background History</h3>
            </div>
            
            <div class="grid grid-cols-2 gap-8">
                <!-- Personal -->
                <div class="bg-slate-50 rounded-xl p-5 border border-slate-200 relative overflow-hidden">
                    <div class="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-blue-400 to-blue-600"></div>
                    <h4 class="text-[10px] font-bold text-primary uppercase tracking-widest mb-4 flex items-center gap-2">
                        <span class="material-symbols-outlined text-[1rem]">person</span> Personal Illnesses
                    </h4>
                    ${renderDiseases(personalDiseases)}
                </div>
                <!-- Family -->
                <div class="bg-slate-50 rounded-xl p-5 border border-slate-200 relative overflow-hidden">
                    <div class="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-teal-400 to-teal-600"></div>
                    <h4 class="text-[10px] font-bold text-teal-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <span class="material-symbols-outlined text-[1rem]">family_history</span> Hereditary & Family
                    </h4>
                    ${renderDiseases(familyDiseases)}
                </div>
            </div>
        </div>

        <!-- Active Medications -->
        <div class="avoid-break space-y-5 mt-8">
            <div class="flex items-center gap-2">
                <div class="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600"><span class="material-symbols-outlined text-lg">view_list</span></div>
                <h3 class="text-sm font-bold text-secondary uppercase tracking-widest">Current Routine Medications</h3>
            </div>
            
            <div class="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <table class="w-full text-left border-collapse bg-white">
                    <thead class="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th class="px-5 py-3.5 text-[9px] font-bold text-slate-500 uppercase tracking-widest w-[40%]">Medication Name</th>
                            <th class="px-5 py-3.5 text-[9px] font-bold text-slate-500 uppercase tracking-widest w-[20%]">Presentation</th>
                            <th class="px-5 py-3.5 text-[9px] font-bold text-slate-500 uppercase tracking-widest w-[15%]">Dosage</th>
                            <th class="px-5 py-3.5 text-[9px] font-bold text-slate-500 uppercase tracking-widest w-[25%]">Instructions / Notes</th>
                        </tr>
                    </thead>
                    <tbody class="text-sm divide-y divide-slate-100">
                        ${medicationsHtml}
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Document Footer & Signatures -->
        <div class="mt-16 pt-8 border-t-2 border-slate-100 grid grid-cols-12 gap-8 items-end avoid-break">
            <div class="col-span-4 space-y-5">
                <div class="w-16 h-16 bg-white p-1 rounded-lg border border-slate-200 shadow-sm flex items-center justify-center">
                    <img src="https://api.qrserver.com/v1/create-qr-code/?size=80x80&margin=0&data=${encodeURIComponent(origin)}" alt="QR Code Verification" class="w-full h-full opacity-90" />
                </div>
                <div>
                    <p class="text-[9px] font-bold text-primary uppercase tracking-widest">Scan to Verify Record</p>
                    <p class="text-[9px] text-slate-400 mt-1 leading-relaxed">Digital access code for clinical vault verification and record tracking.</p>
                </div>
            </div>
            
            <div class="col-span-4 space-y-4">
                <div class="space-y-1 my-6 text-center">
                    <p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Report Generard On</p>
                    <p class="text-xs font-semibold text-secondary mt-1">${fmtNow()}</p>
                </div>
            </div>

            <div class="col-span-4 text-center space-y-12">
                <p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Authorized Validated Profile</p>
                <div class="relative inline-block w-48 border-b-2 border-slate-200">
                    <!-- Digital Signature Overlay Text -->
                    <span class="absolute -top-10 left-1/2 -translate-x-1/2 font-serif italic text-primary opacity-20 text-3xl pointer-events-none whitespace-nowrap">Oratio e-Sys</span>
                </div>
                <p class="text-[10px] font-bold text-secondary uppercase tracking-widest">Chief Administrator</p>
            </div>
        </div>

    </div>
</body>
</html>`;

	const browser = await puppeteer.launch({
		headless: "new",
		args: [
			'--no-sandbox',
			'--disable-setuid-sandbox',
			'--disable-dev-shm-usage',
			'--disable-gpu'
		],
		executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined
	});
	
	try {
		const page = await browser.newPage();
		
		// Set content and wait for network to be idle to ensure Tailwind CSS and fonts are loaded
		await page.setContent(htmlBody, { waitUntil: 'networkidle0', timeout: 30000 });
		
		const pdfBuffer = await page.pdf({
			format: 'A4',
			printBackground: true,
			margin: {
				top: '0mm',
				bottom: '20mm',
				left: '0mm',
				right: '0mm'
			}
		});

		return pdfBuffer;
	} finally {
		await browser.close();
	}
}
