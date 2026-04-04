import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer';

const fmt = (v, fb = "-") => v || fb;
function fmtDate(d) {
  if (!d)
    return "-";
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Jakarta" });
}
function fmtNow() {
  const now = /* @__PURE__ */ new Date();
  const date = now.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric", timeZone: "Asia/Jakarta" });
  const time = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Asia/Jakarta" });
  return `${date} | ${time} WIB`;
}
const GENDER_MAP = { male: "Male", female: "Female", other: "Other", l: "Male", p: "Female" };
const MARITAL_MAP = { S: "Single", M: "Married", W: "Widowed", D: "Divorced" };
const CITIZEN_MAP = { WNI: "WNI (Indonesian)", WNA: "WNA (Foreign)" };
function fmtGender(g) {
  return g ? GENDER_MAP[g.toLowerCase()] || g : "-";
}
function fmtMarital(s) {
  return MARITAL_MAP[s] || s || "-";
}
function fmtCitizen(c) {
  return CITIZEN_MAP[c] || c || "-";
}
function fmtRhesus(r) {
  return r ? `RH${r}` : "";
}
function fmtPregnancy(p) {
  if (p.gender?.toLowerCase() !== "female" && p.gender?.toLowerCase() !== "p")
    return "N/A (Male)";
  return p.pregnancy_status ? "Yes" : "No";
}
function fmtBpStatus(bp) {
  if (!bp)
    return null;
  const parts = bp.split("/").map(Number);
  if (parts.length !== 2 || isNaN(parts[0]))
    return null;
  const [sys] = parts;
  if (sys < 120)
    return { label: "NORMAL", bg: "bg-tertiary", text: "text-on-tertiary" };
  if (sys < 130)
    return { label: "ELEVATED", bg: "bg-amber-500", text: "text-white" };
  if (sys < 140)
    return { label: "HIGH", bg: "bg-orange-500", text: "text-white" };
  return { label: "CRITICAL", bg: "bg-error", text: "text-on-error" };
}
function fmtAddress(p) {
  const lines = [];
  if (p.address) {
    let line1 = p.address;
    if (p.rt || p.rw)
      line1 += `, RT ${p.rt || "-"}/RW ${p.rw || "-"}`;
    lines.push(line1);
  }
  const admin = [p.village ? `Kel. ${p.village}` : null, p.district ? `Kec. ${p.district}` : null].filter(Boolean);
  if (admin.length)
    lines.push(admin.join(", "));
  const city = [p.city, p.province].filter(Boolean);
  if (city.length)
    lines.push(city.join(", "));
  return lines.join("<br>") || "-";
}
function resolvePath(...candidates) {
  for (const p of candidates) {
    const resolved = path.resolve(p);
    if (fs.existsSync(resolved))
      return resolved;
  }
  return null;
}
function getLogoBase64() {
  const p = resolvePath("static/logo.png", "build/client/logo.png");
  if (!p)
    return "https://lh3.googleusercontent.com/aida/ADBb0ugkoJjiR39Et5_D-3ACRzFJ3c7tkkvDC9e3c8DrpH2lFk8Zfafuf2HWT87RZCWcXPR3nkZNHF560v1IwKPSSFTWG8UtDyAMysKE8eze6BXIJX5R3BT0QpSECwr34llkij_v2xFaJuMf9VssrP-o_eHOW_UbxnsvHM9ZKscc_h0UjpuWjIVxSXgpUKeZz2Zwjf70Ugbn3hrwrcWfKFPYsuVJaZG9V8n3l2zhNqQfOuCYdC7jevVoakaMq9bhSxNqf9CMh-B8GzOHRw";
  return "data:image/png;base64," + fs.readFileSync(p).toString("base64");
}
async function generatePatientProfilePdf(data) {
  const { patient, allergies = [], diseases = [], medications = [], origin } = data;
  const logo = getLogoBase64();
  const bpStatus = fmtBpStatus(patient.tekanan_darah);
  const sysRef = `AZ-CLINIC-PR-${patient.id}-${Date.now().toString(36).toUpperCase().slice(-5)}`;
  let allergiesHtml = "";
  if (allergies.length > 0) {
    allergies.forEach((a, index) => {
      const border = index > 0 ? " border-t border-error/10 pt-2" : "";
      allergiesHtml += `
			<div class="flex justify-between items-start ${border}">
				<div>
					<p class="text-xs font-bold uppercase">Substance</p>
					<p class="text-sm font-semibold">${fmt(a.substance)}</p>
				</div>
				<div class="text-right">
					<p class="text-xs font-bold uppercase">Reaction</p>
					<p class="text-sm">${fmt(a.reaction_display || a.reaction)}</p>
				</div>
			</div>`;
    });
  } else {
    allergiesHtml = `<p class="text-sm italic text-on-surface-variant">No known allergies reported.</p>`;
  }
  const personalDiseases = diseases.filter((d) => d.type === "personal");
  const familyDiseases = diseases.filter((d) => d.type === "family");
  const renderDiseases = (items) => {
    if (items.length === 0)
      return `<p class="text-sm italic text-on-surface-variant">No records</p>`;
    let html = '<ul class="space-y-3">';
    items.forEach((d) => {
      html += `
			<li class="flex justify-between items-start">
				<span class="text-sm font-medium text-secondary">${fmt(d.disease || d.display)}</span>
				${d.code ? `<span class="text-[10px] font-mono text-on-surface-variant bg-slate-100 px-1.5 py-0.5 rounded">${d.code}</span>` : ""}
			</li>`;
    });
    html += "</ul>";
    return html;
  };
  let medicationsHtml = "";
  if (medications.length > 0) {
    medications.forEach((m, i) => {
      const bg = i % 2 !== 0 ? " bg-surface-container-lowest" : "";
      medicationsHtml += `
			<tr class="border-b border-outline/30${bg}">
				<td class="px-4 py-3 font-semibold text-secondary">${fmt(m.medication || m.product_name || m.display)}</td>
				<td class="px-4 py-3">${fmt(m.dosage_form)}</td>
				<td class="px-4 py-3">${fmt(m.dosage)}</td>
				<td class="px-4 py-3 text-on-surface-variant">${fmt(m.note)}</td>
			</tr>`;
    });
  } else {
    medicationsHtml = `
		<tr class="border-b border-outline/30">
			<td colspan="4" class="px-4 py-3 text-sm italic text-on-surface-variant text-center">No active medications recorded.</td>
		</tr>`;
  }
  const htmlBody = `<!DOCTYPE html>
<html class="light" lang="en">
<head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Patient Profile Report - Oratio Clinic</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"><\/script>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script id="tailwind-config">
	tailwind.config = {
	darkMode: "class",
	theme: {
		extend: {
		"colors": {
				"primary-container": "#DBEAFE",
				"on-tertiary-fixed": "#064E3B",
				"surface-bright": "#FFFFFF",
				"on-tertiary-container": "#065F46",
				"on-secondary-container": "#F1F5F9",
				"on-secondary-fixed-variant": "#334155",
				"inverse-on-surface": "#F8FAFC",
				"error": "#EF4444",
				"tertiary": "#10B981",
				"outline": "#E2E8F0",
				"surface-container-low": "#F8FAFC",
				"surface-container-highest": "#CBD5E1",
				"on-secondary-fixed": "#0F172A",
				"surface": "#FFFFFF",
				"on-primary-fixed": "#172554",
				"tertiary-container": "#D1FAE5",
				"surface-variant": "#F1F5F9",
				"on-error-container": "#991B1B",
				"on-surface": "#1E293B",
				"primary-fixed": "#DBEAFE",
				"surface-container-high": "#E2E8F0",
				"surface-container-lowest": "#FFFFFF",
				"on-primary": "#FFFFFF",
				"primary-fixed-dim": "#BFDBFE",
				"on-primary-container": "#1E40AF",
				"on-primary-fixed-variant": "#1E40AF",
				"secondary-container": "#334155",
				"surface-tint": "#3B82F6",
				"error-container": "#FEE2E2",
				"tertiary-fixed-dim": "#A7F3D0",
				"tertiary-fixed": "#D1FAE5",
				"on-tertiary": "#FFFFFF",
				"surface-dim": "#F5F5F8",
				"surface-container": "#F1F5F9",
				"secondary-fixed": "#E2E8F0",
				"background": "#F5F5F8",
				"inverse-primary": "#93C5FD",
				"secondary-fixed-dim": "#CBD5E1",
				"on-surface-variant": "#64748B",
				"primary": "#3B82F6",
				"outline-variant": "#CBD5E1",
				"on-tertiary-fixed-variant": "#065F46",
				"on-error": "#FFFFFF",
				"on-secondary": "#FFFFFF",
				"on-background": "#1E293B",
				"secondary": "#1E3A5F",
				"inverse-surface": "#1E3A5F"
		},
		"borderRadius": {
				"DEFAULT": "0.25rem",
				"lg": "0.5rem",
				"xl": "0.75rem",
				"full": "9999px"
		},
		"fontFamily": {
				"headline": ["Inter"],
				"body": ["Inter"],
				"label": ["Inter"]
		}
		},
	},
	}
<\/script>
<style>
	.material-symbols-outlined {
		font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
		vertical-align: middle;
		font-size: 1.25rem;
	}
	@media print {
		.no-print { display: none; }
		body { background: white; padding: 0; }
		.print-container { box-shadow: none; border: none; width: 100%; max-width: 100%; margin: 0; }
		.sticky { position: relative !important; }
		.page-break { page-break-before: always; }
	}
</style>
</head>
<body class="bg-white font-body text-on-surface antialiased">
<!-- Document Header -->
<div class="flex flex-col md:flex-row justify-between items-start border-b-2 border-primary/20 pb-8 mb-8 gap-6">
<div class="flex items-center gap-4">
<img alt="Oratio Clinic Logo" class="h-16 w-auto" src="${logo}"/>
<div>
<h1 class="text-2xl font-black text-secondary tracking-tight">Oratio Clinic</h1>
<p class="text-xs font-medium text-on-surface-variant uppercase tracking-widest">Medical Excellence &amp; Precision</p>
</div>
</div>
<div class="text-right">
<h2 class="text-lg font-bold text-primary">Patient Profile Report</h2>
<p class="text-sm font-semibold text-secondary bg-primary-container px-3 py-1 rounded-full inline-block mt-1">ID: ${patient.id}</p>
<p class="text-[10px] text-on-surface-variant mt-2 uppercase tracking-tighter">Confidential Patient Record</p>
</div>
</div>
<!-- Profile Bento Grid -->
<div class="grid grid-cols-1 md:grid-cols-12 gap-8">
<!-- Left Column: Core Identity & Bio -->
<div class="md:col-span-7 space-y-8">
<!-- Identity Section -->
<section>
<div class="flex items-center gap-2 mb-4 border-l-4 border-primary pl-3">
<span class="material-symbols-outlined text-primary" data-icon="fingerprint">fingerprint</span>
<h3 class="text-sm font-black text-secondary uppercase tracking-wider">Patient Identity</h3>
</div>
<div class="bg-surface-container-low rounded-xl p-5 grid grid-cols-2 gap-y-4 gap-x-6 border border-outline/50">
<div class="col-span-2">
<label class="text-[10px] font-bold text-on-surface-variant uppercase tracking-tighter block mb-1">Full Name</label>
<p class="text-sm font-semibold text-secondary">${fmt(patient.nama_lengkap)}</p>
</div>
<div>
<label class="text-[10px] font-bold text-on-surface-variant uppercase tracking-tighter block mb-1">NIK (Identity Card)</label>
<p class="text-sm font-medium">${fmt(patient.nik)}</p>
</div>
<div>
<label class="text-[10px] font-bold text-on-surface-variant uppercase tracking-tighter block mb-1">Family Card (KK)</label>
<p class="text-sm font-medium">${fmt(patient.nomor_kk)}</p>
</div>
<div>
<label class="text-[10px] font-bold text-on-surface-variant uppercase tracking-tighter block mb-1">Birthplace &amp; Date</label>
<p class="text-sm font-medium">${fmt(patient.birthplace)}, ${fmtDate(patient.birth_date)}</p>
</div>
<div>
<label class="text-[10px] font-bold text-on-surface-variant uppercase tracking-tighter block mb-1">Gender</label>
<p class="text-sm font-medium">${fmtGender(patient.gender)}</p>
</div>
</div>
</section>
<!-- Contact & Address Section -->
<section>
<div class="flex items-center gap-2 mb-4 border-l-4 border-primary pl-3">
<span class="material-symbols-outlined text-primary" data-icon="location_on">location_on</span>
<h3 class="text-sm font-black text-secondary uppercase tracking-wider">Contact &amp; Address</h3>
</div>
<div class="bg-surface-container-low rounded-xl p-5 space-y-4 border border-outline/50">
<div class="grid grid-cols-2 gap-4">
<div>
<label class="text-[10px] font-bold text-on-surface-variant uppercase tracking-tighter block mb-1">Handphone</label>
<p class="text-sm font-medium">${fmt(patient.handphone)}</p>
</div>
<div>
<label class="text-[10px] font-bold text-on-surface-variant uppercase tracking-tighter block mb-1">Email</label>
<p class="text-sm font-medium">${fmt(patient.email)}</p>
</div>
</div>
<div class="pt-3 border-t border-outline">
<label class="text-[10px] font-bold text-on-surface-variant uppercase tracking-tighter block mb-1">Full Residential Address</label>
<p class="text-sm font-medium leading-relaxed">${fmtAddress(patient)}</p>
</div>
</div>
</section>
<!-- Personal Info -->
<section>
<div class="flex items-center gap-2 mb-4 border-l-4 border-primary pl-3">
<span class="material-symbols-outlined text-primary" data-icon="badge">badge</span>
<h3 class="text-sm font-black text-secondary uppercase tracking-wider">Personal Demographics</h3>
</div>
<div class="bg-surface-container-low rounded-xl p-5 grid grid-cols-2 gap-4 border border-outline/50">
<div>
<label class="text-[10px] font-bold text-on-surface-variant uppercase tracking-tighter block mb-1">Marital Status</label>
<p class="text-sm font-medium">${fmtMarital(patient.marital_status)}</p>
</div>
<div>
<label class="text-[10px] font-bold text-on-surface-variant uppercase tracking-tighter block mb-1">Citizenship</label>
<p class="text-sm font-medium">${fmtCitizen(patient.citizenship)}</p>
</div>
</div>
</section>
</div>
<!-- Right Column: Medical Summary -->
<div class="md:col-span-5 space-y-8">
<!-- Medical Background -->
<section>
<div class="flex items-center gap-2 mb-4 border-l-4 border-primary pl-3">
<span class="material-symbols-outlined text-primary" data-icon="medical_services">medical_services</span>
<h3 class="text-sm font-black text-secondary uppercase tracking-wider">Clinical Vitals</h3>
</div>
<div class="bg-secondary text-white rounded-xl p-6 shadow-md">
<div class="grid grid-cols-2 gap-y-6">
<div>
<label class="text-[10px] font-bold text-primary-fixed-dim uppercase tracking-widest block mb-1">Blood Type</label>
<div class="flex items-baseline gap-1">
<span class="text-3xl font-black">${fmt(patient.blood_type, "-")}</span>
<span class="text-sm font-bold text-primary-fixed-dim">${fmtRhesus(patient.rhesus)}</span>
</div>
</div>
<div>
<label class="text-[10px] font-bold text-primary-fixed-dim uppercase tracking-widest block mb-1">Pregnancy</label>
<span class="text-xs font-bold bg-white/10 px-2 py-1 rounded">${fmtPregnancy(patient)}</span>
</div>
<div class="col-span-2 pt-4 border-t border-white/10">
<label class="text-[10px] font-bold text-primary-fixed-dim uppercase tracking-widest block mb-1">Latest Blood Pressure</label>
<div class="flex items-center gap-3">
<p class="text-2xl font-black">${fmt(patient.tekanan_darah, "-/-")}</p>
${bpStatus ? `<span class="text-[10px] font-bold ${bpStatus.bg} px-2 py-0.5 rounded-full ${bpStatus.text}">${bpStatus.label}</span>` : ""}
</div>
<p class="text-[10px] text-white/50 mt-1 italic">Recorded: ${fmtDate(patient.created_at)}</p>
</div>
</div>
</div>
</section>
<!-- Allergies Section -->
<section>
<div class="flex items-center gap-2 mb-4 border-l-4 border-error pl-3">
<span class="material-symbols-outlined text-error" data-icon="warning">warning</span>
<h3 class="text-sm font-black text-secondary uppercase tracking-wider">Allergies</h3>
</div>
<div class="bg-error-container text-on-error-container rounded-xl p-5 space-y-3 border border-error/20">
${allergiesHtml}
</div>
</section>
<!-- Security Verification -->
<div class="bg-surface-container rounded-xl p-6 flex flex-col items-center justify-center text-center border-2 border-dashed border-outline">
<div class="w-24 h-24 bg-white p-2 rounded-lg shadow-sm mb-4 flex items-center justify-center">
	<img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(origin)}" alt="QR Code" class="w-full h-full opacity-80" />
</div>
<p class="text-[10px] font-black text-secondary uppercase tracking-widest">Verify Record Authenticity</p>
<p class="text-[9px] text-on-surface-variant mt-1">Scan to access digital clinical vault</p>
</div>
</div>
</div>
<!-- Full Width: History and Medications -->
<div class="mt-12 space-y-10">
<!-- Medical History -->
<section>
<div class="flex items-center gap-2 mb-4 border-l-4 border-primary pl-3">
<span class="material-symbols-outlined text-primary" data-icon="history_edu">history_edu</span>
<h3 class="text-sm font-black text-secondary uppercase tracking-wider">Medical History (Chronic &amp; Hereditary)</h3>
</div>
<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
<div class="bg-surface-container-low rounded-xl p-5 border border-outline/50">
<h4 class="text-[11px] font-bold text-primary uppercase tracking-widest mb-3 flex items-center gap-2">
<span class="material-symbols-outlined text-xs" data-icon="person">person</span> Personal History
</h4>
${renderDiseases(personalDiseases)}
</div>
<div class="bg-surface-container-low rounded-xl p-5 border border-outline/50">
<h4 class="text-[11px] font-bold text-tertiary uppercase tracking-widest mb-3 flex items-center gap-2">
<span class="material-symbols-outlined text-xs" data-icon="family_history">family_history</span> Family History
</h4>
${renderDiseases(familyDiseases)}
</div>
</div>
</section>
<!-- Current Medications -->
<section>
<div class="flex items-center gap-2 mb-4 border-l-4 border-primary pl-3">
<span class="material-symbols-outlined text-primary" data-icon="pill">pill</span>
<h3 class="text-sm font-black text-secondary uppercase tracking-wider">Active Medications</h3>
</div>
<div class="overflow-x-auto">
<table class="w-full text-left border-collapse">
<thead>
<tr class="bg-surface-container-high border-b border-outline">
<th class="px-4 py-2 text-[10px] font-bold text-secondary uppercase">Medication Name</th>
<th class="px-4 py-2 text-[10px] font-bold text-secondary uppercase">Form</th>
<th class="px-4 py-2 text-[10px] font-bold text-secondary uppercase">Dosage</th>
<th class="px-4 py-2 text-[10px] font-bold text-secondary uppercase">Notes / Schedule</th>
</tr>
</thead>
<tbody class="text-sm">
${medicationsHtml}
</tbody>
</table>
</div>
</section>
</div>
<!-- Document Footer Signature Area -->
<div class="mt-16 pt-8 border-t border-outline grid grid-cols-2 gap-8 items-end page-break-inside-avoid">
<div class="space-y-4">
<div class="space-y-1">
<p class="text-[10px] font-bold text-on-surface-variant uppercase tracking-tighter">Generated On</p>
<p class="text-sm font-medium">${fmtNow()}</p>
</div>
<div class="space-y-1">
<p class="text-[10px] font-bold text-on-surface-variant uppercase tracking-tighter">System Reference</p>
<p class="text-xs font-mono text-secondary">${sysRef}</p>
</div>
</div>
<div class="text-center space-y-12">
<p class="text-[10px] font-bold text-on-surface-variant uppercase tracking-tighter">Authorized Clinic Administrator</p>
<div class="relative inline-block w-48 border-b border-secondary">
<!-- Digital Signature Placeholder -->
<span class="absolute -top-10 left-1/2 -translate-x-1/2 font-serif italic text-secondary opacity-40 text-xl pointer-events-none">Ref: KSR_772</span>
</div>
<p class="text-xs font-bold text-secondary uppercase tracking-widest">Oratio Clinic Registry</p>
</div>
</div>
</body></html>`;
  const browser = await puppeteer.launch({
    headless: "new",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu"
    ],
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || void 0
  });
  try {
    const page = await browser.newPage();
    await page.setContent(htmlBody, { waitUntil: "networkidle0", timeout: 3e4 });
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "20mm",
        bottom: "20mm",
        left: "10mm",
        right: "10mm"
      }
    });
    return pdfBuffer;
  } finally {
    await browser.close();
  }
}

export { generatePatientProfilePdf as g };
//# sourceMappingURL=pdfGenerator-98dfa17f.js.map
