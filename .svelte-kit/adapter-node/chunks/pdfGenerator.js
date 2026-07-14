import fs from "fs";
import path from "path";
import puppeteer from "puppeteer";
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
function calculateAge(birthDate) {
  if (!birthDate)
    return "-";
  const dob = new Date(birthDate);
  const diff_local = Date.now() - dob.getTime();
  if (isNaN(diff_local))
    return "-";
  const age_dt = new Date(diff_local);
  return Math.abs(age_dt.getUTCFullYear() - 1970);
}
const GENDER_MAP = { male: "Male", female: "Female", other: "Other", l: "Male", p: "Female" };
const CITIZEN_MAP = { WNI: "WNI (Indonesian)", WNA: "WNA (Foreign)" };
function fmtGender(g) {
  return g ? GENDER_MAP[g.toLowerCase()] || g : "-";
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
    return { label: "NORMAL", bg: "bg-emerald-100", text: "text-emerald-800" };
  if (sys < 130)
    return { label: "ELEVATED", bg: "bg-amber-100", text: "text-amber-800" };
  if (sys < 140)
    return { label: "HIGH", bg: "bg-orange-100", text: "text-orange-800" };
  return { label: "CRITICAL", bg: "bg-red-100", text: "text-red-800" };
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
  const sysRef = `ORATIO-CLINIC-PR-${patient.id}-${Date.now().toString(36).toUpperCase().slice(-5)}`;
  let alerts = [];
  if (allergies && allergies.length > 0) {
    alerts.push(`<div class="bg-red-50 text-red-900 px-4 py-3 rounded-lg border border-red-200 flex items-center gap-3">
			<span class="material-symbols-outlined text-red-600 shrink-0">warning</span>
			<div><span class="font-bold text-[10px] uppercase tracking-widest block text-red-600">Allergy Alert</span><span class="text-sm font-semibold">${allergies.length} recorded allergies</span></div>
		</div>`);
  }
  if (bpStatus && (bpStatus.label === "HIGH" || bpStatus.label === "CRITICAL")) {
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
  let flagsHtml = "";
  if (alerts.length > 0) {
    const gridCols = alerts.length === 1 ? "grid-cols-1" : alerts.length === 2 ? "grid-cols-2" : "grid-cols-3";
    flagsHtml = `
		<div class="mb-8 avoid-break">
			<h3 class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
				<span class="h-px bg-slate-200 flex-1"></span>
				Critical Clinical Highlights
				<span class="h-px bg-slate-200 flex-1"></span>
			</h3>
			<div class="grid ${gridCols} gap-4">
				${alerts.join("")}
			</div>
		</div>`;
  }
  let allergiesHtml = "";
  if (allergies.length > 0) {
    allergies.forEach((a, index) => {
      const border = index > 0 ? " border-t border-red-100 pt-3 mt-3" : "";
      allergiesHtml += `
			<div class="flex justify-between items-start ${border}">
				<div>
					<p class="text-[9px] font-bold text-red-400 uppercase tracking-widest">Substance</p>
					<p class="text-[12px] font-bold text-red-600 mt-0.5">${fmt(a.substance)}</p>
				</div>
				<div class="text-right">
					<p class="text-[9px] font-bold text-red-400 uppercase tracking-widest">Reaction</p>
					<p class="text-[10.5px] font-medium text-slate-700 mt-0.5">${fmt(a.reaction_display || a.reaction)}</p>
				</div>
			</div>`;
    });
  } else {
    allergiesHtml = `<p class="text-xs italic text-slate-500">No known allergies reported.</p>`;
  }
  const personalDiseases = diseases.filter((d) => d.type === "personal");
  const familyDiseases = diseases.filter((d) => d.type === "family");
  const renderDiseases = (items) => {
    if (items.length === 0)
      return `<p class="text-xs italic text-slate-500 px-1">No reported records</p>`;
    let html = '<ul class="space-y-3">';
    items.forEach((d) => {
      html += `
			<li class="flex justify-between items-start border-l-2 border-slate-300 pl-3">
				<div>
					<span class="block text-xs font-bold text-secondary">${fmt(d.disease || d.display)}</span>
					${d.description ? `<span class="block text-[10px] text-slate-500 mt-0.5">${d.description}</span>` : ""}
				</div>
				${d.code ? `<span class="text-[9px] font-mono text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200 shrink-0 mt-0.5 ml-2 shadow-sm">${d.code}</span>` : ""}
			</li>`;
    });
    html += "</ul>";
    return html;
  };
  let medicationsHtml = "";
  if (medications.length > 0) {
    medications.forEach((m, i) => {
      const bg = i % 2 !== 0 ? " bg-slate-50/50" : " bg-white";
      medicationsHtml += `
			<tr class="${bg}">
				<td class="px-5 py-3 font-semibold text-secondary">
					<div class="flex items-center gap-2">
						<span class="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block"></span>
						<span class="text-xs">${fmt(m.medication || m.product_name || m.display)}</span>
					</div>
				</td>
				<td class="px-5 py-3 text-xs text-slate-700">${fmt(m.dosage_form)}</td>
				<td class="px-5 py-3 text-xs font-bold text-slate-700">${fmt(m.dosage)}</td>
				<td class="px-5 py-3 text-[10px] text-slate-500 leading-relaxed">${fmt(m.note)}</td>
			</tr>`;
    });
  } else {
    medicationsHtml = `
		<tr class="bg-white">
			<td colspan="4" class="px-5 py-8 text-xs italic text-slate-500 text-center">No active medications currently reported by the patient.</td>
		</tr>`;
  }
  const htmlBody = `<!DOCTYPE html>
<html class="light" lang="en">
<head>
    <meta charset="utf-8"/>
    <meta content="width=device-width, initial-scale=1.0" name="viewport"/>
    <title>Patient Profile — ${fmt(patient.nama_lengkap)}</title>
    <script src="https://cdn.tailwindcss.com"><\/script>
    <link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=DM+Mono:wght@400;500&family=Lora:ital,wght@0,400;0,600;1,400&display=swap" rel="stylesheet"/>
    <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@300..500,0..1&display=swap" rel="stylesheet"/>
    <script id="tailwind-config">
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        ink:    "#0E1523",
                        slate:  "#1E2D40",
                        gold:   "#B08D57",
                        "gold-light": "#E8D5A8",
                        "gold-pale":  "#FAF5E9",
                        mist:   "#F4F6F9",
                        line:   "#E2E8F0",
                        danger: "#C0392B",
                        "danger-pale": "#FDF1F0",
                        safe:   "#1A6B4A",
                        "safe-pale":  "#F0F7F4",
                    },
                    fontFamily: {
                        head: ["Sora", "sans-serif"],
                        body: ["Sora", "sans-serif"],
                        mono: ['"DM Mono"', "monospace"],
                        serif: ["Lora", "serif"],
                    }
                }
            }
        }
    <\/script>
    <style>
        * { -webkit-font-smoothing: antialiased; }
        body { font-family: 'Sora', sans-serif; }
        .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20;
            vertical-align: middle;
            font-size:1rem;
            line-height: 1;
        }
        .mono { font-family: 'DM Mono', monospace; letter-spacing: -0.01em; }
        .field-label {
            font-size:7.5px;
            font-weight: 600;
            letter-spacing: 0.12em;
            text-transform: uppercase;
            color: #94A3B8;
            margin-bottom: 4px;
            display: block;
        }
        .field-value {
            font-size:11px;
            font-weight: 600;
            color: #0E1523;
            line-height: 1.4;
        }
        .section-eyebrow {
            font-size:7px;
            font-weight: 700;
            letter-spacing: 0.18em;
            text-transform: uppercase;
        }
        .divider-gold {
            height: 1px;
            background: linear-gradient(90deg, #B08D57 0%, #E8D5A8 50%, transparent 100%);
        }
        /* Header pattern overlay */
        .header-pattern {
            background-image: 
                radial-gradient(circle at 20% 50%, rgba(176,141,87,0.08) 0%, transparent 50%),
                radial-gradient(circle at 80% 20%, rgba(255,255,255,0.03) 0%, transparent 40%);
        }
        /* Accent bar left of cards */
        .accent-blue  { border-left: 3px solid #2563EB; }
        .accent-gold  { border-left: 3px solid #B08D57; }
        .accent-red   { border-left: 3px solid #C0392B; }
        .accent-teal  { border-left: 3px solid #0F766E; }
 
        /* Allergy severity chips */
        .chip-severe  { background:#FDE8E7; color:#9B1B1B; border:1px solid #F5B7B1; }
        .chip-moderate{ background:#FEF3E2; color:#7D4E00; border:1px solid #FADA9A; }
        .chip-mild    { background:#EBF5EC; color:#1A6B4A; border:1px solid #A3D9A5; }
 
        /* BP status */
        .bp-normal    { background:#EBF5EC; color:#1A6B4A; }
        .bp-elevated  { background:#FEF3E2; color:#7D4E00; }
        .bp-high      { background:#FDE8E7; color:#9B1B1B; }
 
        /* Medication row hover */
        .med-row:nth-child(even) { background: #FAFBFC; }
        .med-row td { padding: 11px 16px; font-size:10.1px; vertical-align: top; }
 
        /* Disease tag */
        .disease-tag {
            display: inline-flex; align-items: center; gap: 5px;
            background: #F1F5F9; border: 1px solid #E2E8F0;
            border-radius: 6px; padding: 5px 10px;
            font-size:9.7px; font-weight: 500; color: #334155;
            margin: 3px;
        }
        .disease-tag .dot {
            width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0;
        }
 
        /* Watermark text */
        .watermark {
            font-family: 'Lora', serif;
            font-style: italic;
            color: #0E1523;
            opacity: 0.04;
            font-size:52.8px;
            font-weight: 400;
            pointer-events: none;
            user-select: none;
            white-space: nowrap;
        }
 
        /* Flag / alert bar */
        .alert-bar {
            border-left: 4px solid;
            border-radius: 0 8px 8px 0;
            padding: 10px 14px;
            display: flex; align-items: flex-start; gap: 10px;
        }
        .alert-critical { border-color: #C0392B; background: #FDF1F0; }
        .alert-warning  { border-color: #D97706; background: #FFFBF2; }
        .alert-info     { border-color: #2563EB; background: #EFF6FF; }
 
        @media print {
            body { background: white !important; margin: 0; padding: 0;
                   -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .no-print { display: none !important; }
            .avoid-break { page-break-inside: avoid; }
            .page-break { page-break-before: always; }
        }
    </style>
</head>
<body class="bg-white font-body text-ink antialiased">
 
    <!-- ═══ HEADER ══════════════════════════════════════════════════════ -->
    <div class="avoid-break" style="background: linear-gradient(135deg, #0E1523 0%, #1A2740 55%, #162030 100%); margin-bottom: 0;">
        <div class="header-pattern px-10 py-7 flex justify-between items-stretch gap-8">
            
            <!-- Left: Logo + Patient Identity -->
            <div class="flex items-center gap-6">
                <!-- Logo block -->
                <div style="background:rgba(255,255,255,0.07); border:1px solid rgba(255,255,255,0.12); border-radius:14px; padding:10px; width:68px; height:68px; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
                    <img alt="Logo" style="max-width:100%; max-height:100%; object-fit:contain;" src="${logo}"/>
                </div>
 
                <!-- Gold divider -->
                <div style="width:1px; height:52px; background:linear-gradient(180deg, transparent, #B08D57 40%, #B08D57 60%, transparent); flex-shrink:0;"></div>
 
                <!-- Patient name + meta -->
                <div>
                    <div style="display:flex; align-items:center; gap:10px; margin-bottom:6px;">
                        <h1 style="font-family:'Sora',sans-serif; font-size:19.4px; font-weight:800; color:#FFFFFF; letter-spacing:-0.03em; line-height:1;">${fmt(patient.nama_lengkap)}</h1>
                        <span style="background:rgba(176,141,87,0.25); border:1px solid rgba(176,141,87,0.4); color:#E8D5A8; font-size:7.9px; font-weight:700; letter-spacing:0.12em; padding:3px 8px; border-radius:20px; text-transform:uppercase;">${calculateAge(patient.birth_date)} yrs</span>
                        <span style="background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.15); color:rgba(255,255,255,0.7); font-size:7.9px; font-weight:600; letter-spacing:0.1em; padding:3px 8px; border-radius:20px; text-transform:uppercase;">${fmtGender(patient.gender)}</span>
                    </div>
                    <div style="display:flex; align-items:center; gap:16px;">
                        <span style="font-family:'DM Mono',monospace; font-size:9.2px; color:rgba(255,255,255,0.45); letter-spacing:0.05em;">
                            <span style="color:#B08D57; margin-right:4px;">ID</span>${patient.id}
                        </span>
                        <span style="color:rgba(255,255,255,0.2);">·</span>
                        <span style="font-family:'DM Mono',monospace; font-size:9.2px; color:rgba(255,255,255,0.45); letter-spacing:0.05em;">
                            <span style="color:#B08D57; margin-right:4px;">REG</span>${fmtDate(patient.created_at)}
                        </span>
                    </div>
                </div>
            </div>
 
            <!-- Right: Document label + system ref -->
            <div style="text-align:right; display:flex; flex-direction:column; justify-content:space-between; padding:4px 0;">
                <div>
                    <div style="font-family:'Lora',serif; font-style:italic; font-size:15.8px; color:#E8D5A8; font-weight:400; letter-spacing:0.01em; line-height:1; margin-bottom:6px;">Patient Profile</div>
                    <div style="font-family:'DM Mono',monospace; font-size:7.9px; color:rgba(255,255,255,0.3); letter-spacing:0.15em; text-transform:uppercase;">${sysRef}</div>
                </div>
                <div style="display:flex; align-items:center; justify-content:flex-end; gap:5px;">
                    <span class="material-symbols-outlined" style="color:#B08D57; font-size:11.4px;">calendar_today</span>
                    <span style="font-size:8.8px; color:rgba(255,255,255,0.4); font-weight:500;">${fmtDate(patient.created_at)}</span>
                </div>
            </div>
        </div>
 
        <!-- Gold rule under header -->
        <div style="height:2px; background:linear-gradient(90deg, #B08D57 0%, #E8D5A8 30%, #B08D57 60%, transparent 100%);"></div>
    </div>
 
    <!-- ═══ MAIN CONTENT ════════════════════════════════════════════════ -->
    <div class="px-10 pt-7 space-y-7 pb-12" style="position:relative;">
 
        <!-- Watermark -->
        <div class="watermark" style="position:absolute; top:60px; right:30px; transform:rotate(-12deg); z-index:0; pointer-events:none;">
            ${sysRef}
        </div>
 
        <!-- Alert Flags -->
        ${flagsHtml}
 
        <!-- ── Section 1: 2-Column Layout ─────────────────────── -->
        <div class="grid gap-6 avoid-break" style="grid-template-columns: 1fr 1fr 0.85fr; position:relative; z-index:1;">
 
            <!-- Col 1: Identity -->
            <div class="space-y-0">
                <div style="display:flex; align-items:center; gap:8px; margin-bottom:12px;">
                    <span class="material-symbols-outlined" style="color:#B08D57; font-size:14.1px;">fingerprint</span>
                    <span class="section-eyebrow" style="color:#94A3B8;">Identity & Registration</span>
                </div>
                <div style="border:1px solid #E2E8F0; border-radius:10px; overflow:hidden; background:#FAFBFD;">
                    <!-- Header row -->
                    <div style="background:#F4F6F9; border-bottom:1px solid #E2E8F0; padding:8px 14px 7px;">
                        <span class="field-label" style="margin:0; color:#B08D57;">Full Legal Name</span>
                        <div style="font-size:12.3px; font-weight:700; color:#0E1523; letter-spacing:-0.02em; margin-top:2px;">${fmt(patient.nama_lengkap)}</div>
                    </div>
                    <!-- Grid fields -->
                    <div style="display:grid; grid-template-columns:1fr 1fr; padding:14px; gap:14px 12px;">
                        <div style="grid-column:1/-1;">
                            <span class="field-label">Family Card (KK)</span>
                            <div class="field-value mono">${fmt(patient.nomor_kk)}</div>
                        </div>
                        <div style="grid-column:1/-1;">
                            <span class="field-label">Place & Date of Birth</span>
                            <div class="field-value">${fmt(patient.birthplace)}, ${fmtDate(patient.birth_date)}</div>
                        </div>
                        <div>
                            <span class="field-label">Citizenship</span>
                            <div class="field-value">${fmtCitizen(patient.citizenship)}</div>
                        </div>
                        <div>
                            <span class="field-label">Gender</span>
                            <div class="field-value">${fmtGender(patient.gender)}</div>
                        </div>
                    </div>
                </div>
            </div>
 
            <!-- Col 2: Contact & Address -->
            <div>
                <div style="display:flex; align-items:center; gap:8px; margin-bottom:12px;">
                    <span class="material-symbols-outlined" style="color:#0F766E; font-size:14.1px;">location_on</span>
                    <span class="section-eyebrow" style="color:#94A3B8;">Contact & Residence</span>
                </div>
                <div style="border:1px solid #E2E8F0; border-radius:10px; overflow:hidden; background:#FAFBFD;">
                    <div style="display:grid; grid-template-columns:1fr 1fr; padding:14px; gap:14px 12px; border-bottom:1px solid #E2E8F0;">
                        <div>
                            <span class="field-label">Mobile Phone</span>
                            <div class="field-value mono">${fmt(patient.handphone)}</div>
                        </div>
                        <div>
                            <span class="field-label">Email Address</span>
                            <div class="field-value" style="font-size:9.7px; word-break:break-all;">${fmt(patient.email)}</div>
                        </div>
                    </div>
                    <div style="padding:14px;">
                        <span class="field-label">Residential Address</span>
                        <div style="font-size:10.6px; font-weight:500; color:#334155; line-height:1.6; margin-top:2px;">${fmtAddress(patient)}</div>
                    </div>
                </div>
            </div>
 
            <!-- Col 3: Clinical Snapshot -->
            <div>
                <div style="display:flex; align-items:center; gap:8px; margin-bottom:12px;">
                    <span class="material-symbols-outlined" style="color:#2563EB; font-size:14.1px;">vital_signs</span>
                    <span class="section-eyebrow" style="color:#94A3B8;">Clinical Snapshot</span>
                </div>
                <div style="border:1px solid #E2E8F0; border-radius:10px; overflow:hidden; background:#FAFBFD; height:calc(100% - 32px);">
                    
                    <!-- Blood Group + Pregnancy -->
                    <div style="display:grid; grid-template-columns:1fr 1fr; border-bottom:1px solid #E2E8F0;">
                        <div style="padding:12px; text-align:center; border-right:1px solid #E2E8F0;">
                            <span class="field-label" style="color:#1E40AF;">Blood Group</span>
                            <div style="margin-top:4px; display:flex; align-items:baseline; justify-content:center; gap:1px;">
                                <span style="font-size:19.4px; font-weight:800; color:#0E1523; letter-spacing:-0.02em;">${fmt(patient.blood_type, "—")}</span>
                                <span style="font-size:11.4px; font-weight:700; color:#2563EB; margin-bottom:1px;">${fmtRhesus(patient.rhesus)}</span>
                            </div>
                        </div>
                        <div style="padding:12px; text-align:center;">
                            <span class="field-label" style="color:#7C3AED;">Pregnancy</span>
                            <div style="font-size:10.1px; font-weight:600; color:#0E1523; margin-top:6px; line-height:1.3;">${fmtPregnancy(patient)}</div>
                        </div>
                    </div>
 
                    <!-- Blood Pressure -->
                    <div style="padding:12px; text-align:center; border-bottom:1px solid #E2E8F0;">
                        <span class="field-label">Blood Pressure</span>
                        <div style="display:flex; align-items:baseline; justify-content:center; gap:4px; margin-top:4px;">
                            <span style="font-family:'DM Mono',monospace; font-size:17.6px; font-weight:500; color:#0E1523; letter-spacing:-0.02em;">${fmt(patient.tekanan_darah, "—/—")}</span>
                            <span style="font-size:7.9px; font-weight:600; color:#94A3B8; letter-spacing:0.05em; text-transform:uppercase; margin-bottom:2px;">mmHg</span>
                        </div>
                        ${bpStatus ? `<div style="margin-top:6px;"><span style="font-size:7.9px; font-weight:700; letter-spacing:0.1em; text-transform:uppercase; padding:3px 10px; border-radius:20px;" class="${bpStatus.bg} ${bpStatus.text}">${bpStatus.label}</span></div>` : ""}
                    </div>
 
                    <!-- Admitted / Status -->
                    <div style="padding:10px 12px; background:#F8FAFC;">
                        <span class="field-label" style="margin-bottom:3px;">Registration Date</span>
                        <div style="font-size:9.7px; font-weight:600; color:#475569;">${fmtDate(patient.created_at)}</div>
                    </div>
                </div>
            </div>
        </div>
 
        <!-- ── Gold Rule ──────────────────────────────────────── -->
        <div class="divider-gold avoid-break" style="position:relative; z-index:1;"></div>
 
        <!-- ── Section 2: Allergies ───────────────────────────── -->
        <div class="avoid-break" style="position:relative; z-index:1;">
            <div style="display:flex; align-items:center; gap:8px; margin-bottom:12px;">
                <span class="material-symbols-outlined" style="color:#C0392B; font-size:14.1px;">vaccines</span>
                <span class="section-eyebrow" style="color:#94A3B8;">Drug & Substance Allergy Alerts</span>
                ${allergies.length > 0 ? `<span style="background:#FDE8E7; color:#9B1B1B; font-size:7px; font-weight:700; letter-spacing:0.12em; padding:3px 8px; border-radius:20px; text-transform:uppercase; border:1px solid #F5B7B1;">${allergies.length} ALERT${allergies.length > 1 ? "S" : ""}</span>` : ""}
            </div>
            <div style="border:1px solid #E2E8F0; border-radius:10px; overflow:hidden; background:#FAFBFD;">
                <div style="padding:14px;">
                    ${allergiesHtml}
                </div>
            </div>
        </div>
 
        <!-- ── Gold Rule ──────────────────────────────────────── -->
        <div class="divider-gold avoid-break" style="position:relative; z-index:1;"></div>
 
        <!-- ── Section 3: Medical History ────────────────────── -->
        <div class="avoid-break space-y-4" style="position:relative; z-index:1;">
            <div style="display:flex; align-items:center; gap:8px; margin-bottom:12px;">
                <span class="material-symbols-outlined" style="color:#7C3AED; font-size:14.1px;">history_edu</span>
                <span class="section-eyebrow" style="color:#94A3B8;">Medical Background History</span>
            </div>
 
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px;">
                <!-- Personal -->
                <div style="border:1px solid #E2E8F0; border-radius:10px; overflow:hidden; background:#FAFBFD;">
                    <div style="background:#EFF6FF; border-bottom:1px solid #BFDBFE; padding:9px 14px; display:flex; align-items:center; gap:6px;">
                        <span class="material-symbols-outlined" style="color:#1D4ED8; font-size:12.3px;">person</span>
                        <span class="section-eyebrow" style="color:#1D4ED8;">Personal Illnesses</span>
                    </div>
                    <div style="padding:14px;">
                        ${renderDiseases(personalDiseases)}
                    </div>
                </div>
                <!-- Family -->
                <div style="border:1px solid #E2E8F0; border-radius:10px; overflow:hidden; background:#FAFBFD;">
                    <div style="background:#F0FDFA; border-bottom:1px solid #99F6E4; padding:9px 14px; display:flex; align-items:center; gap:6px;">
                        <span class="material-symbols-outlined" style="color:#0F766E; font-size:12.3px;">family_history</span>
                        <span class="section-eyebrow" style="color:#0F766E;">Hereditary & Family</span>
                    </div>
                    <div style="padding:14px;">
                        ${renderDiseases(familyDiseases)}
                    </div>
                </div>
            </div>
        </div>
 
        <!-- ── Gold Rule ──────────────────────────────────────── -->
        <div class="divider-gold avoid-break" style="position:relative; z-index:1;"></div>
 
        <!-- ── Section 4: Medications ─────────────────────────── -->
        <div class="avoid-break space-y-4" style="position:relative; z-index:1;">
            <div style="display:flex; align-items:center; gap:8px; margin-bottom:12px;">
                <span class="material-symbols-outlined" style="color:#0F766E; font-size:14.1px;">medication</span>
                <span class="section-eyebrow" style="color:#94A3B8;">Current Routine Medications</span>
            </div>
 
            <div style="border:1px solid #E2E8F0; border-radius:10px; overflow:hidden; box-shadow:0 1px 4px rgba(14,21,35,0.04);">
                <table style="width:100%; border-collapse:collapse; font-family:'Sora',sans-serif;">
                    <thead>
                        <tr style="background:#F4F6F9; border-bottom:1px solid #E2E8F0;">
                            <th style="padding:10px 16px; font-size:7px; font-weight:700; letter-spacing:0.14em; text-transform:uppercase; color:#94A3B8; text-align:left; width:38%;">Medication Name</th>
                            <th style="padding:10px 16px; font-size:7px; font-weight:700; letter-spacing:0.14em; text-transform:uppercase; color:#94A3B8; text-align:left; width:18%;">Form</th>
                            <th style="padding:10px 16px; font-size:7px; font-weight:700; letter-spacing:0.14em; text-transform:uppercase; color:#94A3B8; text-align:left; width:14%;">Dose</th>
                            <th style="padding:10px 16px; font-size:7px; font-weight:700; letter-spacing:0.14em; text-transform:uppercase; color:#94A3B8; text-align:left; width:30%;">Instructions</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100">
                        ${medicationsHtml}
                    </tbody>
                </table>
            </div>
        </div>
 
        <!-- ── Footer ─────────────────────────────────────────── -->
        <div class="avoid-break" style="margin-top:48px; padding-top:24px; border-top:1.5px solid #E2E8F0; position:relative; z-index:1;">
            <div style="display:grid; grid-template-columns:1fr auto 1fr; gap:24px; align-items:end;">
 
                <!-- QR + Verification -->
                <div style="display:flex; align-items:flex-end; gap:14px;">
                    <div style="border:1px solid #E2E8F0; border-radius:8px; padding:5px; background:#FFF; flex-shrink:0;">
                        <img src="https://api.qrserver.com/v1/create-qr-code/?size=72x72&margin=0&data=${encodeURIComponent(origin)}" alt="QR Code" style="width:72px; height:72px; display:block; opacity:0.85;"/>
                    </div>
                    <div>
                        <div style="font-size:7.5px; font-weight:700; letter-spacing:0.14em; text-transform:uppercase; color:#B08D57; margin-bottom:4px;">Scan to Verify</div>
                        <div style="font-size:8.4px; color:#94A3B8; line-height:1.5; max-width:160px;">Digital access code for clinical vault verification &amp; record tracking.</div>
                    </div>
                </div>
 
                <!-- Center: Generated timestamp -->
                <div style="text-align:center; padding:0 24px;">
                    <div style="width:48px; height:1px; background:linear-gradient(90deg,transparent,#B08D57); margin:0 auto 10px;"></div>
                    <div style="font-size:7px; font-weight:700; letter-spacing:0.14em; text-transform:uppercase; color:#CBD5E1; margin-bottom:5px;">Generated On</div>
                    <div style="font-family:'DM Mono',monospace; font-size:9.2px; font-weight:500; color:#475569;">${fmtNow()}</div>
                    <div style="width:48px; height:1px; background:linear-gradient(90deg,#B08D57,transparent); margin:10px auto 0;"></div>
                </div>
 
                <!-- Right: Signature -->
                <div style="text-align:right;">
                    <div style="display:inline-block; min-width:180px;">
                        <!-- Signature flourish -->
                        <div style="font-family:'Lora',serif; font-style:italic; font-size:22.9px; font-weight:400; color:#B08D57; opacity:0.18; line-height:1; margin-bottom:4px; text-align:right; letter-spacing:0.02em;">Oratio e-Sys</div>
                        <div style="border-bottom:1.5px solid #CBD5E1; margin-bottom:8px;"></div>
                        <div style="font-size:7.5px; font-weight:700; letter-spacing:0.14em; text-transform:uppercase; color:#94A3B8; text-align:right;">Chief Administrator</div>
                        <div style="font-size:7px; font-weight:600; letter-spacing:0.1em; text-transform:uppercase; color:#CBD5E1; margin-top:2px; text-align:right;">Authorized Validated Profile</div>
                    </div>
                </div>
 
            </div>
 
            <!-- Bottom rule -->
            <div style="margin-top:20px; height:3px; background:linear-gradient(90deg, #0E1523 0%, #1A2740 50%, #0E1523 100%); border-radius:2px;"></div>
            <div style="margin-top:6px; display:flex; justify-content:space-between; align-items:center;">
                <div style="font-family:'DM Mono',monospace; font-size:7px; color:#CBD5E1; letter-spacing:0.08em;">${sysRef}</div>
                <div style="font-size:7px; color:#CBD5E1; font-weight:500;">CONFIDENTIAL — For authorized medical personnel only</div>
                <div style="font-family:'DM Mono',monospace; font-size:7px; color:#CBD5E1; letter-spacing:0.08em;">ID: ${patient.id}</div>
            </div>
        </div>
 
    </div>
</body>
</html>`;
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
        top: "10mm",
        bottom: "10mm",
        left: "8mm",
        right: "8mm"
      }
    });
    return pdfBuffer;
  } finally {
    await browser.close();
  }
}
async function generateSoapFormPdf(data) {
  const { encounter, patient, doctor, prescriptions = [], referrals = [], items = [], origin, rxText } = data;
  const logo = getLogoBase64();
  const sysRef = `ORATIO-CLINIC-ENC-${encounter.id}`;
  let rxHtml = "";
  if (prescriptions.length > 0) {
    prescriptions.forEach((r, i) => {
      const bg = i % 2 !== 0 ? " bg-slate-50/50" : " bg-white";
      rxHtml += `
            <tr class="${bg}">
                <td class="px-5 py-3 font-semibold text-secondary">
                    <div class="flex items-center gap-2">
                        <span class="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block"></span>
                        <span class="text-xs">${fmt(r.product_name)}</span>
                    </div>
                </td>
                <td class="px-5 py-3 text-xs text-center text-slate-700">${fmt(r.dosage_form)}</td>
                <td class="px-5 py-3 text-xs text-center font-bold text-slate-700">${r.quantity || 1}</td>
                <td class="px-5 py-3 text-[10px] text-slate-500 leading-relaxed">${fmt(r.dosage)} - ${fmt(r.instruction)}</td>
            </tr>`;
    });
  } else if (rxText) {
    rxHtml = `
        <tr class="bg-white">
            <td colspan="4" class="px-5 py-6 text-xs text-slate-600 whitespace-pre-wrap">${fmt(rxText)}</td>
        </tr>`;
  } else {
    rxHtml = `
        <tr class="bg-white">
            <td colspan="4" class="px-5 py-6 text-xs italic text-slate-500 text-center">No prescriptions recorded.</td>
        </tr>`;
  }
  let itemsHtml = "";
  if (items.length > 0) {
    items.forEach((it, i) => {
      const bg = i % 2 !== 0 ? " bg-slate-50/50" : " bg-white";
      itemsHtml += `
            <tr class="${bg}">
                <td class="px-5 py-3 text-xs text-secondary font-medium">${fmt(it.item_name || it.item && it.item.name)}</td>
                <td class="px-5 py-3 text-xs text-center text-slate-700 font-bold">${it.quantity || 1}</td>
            </tr>`;
    });
  }
  let referralsHtml = "";
  if (referrals.length > 0) {
    referrals.forEach((ref, i) => {
      const border = i > 0 ? " border-t border-slate-100" : "";
      referralsHtml += `
            <div class="py-3 ${border} flex justify-between items-start gap-4">
                <div>
                    <span class="text-[10px] font-bold text-slate-700 block mb-1">${fmt(ref.doctor_name || ref.doctor_code)}</span>
                    <span class="text-[9px] text-slate-500">${fmt(ref.note)}</span>
                </div>
                <div class="text-[9px] font-mono whitespace-nowrap text-right shrink-0 mt-0.5">
                    ${fmtDate(ref.referral_date)}
                </div>
            </div>`;
    });
  }
  const renderSoapSection = (title, content, icon) => {
    if (!content)
      return "";
    return `
        <div class="mb-5 avoid-break">
            <div class="flex items-center gap-2 mb-2 pb-1 border-b border-slate-100">
                <span class="material-symbols-outlined text-[#B08D57] text-[16px]">${icon}</span>
                <span class="text-[10px] font-bold text-slate-700 uppercase tracking-widest">${title}</span>
            </div>
            <div class="text-[11px] leading-relaxed text-slate-800 whitespace-pre-wrap">${content}</div>
        </div>`;
  };
  const htmlBody = `<!DOCTYPE html>
<html class="light" lang="en">
<head>
    <meta charset="utf-8"/>
    <meta content="width=device-width, initial-scale=1.0" name="viewport"/>
    <title>Encounter Record — ${fmt(encounter.id)}</title>
    <script src="https://cdn.tailwindcss.com"><\/script>
    <link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=DM+Mono:wght@400;500&family=Lora:ital,wght@0,400;0,600;1,400&display=swap" rel="stylesheet"/>
    <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@300..500,0..1&display=swap" rel="stylesheet"/>
    <script id="tailwind-config">
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        ink:    "#0E1523",
                        slate:  "#1E2D40",
                        gold:   "#B08D57",
                        "gold-light": "#E8D5A8"
                    },
                    fontFamily: {
                        head: ["Sora", "sans-serif"],
                        body: ["Sora", "sans-serif"],
                        mono: ['"DM Mono"', "monospace"],
                        serif: ["Lora", "serif"],
                    }
                }
            }
        }
    <\/script>
    <style>
        * { -webkit-font-smoothing: antialiased; }
        body { font-family: 'Sora', sans-serif; }
        .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20;
            vertical-align: middle;
            font-size:1rem;
            line-height: 1;
        }
        .mono { font-family: 'DM Mono', monospace; letter-spacing: -0.01em; }
        .field-label {
            font-size:7.5px;
            font-weight: 600;
            letter-spacing: 0.12em;
            text-transform: uppercase;
            color: #94A3B8;
            margin-bottom: 4px;
            display: block;
        }
        .field-value {
            font-size:11px;
            font-weight: 600;
            color: #0E1523;
            line-height: 1.4;
        }
        .divider-gold {
            height: 1px;
            background: linear-gradient(90deg, #B08D57 0%, #E8D5A8 50%, transparent 100%);
        }
        .header-pattern {
            background-image: 
                radial-gradient(circle at 20% 50%, rgba(176,141,87,0.08) 0%, transparent 50%),
                radial-gradient(circle at 80% 20%, rgba(255,255,255,0.03) 0%, transparent 40%);
        }
        .watermark {
            font-family: 'Lora', serif;
            font-style: italic;
            color: #0E1523;
            opacity: 0.03;
            font-size:42px;
            font-weight: 400;
            pointer-events: none;
            user-select: none;
            white-space: nowrap;
        }
        @media print {
            body { background: white !important; margin: 0; padding: 0;
                   -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .no-print { display: none !important; }
            .avoid-break { page-break-inside: avoid; }
        }
    </style>
</head>
<body class="bg-white font-body text-ink antialiased">
    <!-- Header -->
    <div class="avoid-break" style="background: linear-gradient(135deg, #0E1523 0%, #1A2740 55%, #162030 100%); margin-bottom: 0;">
        <div class="header-pattern px-10 py-7 flex justify-between items-stretch gap-8">
            <div class="flex items-center gap-6">
                <div style="background:rgba(255,255,255,0.07); border:1px solid rgba(255,255,255,0.12); border-radius:14px; padding:10px; width:68px; height:68px; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
                    <img alt="Logo" style="max-width:100%; max-height:100%; object-fit:contain;" src="${logo}"/>
                </div>
                <div style="width:1px; height:52px; background:linear-gradient(180deg, transparent, #B08D57 40%, #B08D57 60%, transparent); flex-shrink:0;"></div>
                <div>
                    <div style="display:flex; align-items:center; gap:10px; margin-bottom:6px;">
                        <h1 style="font-family:'Sora',sans-serif; font-size:19.4px; font-weight:800; color:#FFFFFF; letter-spacing:-0.03em; line-height:1;">Clinical Encounter Record</h1>
                    </div>
                    <div style="display:flex; align-items:center; gap:16px;">
                        <span style="font-family:'DM Mono',monospace; font-size:9.2px; color:rgba(255,255,255,0.45); letter-spacing:0.05em;">
                            <span style="color:#B08D57; margin-right:4px;">ID</span>${encounter.id}
                        </span>
                        <span style="color:rgba(255,255,255,0.2);">·</span>
                        <span style="font-family:'DM Mono',monospace; font-size:9.2px; color:rgba(255,255,255,0.45); letter-spacing:0.05em;">
                            <span style="color:#B08D57; margin-right:4px;">TYPE</span>${fmt(encounter.form_mode)}
                        </span>
                    </div>
                </div>
            </div>
            <div style="text-align:right; display:flex; flex-direction:column; justify-content:space-between; padding:4px 0;">
                <div>
                    <div style="font-family:'Lora',serif; font-style:italic; font-size:15.8px; color:#E8D5A8; font-weight:400; letter-spacing:0.01em; line-height:1; margin-bottom:6px;">Encounter Date</div>
                    <div style="font-family:'DM Mono',monospace; font-size:10px; color:rgba(255,255,255,0.8);">${fmtDate(encounter.created_at)}</div>
                </div>
            </div>
        </div>
        <div style="height:2px; background:linear-gradient(90deg, #B08D57 0%, #E8D5A8 30%, #B08D57 60%, transparent 100%);"></div>
    </div>

    <!-- MAIN CONTENT -->
    <div class="px-10 pt-7 space-y-7 pb-12" style="position:relative;">
        <div class="watermark" style="position:absolute; top:60px; right:30px; transform:rotate(-12deg); z-index:0;">${encounter.id}</div>

        <!-- Identity Bar -->
        <div class="grid grid-cols-2 gap-6 avoid-break" style="position:relative; z-index:1;">
            <div style="border:1px solid #E2E8F0; border-radius:10px; padding:14px; background:#FAFBFD;">
                <span class="field-label flex justify-between">Patient <span class="material-symbols-outlined text-[12px] text-slate-300">person</span></span>
                <div class="field-value">${fmt(patient.nama_lengkap)}</div>
                <div class="mono text-[9px] text-slate-500 mt-1">${fmt(patient.id)} | ${fmtGender(patient.gender)} | ${calculateAge(patient.birth_date)} yrs</div>
            </div>
            <div style="border:1px solid #E2E8F0; border-radius:10px; padding:14px; background:#FAFBFD;">
                <span class="field-label flex justify-between">Attending Doctor <span class="material-symbols-outlined text-[12px] text-slate-300">stethoscope</span></span>
                <div class="field-value">${fmt(doctor.name)}</div>
                <div class="mono text-[9px] text-slate-500 mt-1">${fmt(doctor.doctor_code)}</div>
            </div>
        </div>

        <div class="divider-gold avoid-break" style="position:relative; z-index:1;"></div>

        <!-- SOAP Notes -->
        <div class="avoid-break space-y-2" style="position:relative; z-index:1;">
            ${renderSoapSection("Subjective", encounter.subjective, "person_search")}
            ${renderSoapSection("Objective", encounter.objective, "monitor_heart")}
            ${renderSoapSection("Assessment", encounter.assessment, "medical_information")}
            ${renderSoapSection("Plan", encounter.plan, "assignment")}
            ${renderSoapSection("Keterangan Tambahan", encounter.keterangan, "note_alt")}
        </div>

        <!-- Procedures/Items & Referrals Grid -->
        ${itemsHtml || referralsHtml ? `
        <div class="grid grid-cols-2 gap-6 avoid-break pt-4" style="position:relative; z-index:1;">
            <!-- Actions / Items -->
            ${itemsHtml ? `
            <div style="border:1px solid #E2E8F0; border-radius:10px; overflow:hidden;">
                <div style="background:#F4F6F9; border-bottom:1px solid #E2E8F0; padding:10px 14px; display:flex; align-items:center; gap:6px;">
                    <span class="material-symbols-outlined text-slate-500 text-[14px]">medical_services</span>
                    <span class="field-label" style="margin:0;">Procedures / Items</span>
                </div>
                <table class="w-full">
                    ${itemsHtml}
                </table>
            </div>` : "<div></div>"}

            <!-- Referrals -->
            ${referralsHtml ? `
            <div style="border:1px solid #E2E8F0; border-radius:10px; overflow:hidden;">
                <div style="background:#F0FDF4; border-bottom:1px solid #BBF7D0; padding:10px 14px; display:flex; align-items:center; gap:6px;">
                    <span class="material-symbols-outlined text-emerald-600 text-[14px]">share</span>
                    <span class="field-label" style="margin:0; color:#059669;">Referrals</span>
                </div>
                <div class="px-4">
                    ${referralsHtml}
                </div>
            </div>` : "<div></div>"}
        </div>
        ` : ""}

        <!-- Prescriptions -->
        <div class="avoid-break mt-6" style="position:relative; z-index:1;">
            <div style="border:1px solid #E2E8F0; border-radius:10px; overflow:hidden; box-shadow:0 1px 4px rgba(14,21,35,0.04);">
                <div style="background:#EFF6FF; border-bottom:1px solid #BFDBFE; padding:10px 16px; display:flex; align-items:center; gap:6px;">
                    <span class="material-symbols-outlined text-blue-600 text-[14px]">medication</span>
                    <span class="field-label" style="margin:0; color:#2563EB;">Prescriptions / Resep Diberikan</span>
                </div>
                <table style="width:100%; border-collapse:collapse; font-family:'Sora',sans-serif;">
                    <thead>
                        <tr style="background:#F4F6F9; border-bottom:1px solid #E2E8F0;">
                            <th style="padding:8px 16px; font-size:7px; font-weight:700; letter-spacing:0.14em; text-transform:uppercase; color:#94A3B8; text-align:left; width:45%;">Item / Product</th>
                            <th style="padding:8px 16px; font-size:7px; font-weight:700; letter-spacing:0.14em; text-transform:uppercase; color:#94A3B8; text-align:center; width:15%;">Form</th>
                            <th style="padding:8px 16px; font-size:7px; font-weight:700; letter-spacing:0.14em; text-transform:uppercase; color:#94A3B8; text-align:center; width:10%;">Qty</th>
                            <th style="padding:8px 16px; font-size:7px; font-weight:700; letter-spacing:0.14em; text-transform:uppercase; color:#94A3B8; text-align:left; width:30%;">Instructions</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100">
                        ${rxHtml}
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Footer -->
        <div class="avoid-break" style="margin-top:48px; padding-top:24px; border-top:1.5px solid #E2E8F0; position:relative; z-index:1;">
            <div style="display:grid; grid-template-columns:1fr auto 1fr; gap:24px; align-items:end;">
                <!-- QR -->
                <div style="display:flex; align-items:flex-end; gap:14px;">
                    <div style="border:1px solid #E2E8F0; border-radius:8px; padding:5px; background:#FFF; flex-shrink:0;">
                        <img src="https://api.qrserver.com/v1/create-qr-code/?size=72x72&margin=0&data=${encodeURIComponent(origin)}" alt="QR Code" style="width:72px; height:72px; display:block; opacity:0.85;"/>
                    </div>
                </div>

                <!-- Center -->
                <div style="text-align:center; padding:0 24px;">
                    <div style="width:48px; height:1px; background:linear-gradient(90deg,transparent,#B08D57); margin:0 auto 10px;"></div>
                    <div style="font-size:7px; font-weight:700; letter-spacing:0.14em; text-transform:uppercase; color:#CBD5E1; margin-bottom:5px;">Generated On</div>
                    <div style="font-family:'DM Mono',monospace; font-size:9.2px; font-weight:500; color:#475569;">${fmtNow()}</div>
                    <div style="width:48px; height:1px; background:linear-gradient(90deg,#B08D57,transparent); margin:10px auto 0;"></div>
                </div>

                <!-- Right -->
                <div style="text-align:right;">
                    <div style="display:inline-block; min-width:180px;">
                        <div style="font-family:'Lora',serif; font-style:italic; font-size:16px; font-weight:600; color:#B08D57; line-height:1; margin-bottom:4px; text-align:right;">${fmt(doctor.name)}</div>
                        <div style="border-bottom:1.5px solid #CBD5E1; margin-bottom:8px;"></div>
                        <div style="font-size:7.5px; font-weight:700; letter-spacing:0.14em; text-transform:uppercase; color:#94A3B8; text-align:right;">Attending Physician</div>
                        <div style="font-size:7px; font-weight:600; letter-spacing:0.1em; text-transform:uppercase; color:#CBD5E1; margin-top:2px; text-align:right;">Electronically Signed</div>
                    </div>
                </div>
            </div>
            
            <div style="margin-top:20px; height:3px; background:linear-gradient(90deg, #0E1523 0%, #1A2740 50%, #0E1523 100%); border-radius:2px;"></div>
            <div style="margin-top:6px; display:flex; justify-content:space-between; align-items:center;">
                <div style="font-family:'DM Mono',monospace; font-size:7px; color:#CBD5E1; letter-spacing:0.08em;">${sysRef}</div>
                <div style="font-size:7px; color:#CBD5E1; font-weight:500;">CONFIDENTIAL — Medical Record</div>
            </div>
        </div>
    </div>
</body>
</html>`;
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
      margin: { top: "10mm", bottom: "10mm", left: "8mm", right: "8mm" }
    });
    return pdfBuffer;
  } finally {
    await browser.close();
  }
}
function parseSurfaces(surfaceStr, toothNum) {
  let s = (surfaceStr || "").toUpperCase().trim();
  if (s === "")
    return ["center"];
  if (["TOP", "BOTTOM", "LEFT", "RIGHT", "CENTER"].includes(s))
    return [s.toLowerCase()];
  const quad = String(toothNum)[0];
  const isUpper = ["1", "2", "5", "6"].includes(quad);
  const isRightSideOfMouth = ["1", "4", "5", "8"].includes(quad);
  let result = [];
  if (s.includes("O") || s.includes("I"))
    result.push("center");
  if (s.includes("M"))
    result.push(isRightSideOfMouth ? "right" : "left");
  if (s.includes("D"))
    result.push(isRightSideOfMouth ? "left" : "right");
  if (s.includes("V") || s.includes("B") || s.includes("F") || s.includes("LA"))
    result.push(isUpper ? "top" : "bottom");
  if (s.includes("P") || s.includes("L") && !s.includes("LA"))
    result.push(isUpper ? "bottom" : "top");
  if (result.length === 0)
    return ["center"];
  return result;
}
function buildOdontogramMap(odontogramDetails) {
  const grouped = {};
  for (const d of odontogramDetails) {
    if (!grouped[d.tooth_number]) {
      grouped[d.tooth_number] = {
        tooth_number: d.tooth_number,
        keadaan: d.keadaan,
        protesa: d.protesa,
        bahan_protesa: d.bahan_protesa,
        restorations: []
      };
    }
    if (d.restorasi) {
      let rest = grouped[d.tooth_number].restorations.find(
        (r) => r.restorasi === d.restorasi && r.bahan_restorasi === d.bahan_restorasi
      );
      if (!rest) {
        rest = { restorasi: d.restorasi, bahan_restorasi: d.bahan_restorasi, surfaces: [] };
        grouped[d.tooth_number].restorations.push(rest);
      }
      if (d.surface && !rest.surfaces.includes(d.surface)) {
        rest.surfaces.push(d.surface);
      }
    }
  }
  const result = {};
  for (const tn in grouped) {
    const d = grouped[tn];
    if (!result[tn])
      result[tn] = {};
    let color = "#10B981";
    if (d.keadaan === "car" || d.keadaan === "cav")
      color = "#ffffff";
    else if (d.keadaan === "mis")
      color = "#9CA3AF";
    else if (d.keadaan === "sou")
      color = "#ffffff";
    if (d.keadaan === "mis")
      result[tn].global = "Missing";
    else if (["prd", "fld", "fud"].includes(d.protesa))
      result[tn].global = "Missing";
    else if (d.keadaan === "nvt")
      result[tn].global = "Non-Vital";
    else if (d.keadaan === "non")
      result[tn].global = "NON";
    else if (d.keadaan === "une")
      result[tn].global = "UNE";
    else if (d.keadaan === "pre")
      result[tn].global = "PRE";
    else if (d.keadaan === "ano")
      result[tn].global = "ANO";
    else if (d.keadaan === "cfr" || d.keadaan === "frx")
      result[tn].global = "Fracture";
    else if (d.keadaan === "rrx")
      result[tn].global = "Sisa Akar";
    if (d.restorations && d.restorations.length > 0) {
      d.restorations.forEach((r) => {
        const mappedData = {
          condition: d.keadaan,
          color,
          restoration: r.restorasi,
          bahan_restorasi: r.bahan_restorasi,
          protesa: d.protesa
        };
        if (r.surfaces && r.surfaces.length > 0) {
          r.surfaces.forEach((s) => {
            const keys = parseSurfaces(s, tn);
            keys.forEach((k) => {
              if (!result[tn][k])
                result[tn][k] = mappedData;
            });
          });
        } else {
          if (!result[tn]["center"])
            result[tn]["center"] = mappedData;
        }
        if (r.restorasi === "rct")
          result[tn].global = "RCT";
        else if (r.restorasi === "pon")
          result[tn].global = "Missing";
      });
    } else {
      const mappedData = { condition: d.keadaan, color, restoration: null, bahan_restorasi: null, protesa: d.protesa };
      if (!result[tn]["center"])
        result[tn]["center"] = mappedData;
    }
  }
  return result;
}
function renderToothSvg(number, td) {
  const top = td.top || null;
  const right = td.right || null;
  const bottom = td.bottom || null;
  const left = td.left || null;
  const center = td.center || null;
  const globalCondition = td.global || null;
  const isAnterior = ["1", "2", "3"].includes(String(number).charAt(1));
  const isRightSideOfMouth = ["1", "4", "5", "8"].includes(String(number).charAt(0));
  const points = isAnterior ? { top: "0,0 100,0 75,35 25,35", right: "100,0 100,100 75,65 75,35", bottom: "0,100 100,100 75,65 25,65", left: "0,0 0,100 25,65 25,35", center: "25,35 75,35 75,65 25,65" } : { top: "0,0 100,0 75,25 25,25", right: "100,0 100,100 75,75 75,25", bottom: "0,100 100,100 75,75 25,75", left: "0,0 0,100 25,75 25,25", center: "25,25 75,25 75,75 25,75" };
  const getFill = (surfaceData) => {
    if (surfaceData?.bahan_restorasi === "amf")
      return "#000000";
    if (surfaceData?.bahan_restorasi === "cof")
      return "#10B981";
    if (surfaceData?.bahan_restorasi === "fis")
      return "#FCA5A5";
    if (surfaceData?.color)
      return surfaceData.color;
    return "#ffffff";
  };
  const getStroke = (surfaceData) => surfaceData?.condition === "car" || surfaceData?.condition === "cav" ? "#000000" : "#94a3b8";
  const getStrokeWidth = (surfaceData) => surfaceData?.condition === "car" || surfaceData?.condition === "cav" ? "4" : "2.5";
  const isFMC = ["fmc", "meb", "gmc"].includes(center?.restoration);
  const isPOC = ["poc", "pob", "mpc"].includes(center?.restoration);
  const isBridgeComponent = ["meb", "pob", "pon", "abu", "Bridge"].includes(center?.restoration);
  const isDenture = ["prd", "fld", "fud", "pld", "pud", "hld", "hud"].includes(center?.protesa);
  const isIPX = center?.restoration === "ipx";
  const cond = center?.condition || "";
  let drawArrowLeft = false, drawArrowRight = false, drawCurvedAbove = false, drawCurvedBelow = false;
  if (cond.includes(".ver")) {
    if (cond === "M.ver") {
      if (isRightSideOfMouth)
        drawArrowRight = true;
      else
        drawArrowLeft = true;
    } else if (cond === "D.ver") {
      if (isRightSideOfMouth)
        drawArrowLeft = true;
      else
        drawArrowRight = true;
    } else if (["ML.ver", "DL.ver", "MP.ver", "DP.ver", "L.ver", "P.ver"].includes(cond))
      drawCurvedBelow = true;
    else
      drawCurvedAbove = true;
  }
  let extras = "";
  if (isBridgeComponent)
    extras += `<line x1="-5" y1="-15" x2="105" y2="-15" stroke="#000" stroke-width="6"/>`;
  if (isFMC || isPOC)
    extras += `<rect x="0" y="0" width="100" height="100" fill="none" stroke="#000" stroke-width="6"/>`;
  if (isPOC)
    extras += `<line x1="20" y1="0" x2="20" y2="100" stroke="#000" stroke-width="1.5"/><line x1="40" y1="0" x2="40" y2="100" stroke="#000" stroke-width="1.5"/><line x1="60" y1="0" x2="60" y2="100" stroke="#000" stroke-width="1.5"/><line x1="80" y1="0" x2="80" y2="100" stroke="#000" stroke-width="1.5"/>`;
  if (globalCondition === "Extracted" || globalCondition === "Missing") {
    extras += `<line x1="10" y1="-10" x2="90" y2="110" stroke="#000" stroke-width="8" stroke-linecap="round"/><line x1="90" y1="-10" x2="10" y2="110" stroke="#000" stroke-width="8" stroke-linecap="round"/>`;
  }
  if (globalCondition === "Non-Vital")
    extras += `<polygon points="35,100 65,100 50,125" fill="#fff" stroke="#000" stroke-width="2.5" stroke-linejoin="round"/>`;
  if (globalCondition === "RCT")
    extras += `<polygon points="35,100 65,100 50,125" fill="#000" stroke="#000" stroke-width="2.5" stroke-linejoin="round"/>`;
  if (globalCondition === "Fracture")
    extras += `<g stroke="#000" stroke-width="4" stroke-linecap="square"><line x1="20" y1="35" x2="80" y2="35"/><line x1="20" y1="65" x2="80" y2="65"/><line x1="45" y1="20" x2="35" y2="80"/><line x1="65" y1="20" x2="55" y2="80"/></g>`;
  if (globalCondition === "Sisa Akar")
    extras += `<line x1="15" y1="-10" x2="45" y2="115" stroke="#000" stroke-width="10" stroke-linecap="round"/><line x1="85" y1="-25" x2="45" y2="115" stroke="#000" stroke-width="10" stroke-linecap="round"/>`;
  if (["NON", "UNE", "PRE", "ANO"].includes(globalCondition))
    extras += `<text x="50" y="15" font-family="sans-serif" font-size="28" font-weight="900" fill="#000" stroke="#fff" stroke-width="2" paint-order="stroke" text-anchor="middle">${globalCondition}</text>`;
  if (isIPX)
    extras += `<text x="50" y="145" font-family="serif" font-size="28" font-weight="900" fill="#000" text-anchor="middle" dominant-baseline="hanging">IPX</text>`;
  if (isDenture)
    extras += `<text x="50" y="${isIPX ? 175 : 145}" font-family="serif" font-size="28" font-weight="900" fill="#000" text-anchor="middle" dominant-baseline="hanging">PRD/FLD</text>`;
  if (drawArrowLeft)
    extras += `<g stroke="#000" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"><line x1="80" y1="-15" x2="20" y2="-15"/><polyline points="35,-25 20,-15 35,-5"/></g>`;
  if (drawArrowRight)
    extras += `<g stroke="#000" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"><line x1="20" y1="-15" x2="80" y2="-15"/><polyline points="65,-25 80,-15 65,-5"/></g>`;
  if (drawCurvedAbove)
    extras += `<g stroke="#000" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M 30,-5 Q 50,-35 80,-10"/><polyline points="65,-15 80,-10 75,-25"/></g>`;
  if (drawCurvedBelow)
    extras += `<g stroke="#000" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M 30,105 Q 50,135 80,110"/><polyline points="65,115 80,110 75,125"/></g>`;
  return `
    <div style="display:flex; flex-direction:column; align-items:center; gap:3px;">
        <div style="font-size:9px; font-weight:700; color:#64748B; line-height:1; user-select:none;">${number}</div>
        <svg width="28" height="28" viewBox="0 0 100 100" style="overflow:visible;">
            <polygon points="${points.top}" fill="${getFill(top)}" stroke="${getStroke(top)}" stroke-width="${getStrokeWidth(top)}" stroke-linejoin="round"/>
            <polygon points="${points.right}" fill="${getFill(right)}" stroke="${getStroke(right)}" stroke-width="${getStrokeWidth(right)}" stroke-linejoin="round"/>
            <polygon points="${points.bottom}" fill="${getFill(bottom)}" stroke="${getStroke(bottom)}" stroke-width="${getStrokeWidth(bottom)}" stroke-linejoin="round"/>
            <polygon points="${points.left}" fill="${getFill(left)}" stroke="${getStroke(left)}" stroke-width="${getStrokeWidth(left)}" stroke-linejoin="round"/>
            <polygon points="${points.center}" fill="${getFill(center)}" stroke="${getStroke(center)}" stroke-width="${getStrokeWidth(center)}" stroke-linejoin="round"/>
            ${extras}
        </svg>
    </div>`;
}
function renderOdontogramChartHtml(odontogramMap) {
  const quadrant1 = [18, 17, 16, 15, 14, 13, 12, 11];
  const quadrant2 = [21, 22, 23, 24, 25, 26, 27, 28];
  const quadrant4 = [48, 47, 46, 45, 44, 43, 42, 41];
  const quadrant3 = [31, 32, 33, 34, 35, 36, 37, 38];
  const quad5 = [55, 54, 53, 52, 51];
  const quad6 = [61, 62, 63, 64, 65];
  const quad8 = [85, 84, 83, 82, 81];
  const quad7 = [71, 72, 73, 74, 75];
  const renderRow = (leftTeeth, rightTeeth, scale = 1) => {
    const scaleTx = scale !== 1 ? `transform:scale(${scale}); transform-origin:center;` : "";
    return `
        <div style="display:flex; justify-content:center; margin-bottom:10px; ${scaleTx}">
            <div style="display:flex; gap:3px; flex:1; justify-content:flex-end; padding-right:12px;">
                ${leftTeeth.map((n) => renderToothSvg(n, odontogramMap[String(n)] || {})).join("")}
            </div>
            <div style="width:2px; background:#CBD5E1; border-radius:2px; margin:0 4px; opacity:0.6;"></div>
            <div style="display:flex; gap:3px; flex:1; justify-content:flex-start; padding-left:12px;">
                ${rightTeeth.map((n) => renderToothSvg(n, odontogramMap[String(n)] || {})).join("")}
            </div>
        </div>`;
  };
  return `
    <div style="padding:16px 12px; background:#FDFDFE; border-bottom:1px solid #E2E8F0;">
        <div style="max-width:520px; margin:0 auto;">
            <!-- Maxillary Right / Left Label -->
            <div style="display:flex; justify-content:space-between; margin-bottom:6px; padding:0 8px;">
                <span style="font-size:7px; font-weight:700; letter-spacing:0.12em; text-transform:uppercase; color:#94A3B8;">Maxillary Right</span>
                <span style="font-size:7px; font-weight:700; letter-spacing:0.12em; text-transform:uppercase; color:#94A3B8;">Maxillary Left</span>
            </div>
            ${renderRow(quadrant1, quadrant2)}
            ${renderRow(quad5, quad6, 0.9)}
            <div style="height:1px; background:linear-gradient(90deg, transparent, #CBD5E1 20%, #CBD5E1 80%, transparent); margin:6px 0;"></div>
            ${renderRow(quad8, quad7, 0.9)}
            ${renderRow(quadrant4, quadrant3)}
            <div style="display:flex; justify-content:space-between; margin-top:6px; padding:0 8px;">
                <span style="font-size:7px; font-weight:700; letter-spacing:0.12em; text-transform:uppercase; color:#94A3B8;">Mandibular Right</span>
                <span style="font-size:7px; font-weight:700; letter-spacing:0.12em; text-transform:uppercase; color:#94A3B8;">Mandibular Left</span>
            </div>
        </div>
    </div>`;
}
async function generateSoapWhoFormPdf(data) {
  const { encounter, patient, doctor, prescriptions = [], referrals = [], items = [], origin, rxText, odontograms = [], odontogramDetails = [] } = data;
  const logo = getLogoBase64();
  const sysRef = `ORATIO-CLINIC-WHO-${encounter.id}`;
  let rxHtml = "";
  if (prescriptions.length > 0) {
    prescriptions.forEach((r, i) => {
      const bg = i % 2 !== 0 ? " bg-slate-50/50" : " bg-white";
      rxHtml += `
            <tr class="${bg}">
                <td class="px-5 py-3 font-semibold text-secondary">
                    <div class="flex items-center gap-2">
                        <span class="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block"></span>
                        <span class="text-xs">${fmt(r.product_name)}</span>
                    </div>
                </td>
                <td class="px-5 py-3 text-xs text-center text-slate-700">${fmt(r.dosage_form)}</td>
                <td class="px-5 py-3 text-xs text-center font-bold text-slate-700">${r.quantity || 1}</td>
                <td class="px-5 py-3 text-[10px] text-slate-500 leading-relaxed">${fmt(r.dosage)} - ${fmt(r.instruction)}</td>
            </tr>`;
    });
  } else if (rxText) {
    rxHtml = `
        <tr class="bg-white">
            <td colspan="4" class="px-5 py-6 text-xs text-slate-600 whitespace-pre-wrap">${fmt(rxText)}</td>
        </tr>`;
  } else {
    rxHtml = `
        <tr class="bg-white">
            <td colspan="4" class="px-5 py-6 text-xs italic text-slate-500 text-center">No prescriptions recorded.</td>
        </tr>`;
  }
  let itemsHtml = "";
  if (items.length > 0) {
    items.forEach((it, i) => {
      const bg = i % 2 !== 0 ? " bg-slate-50/50" : " bg-white";
      itemsHtml += `
            <tr class="${bg}">
                <td class="px-5 py-3 text-xs text-secondary font-medium">${fmt(it.item_name || it.item && it.item.name)}</td>
                <td class="px-5 py-3 text-xs text-center text-slate-700 font-bold">${it.quantity || 1}</td>
            </tr>`;
    });
  }
  let referralsHtml = "";
  if (referrals.length > 0) {
    referrals.forEach((ref, i) => {
      const border = i > 0 ? " border-t border-slate-100" : "";
      referralsHtml += `
            <div class="py-3 ${border} flex justify-between items-start gap-4">
                <div>
                    <span class="text-[10px] font-bold text-slate-700 block mb-1">${fmt(ref.doctor_name || ref.doctor_code)}</span>
                    <span class="text-[9px] text-slate-500">${fmt(ref.note)}</span>
                </div>
                <div class="text-[9px] font-mono whitespace-nowrap text-right shrink-0 mt-0.5">
                    ${fmtDate(ref.referral_date)}
                </div>
            </div>`;
    });
  }
  const odonto = odontograms && odontograms.length > 0 ? odontograms[0] : {};
  const odontogramMap = buildOdontogramMap(odontogramDetails);
  const odontogramChartHtml = renderOdontogramChartHtml(odontogramMap);
  let odontoHtml = "";
  if (odontogramDetails && odontogramDetails.length > 0) {
    const toothG = {};
    odontogramDetails.forEach((d) => {
      if (!toothG[d.tooth_number]) {
        toothG[d.tooth_number] = {
          number: d.tooth_number,
          keadaan: /* @__PURE__ */ new Set(),
          protesa: /* @__PURE__ */ new Set(),
          diagnoses: /* @__PURE__ */ new Set(),
          procedures: /* @__PURE__ */ new Set(),
          surfaces: []
        };
      }
      if (d.keadaan)
        toothG[d.tooth_number].keadaan.add(d.keadaan);
      if (d.protesa)
        toothG[d.tooth_number].protesa.add(d.protesa);
      if (d.all_diagnoses && d.all_diagnoses.length > 0) {
        d.all_diagnoses.forEach((diag) => toothG[d.tooth_number].diagnoses.add(diag.icd10_code ? `${diag.icd10_code} - ${diag.icd10_display}` : diag.icd10_display));
      } else if (d.icd10_display) {
        toothG[d.tooth_number].diagnoses.add(d.icd10_code ? `${d.icd10_code} - ${d.icd10_display}` : d.icd10_display);
      }
      if (d.all_procedures && d.all_procedures.length > 0) {
        d.all_procedures.forEach((proc) => toothG[d.tooth_number].procedures.add(proc.icd9cm_code ? `${proc.icd9cm_code} - ${proc.icd9cm_display}` : proc.icd9cm_display));
      } else if (d.icd9cm_display) {
        toothG[d.tooth_number].procedures.add(d.icd9cm_code ? `${d.icd9cm_code} - ${d.icd9cm_display}` : d.icd9cm_display);
      }
      if (d.surface || d.restorasi) {
        toothG[d.tooth_number].surfaces.push({
          s: d.surface,
          r: d.restorasi,
          br: d.bahan_restorasi
        });
      }
    });
    let count = 0;
    for (const tn in toothG) {
      const grp = toothG[tn];
      let surfStrings = grp.surfaces.map((x) => {
        if (!x.s && !x.r)
          return "";
        if (!x.s && x.r)
          return `All: ${x.r} ${x.br ? "(" + x.br + ")" : ""}`;
        return `${x.s}: ${x.r || "-"} ${x.br ? "(" + x.br + ")" : ""}`;
      }).filter(Boolean).join("<br/>");
      const bg = count % 2 !== 0 ? " bg-slate-50/50" : " bg-white";
      count++;
      odontoHtml += `
            <tr class="${bg}">
                <td class="px-3 py-2 text-[11px] font-bold text-center text-primary border-b border-slate-100">${tn}</td>
                <td class="px-3 py-2 text-[10px] text-slate-700 font-semibold border-b border-slate-100">${Array.from(grp.keadaan).join(", ") || "-"}</td>
                <td class="px-3 py-2 text-[10px] text-slate-600 border-b border-slate-100 whitespace-pre-wrap">${surfStrings || "-"}</td>
                <td class="px-3 py-2 text-[10px] text-slate-600 border-b border-slate-100">${Array.from(grp.protesa).join(", ") || "-"}</td>
                <td class="px-3 py-2 text-[10px] text-slate-600 border-b border-slate-100 whitespace-pre-wrap">${Array.from(grp.diagnoses).join("<br/>") || "-"}</td>
                <td class="px-3 py-2 text-[10px] text-slate-600 border-b border-slate-100 whitespace-pre-wrap">${Array.from(grp.procedures).join("<br/>") || "-"}</td>
            </tr>`;
    }
  } else {
    odontoHtml = `
        <tr class="bg-white">
            <td colspan="6" class="px-5 py-4 text-xs italic text-slate-500 text-center border-b border-slate-100">No tooth specific findings recorded.</td>
        </tr>`;
  }
  const renderSoapSection = (title, content, icon) => {
    if (!content)
      return "";
    return `
        <div class="mb-5 avoid-break">
            <div class="flex items-center gap-2 mb-2 pb-1 border-b border-slate-100">
                <span class="material-symbols-outlined text-[#B08D57] text-[16px]">${icon}</span>
                <span class="text-[10px] font-bold text-slate-700 uppercase tracking-widest">${title}</span>
            </div>
            <div class="text-[11px] leading-relaxed text-slate-800 whitespace-pre-wrap">${content}</div>
        </div>`;
  };
  const htmlBody = `<!DOCTYPE html>
<html class="light" lang="en">
<head>
    <meta charset="utf-8"/>
    <meta content="width=device-width, initial-scale=1.0" name="viewport"/>
    <title>Encounter Record — ${fmt(encounter.id)}</title>
    <script src="https://cdn.tailwindcss.com"><\/script>
    <link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=DM+Mono:wght@400;500&family=Lora:ital,wght@0,400;0,600;1,400&display=swap" rel="stylesheet"/>
    <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@300..500,0..1&display=swap" rel="stylesheet"/>
    <script id="tailwind-config">
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        ink:    "#0E1523",
                        slate:  "#1E2D40",
                        gold:   "#B08D57",
                        "gold-light": "#E8D5A8"
                    },
                    fontFamily: {
                        head: ["Sora", "sans-serif"],
                        body: ["Sora", "sans-serif"],
                        mono: ['"DM Mono"', "monospace"],
                        serif: ["Lora", "serif"],
                    }
                }
            }
        }
    <\/script>
    <style>
        * { -webkit-font-smoothing: antialiased; }
        body { font-family: 'Sora', sans-serif; }
        .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20;
            vertical-align: middle;
            font-size:1rem;
            line-height: 1;
        }
        .mono { font-family: 'DM Mono', monospace; letter-spacing: -0.01em; }
        .field-label {
            font-size:7.5px;
            font-weight: 600;
            letter-spacing: 0.12em;
            text-transform: uppercase;
            color: #94A3B8;
            margin-bottom: 4px;
            display: block;
        }
        .field-value {
            font-size:11px;
            font-weight: 600;
            color: #0E1523;
            line-height: 1.4;
        }
        .divider-gold {
            height: 1px;
            background: linear-gradient(90deg, #B08D57 0%, #E8D5A8 50%, transparent 100%);
        }
        .header-pattern {
            background-image: 
                radial-gradient(circle at 20% 50%, rgba(176,141,87,0.08) 0%, transparent 50%),
                radial-gradient(circle at 80% 20%, rgba(255,255,255,0.03) 0%, transparent 40%);
        }
        .watermark {
            font-family: 'Lora', serif;
            font-style: italic;
            color: #0E1523;
            opacity: 0.03;
            font-size:42px;
            font-weight: 400;
            pointer-events: none;
            user-select: none;
            white-space: nowrap;
        }
        @media print {
            body { background: white !important; margin: 0; padding: 0;
                   -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .no-print { display: none !important; }
            .avoid-break { page-break-inside: avoid; }
        }
    </style>
</head>
<body class="bg-white font-body text-ink antialiased">
    <!-- Header -->
    <div class="avoid-break" style="background: linear-gradient(135deg, #0E1523 0%, #1A2740 55%, #162030 100%); margin-bottom: 0;">
        <div class="header-pattern px-10 py-7 flex justify-between items-stretch gap-8">
            <div class="flex items-center gap-6">
                <div style="background:rgba(255,255,255,0.07); border:1px solid rgba(255,255,255,0.12); border-radius:14px; padding:10px; width:68px; height:68px; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
                    <img alt="Logo" style="max-width:100%; max-height:100%; object-fit:contain;" src="${logo}"/>
                </div>
                <div style="width:1px; height:52px; background:linear-gradient(180deg, transparent, #B08D57 40%, #B08D57 60%, transparent); flex-shrink:0;"></div>
                <div>
                    <div style="display:flex; align-items:center; gap:10px; margin-bottom:6px;">
                        <h1 style="font-family:'Sora',sans-serif; font-size:19.4px; font-weight:800; color:#FFFFFF; letter-spacing:-0.03em; line-height:1;">Clinical Encounter Record</h1>
                    </div>
                    <div style="display:flex; align-items:center; gap:16px;">
                        <span style="font-family:'DM Mono',monospace; font-size:9.2px; color:rgba(255,255,255,0.45); letter-spacing:0.05em;">
                            <span style="color:#B08D57; margin-right:4px;">ID</span>${encounter.id}
                        </span>
                        <span style="color:rgba(255,255,255,0.2);">·</span>
                        <span style="font-family:'DM Mono',monospace; font-size:9.2px; color:rgba(255,255,255,0.45); letter-spacing:0.05em;">
                            <span style="color:#B08D57; margin-right:4px;">TYPE</span>${fmt(encounter.form_mode)}
                        </span>
                    </div>
                </div>
            </div>
            <div style="text-align:right; display:flex; flex-direction:column; justify-content:space-between; padding:4px 0;">
                <div>
                    <div style="font-family:'Lora',serif; font-style:italic; font-size:15.8px; color:#E8D5A8; font-weight:400; letter-spacing:0.01em; line-height:1; margin-bottom:6px;">Encounter Date</div>
                    <div style="font-family:'DM Mono',monospace; font-size:10px; color:rgba(255,255,255,0.8);">${fmtDate(encounter.created_at)}</div>
                </div>
            </div>
        </div>
        <div style="height:2px; background:linear-gradient(90deg, #B08D57 0%, #E8D5A8 30%, #B08D57 60%, transparent 100%);"></div>
    </div>

    <!-- MAIN CONTENT -->
    <div class="px-10 pt-7 space-y-7 pb-12" style="position:relative;">
        <div class="watermark" style="position:absolute; top:60px; right:30px; transform:rotate(-12deg); z-index:0;">${encounter.id}</div>

        <!-- Identity Bar -->
        <div class="grid grid-cols-2 gap-6 avoid-break" style="position:relative; z-index:1;">
            <div style="border:1px solid #E2E8F0; border-radius:10px; padding:14px; background:#FAFBFD;">
                <span class="field-label flex justify-between">Patient <span class="material-symbols-outlined text-[12px] text-slate-300">person</span></span>
                <div class="field-value">${fmt(patient.nama_lengkap)}</div>
                <div class="mono text-[9px] text-slate-500 mt-1">${fmt(patient.id)} | ${fmtGender(patient.gender)} | ${calculateAge(patient.birth_date)} yrs</div>
            </div>
            <div style="border:1px solid #E2E8F0; border-radius:10px; padding:14px; background:#FAFBFD;">
                <span class="field-label flex justify-between">Attending Doctor <span class="material-symbols-outlined text-[12px] text-slate-300">stethoscope</span></span>
                <div class="field-value">${fmt(doctor.name)}</div>
                <div class="mono text-[9px] text-slate-500 mt-1">${fmt(doctor.doctor_code)}</div>
            </div>
        </div>

        <div class="divider-gold avoid-break" style="position:relative; z-index:1;"></div>

        <!-- SOAP Notes -->
        <div class="avoid-break space-y-2" style="position:relative; z-index:1;">
            ${renderSoapSection("Subjective", encounter.subjective, "person_search")}
            ${renderSoapSection("Objective", encounter.objective, "monitor_heart")}
            ${renderSoapSection("Assessment", encounter.assessment, "medical_information")}
            ${renderSoapSection("Plan", encounter.plan, "assignment")}
            ${renderSoapSection("Keterangan Tambahan", encounter.keterangan, "note_alt")}
        </div>

        <!-- Odontogram Findings -->
        <div class="avoid-break mb-6" style="position:relative; z-index:1;">
            <div style="border:1px solid #E2E8F0; border-radius:10px; overflow:hidden; box-shadow:0 1px 4px rgba(14,21,35,0.04);">
                <div style="background:#F0FDFA; border-bottom:1px solid #99F6E4; padding:10px 16px; display:flex; align-items:center; gap:6px;">
                    <span class="material-symbols-outlined text-[#059669] text-[14px]">dentistry</span>
                    <span class="field-label" style="margin:0; color:#059669;">Odontogram Findings (PDGI Format)</span>
                </div>
                
                ${odonto.occlusi || odonto.diastema || odonto.palatum || odonto.gigi_anomali ? `
                <div style="padding:10px 16px; background:#FAFAFA; border-bottom:1px solid #E2E8F0; display:flex; flex-wrap:wrap; gap:16px;">
                    ${odonto.occlusi ? `<div style="font-size:9.5px; color:#475569;"><b>Occlusi:</b> ${fmt(odonto.occlusi)}</div>` : ""}
                    ${odonto.palatum ? `<div style="font-size:9.5px; color:#475569;"><b>Palatum:</b> ${fmt(odonto.palatum)}</div>` : ""}
                    ${odonto.diastema ? `<div style="font-size:9.5px; color:#475569;"><b>Diastema:</b> ${fmt(odonto.diastema)}</div>` : ""}
                    ${odonto.gigi_anomali ? `<div style="font-size:9.5px; color:#475569;"><b>Anomali:</b> ${fmt(odonto.gigi_anomali)}</div>` : ""}
                    ${odonto.torus_palatinus ? `<div style="font-size:9.5px; color:#475569;"><b>Torus P.:</b> ${fmt(odonto.torus_palatinus)}</div>` : ""}
                    ${odonto.torus_mandibularis ? `<div style="font-size:9.5px; color:#475569;"><b>Torus M.:</b> ${fmt(odonto.torus_mandibularis)}</div>` : ""}
                </div>
                ` : ""}

                ${odontogramChartHtml}

                <table style="width:100%; border-collapse:collapse; font-family:'Sora',sans-serif;">
                    <thead>
                        <tr style="background:#F4F6F9; border-bottom:1px solid #E2E8F0;">
                            <th style="padding:8px 12px; font-size:7px; font-weight:700; letter-spacing:0.14em; text-transform:uppercase; color:#94A3B8; text-align:center; width:8%;">Tooth</th>
                            <th style="padding:8px 12px; font-size:7px; font-weight:700; letter-spacing:0.14em; text-transform:uppercase; color:#94A3B8; text-align:left; width:15%;">Condition</th>
                            <th style="padding:8px 12px; font-size:7px; font-weight:700; letter-spacing:0.14em; text-transform:uppercase; color:#94A3B8; text-align:left; width:22%;">Surfaces & Restorations</th>
                            <th style="padding:8px 12px; font-size:7px; font-weight:700; letter-spacing:0.14em; text-transform:uppercase; color:#94A3B8; text-align:left; width:15%;">Protesa</th>
                            <th style="padding:8px 12px; font-size:7px; font-weight:700; letter-spacing:0.14em; text-transform:uppercase; color:#94A3B8; text-align:left; width:20%;">Diagnoses</th>
                            <th style="padding:8px 12px; font-size:7px; font-weight:700; letter-spacing:0.14em; text-transform:uppercase; color:#94A3B8; text-align:left; width:20%;">Procedures</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100">
                        ${odontoHtml}
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Procedures/Items & Referrals Grid -->
        ${itemsHtml || referralsHtml ? `
        <div class="grid grid-cols-2 gap-6 avoid-break pt-4" style="position:relative; z-index:1;">
            <!-- Actions / Items -->
            ${itemsHtml ? `
            <div style="border:1px solid #E2E8F0; border-radius:10px; overflow:hidden;">
                <div style="background:#F4F6F9; border-bottom:1px solid #E2E8F0; padding:10px 14px; display:flex; align-items:center; gap:6px;">
                    <span class="material-symbols-outlined text-slate-500 text-[14px]">medical_services</span>
                    <span class="field-label" style="margin:0;">Procedures / Items</span>
                </div>
                <table class="w-full">
                    ${itemsHtml}
                </table>
            </div>` : "<div></div>"}

            <!-- Referrals -->
            ${referralsHtml ? `
            <div style="border:1px solid #E2E8F0; border-radius:10px; overflow:hidden;">
                <div style="background:#F0FDF4; border-bottom:1px solid #BBF7D0; padding:10px 14px; display:flex; align-items:center; gap:6px;">
                    <span class="material-symbols-outlined text-emerald-600 text-[14px]">share</span>
                    <span class="field-label" style="margin:0; color:#059669;">Referrals</span>
                </div>
                <div class="px-4">
                    ${referralsHtml}
                </div>
            </div>` : "<div></div>"}
        </div>
        ` : ""}

        <!-- Prescriptions -->
        <div class="avoid-break mt-6" style="position:relative; z-index:1;">
            <div style="border:1px solid #E2E8F0; border-radius:10px; overflow:hidden; box-shadow:0 1px 4px rgba(14,21,35,0.04);">
                <div style="background:#EFF6FF; border-bottom:1px solid #BFDBFE; padding:10px 16px; display:flex; align-items:center; gap:6px;">
                    <span class="material-symbols-outlined text-blue-600 text-[14px]">medication</span>
                    <span class="field-label" style="margin:0; color:#2563EB;">Prescriptions / Resep Diberikan</span>
                </div>
                <table style="width:100%; border-collapse:collapse; font-family:'Sora',sans-serif;">
                    <thead>
                        <tr style="background:#F4F6F9; border-bottom:1px solid #E2E8F0;">
                            <th style="padding:8px 16px; font-size:7px; font-weight:700; letter-spacing:0.14em; text-transform:uppercase; color:#94A3B8; text-align:left; width:45%;">Item / Product</th>
                            <th style="padding:8px 16px; font-size:7px; font-weight:700; letter-spacing:0.14em; text-transform:uppercase; color:#94A3B8; text-align:center; width:15%;">Form</th>
                            <th style="padding:8px 16px; font-size:7px; font-weight:700; letter-spacing:0.14em; text-transform:uppercase; color:#94A3B8; text-align:center; width:10%;">Qty</th>
                            <th style="padding:8px 16px; font-size:7px; font-weight:700; letter-spacing:0.14em; text-transform:uppercase; color:#94A3B8; text-align:left; width:30%;">Instructions</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100">
                        ${rxHtml}
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Footer -->
        <div class="avoid-break" style="margin-top:48px; padding-top:24px; border-top:1.5px solid #E2E8F0; position:relative; z-index:1;">
            <div style="display:grid; grid-template-columns:1fr auto 1fr; gap:24px; align-items:end;">
                <!-- QR -->
                <div style="display:flex; align-items:flex-end; gap:14px;">
                    <div style="border:1px solid #E2E8F0; border-radius:8px; padding:5px; background:#FFF; flex-shrink:0;">
                        <img src="https://api.qrserver.com/v1/create-qr-code/?size=72x72&margin=0&data=${encodeURIComponent(origin)}" alt="QR Code" style="width:72px; height:72px; display:block; opacity:0.85;"/>
                    </div>
                </div>

                <!-- Center -->
                <div style="text-align:center; padding:0 24px;">
                    <div style="width:48px; height:1px; background:linear-gradient(90deg,transparent,#B08D57); margin:0 auto 10px;"></div>
                    <div style="font-size:7px; font-weight:700; letter-spacing:0.14em; text-transform:uppercase; color:#CBD5E1; margin-bottom:5px;">Generated On</div>
                    <div style="font-family:'DM Mono',monospace; font-size:9.2px; font-weight:500; color:#475569;">${fmtNow()}</div>
                    <div style="width:48px; height:1px; background:linear-gradient(90deg,#B08D57,transparent); margin:10px auto 0;"></div>
                </div>

                <!-- Right -->
                <div style="text-align:right;">
                    <div style="display:inline-block; min-width:180px;">
                        <div style="font-family:'Lora',serif; font-style:italic; font-size:16px; font-weight:600; color:#B08D57; line-height:1; margin-bottom:4px; text-align:right;">${fmt(doctor.name)}</div>
                        <div style="border-bottom:1.5px solid #CBD5E1; margin-bottom:8px;"></div>
                        <div style="font-size:7.5px; font-weight:700; letter-spacing:0.14em; text-transform:uppercase; color:#94A3B8; text-align:right;">Attending Physician</div>
                        <div style="font-size:7px; font-weight:600; letter-spacing:0.1em; text-transform:uppercase; color:#CBD5E1; margin-top:2px; text-align:right;">Electronically Signed</div>
                    </div>
                </div>
            </div>
            
            <div style="margin-top:20px; height:3px; background:linear-gradient(90deg, #0E1523 0%, #1A2740 50%, #0E1523 100%); border-radius:2px;"></div>
            <div style="margin-top:6px; display:flex; justify-content:space-between; align-items:center;">
                <div style="font-family:'DM Mono',monospace; font-size:7px; color:#CBD5E1; letter-spacing:0.08em;">${sysRef}</div>
                <div style="font-size:7px; color:#CBD5E1; font-weight:500;">CONFIDENTIAL — Medical Record</div>
            </div>
        </div>
    </div>
</body>
</html>`;
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
      margin: { top: "10mm", bottom: "10mm", left: "8mm", right: "8mm" }
    });
    return pdfBuffer;
  } finally {
    await browser.close();
  }
}
async function generatePaymentReceiptPdf(data) {
  const { payment, encounter, patient, doctor, cashier, items = [], origin } = data;
  const logo = getLogoBase64();
  const sysRef = `INV-${(/* @__PURE__ */ new Date()).getFullYear()}-${payment.id.toString().split("-")[0].toUpperCase()}`;
  function fmtIdr(amount) {
    if (amount == null)
      return "Rp 0";
    return "Rp " + Number(amount).toLocaleString("id-ID");
  }
  let itemsHtml = "";
  if (items.length > 0) {
    items.forEach((it, i) => {
      const bg = i % 2 !== 0 ? " bg-slate-50/50" : " bg-white";
      itemsHtml += `
            <tr class="${bg}">
                <td class="px-5 py-3 text-[11px] text-secondary font-semibold">${fmt(it.item_name || it.name)}</td>
                <td class="px-5 py-3 text-[11px] text-center text-slate-700">${it.quantity || 1}</td>
                <td class="px-5 py-3 text-[11px] text-right text-slate-700">${fmtIdr(it.price_at_time)}</td>
                <td class="px-5 py-3 text-[11px] text-right text-slate-900 font-bold">${fmtIdr(it.subtotal)}</td>
            </tr>`;
    });
  } else {
    itemsHtml = `
        <tr class="bg-white">
            <td colspan="4" class="px-5 py-6 text-[11px] italic text-slate-500 text-center">No billing items found.</td>
        </tr>`;
  }
  const htmlBody = `<!DOCTYPE html>
<html class="light" lang="en">
<head>
    <meta charset="utf-8"/>
    <meta content="width=device-width, initial-scale=1.0" name="viewport"/>
    <title>Payment Receipt — ${sysRef}</title>
    <script src="https://cdn.tailwindcss.com"><\/script>
    <link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=DM+Mono:wght@400;500&family=Lora:ital,wght@0,400;0,600;1,400&display=swap" rel="stylesheet"/>
    <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@300..500,0..1&display=swap" rel="stylesheet"/>
    <script id="tailwind-config">
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        ink:    "#0E1523",
                        slate:  "#1E2D40",
                        gold:   "#B08D57",
                        "gold-light": "#E8D5A8"
                    },
                    fontFamily: {
                        head: ["Sora", "sans-serif"],
                        body: ["Sora", "sans-serif"],
                        mono: ['"DM Mono"', "monospace"],
                        serif: ["Lora", "serif"],
                    }
                }
            }
        }
    <\/script>
    <style>
        * { -webkit-font-smoothing: antialiased; }
        body { font-family: 'Sora', sans-serif; }
        .material-symbols-outlined { font-size:1rem; vertical-align: middle; }
        .mono { font-family: 'DM Mono', monospace; }
        @media print {
            body { background: white !important; margin: 0; padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .avoid-break { page-break-inside: avoid; }
        }
    </style>
</head>
<body class="bg-white font-body text-ink antialiased">
    <!-- Header -->
    <div class="px-10 py-8 border-b border-slate-100 flex justify-between items-start" style="background: linear-gradient(135deg, #0E1523 0%, #1A2740 100%);">
        <div class="flex items-center gap-6">
            <div style="background:rgba(255,255,255,0.07); border:1px solid rgba(255,255,255,0.12); border-radius:14px; padding:10px; width:68px; height:68px; display:flex; align-items:center; justify-content:center;">
                <img alt="Logo" style="max-width:100%; max-height:100%; object-fit:contain;" src="${logo}"/>
            </div>
            <div style="width:1px; height:52px; background:linear-gradient(180deg, transparent, #B08D57 40%, #B08D57 60%, transparent);"></div>
            <div>
                <h1 style="color:#FFFFFF; font-size:20px; font-weight:800;">ORATIO CLINIC</h1>
                <p style="color:#94A3B8; font-size:9px; margin-top:2px;">Advanced Dental Care & Aesthetics</p>
                <div style="display:flex; gap:10px; margin-top:8px;">
                    <span style="background:rgba(176,141,87,0.25); color:#E8D5A8; font-size:7px; font-weight:700; padding:3px 8px; border-radius:20px; text-transform:uppercase; letter-spacing:1px;">OFFICIAL RECEIPT</span>
                </div>
            </div>
        </div>
        <div style="text-align:right;">
            <div style="font-family:'Lora',serif; font-style:italic; font-size:16px; color:#E8D5A8;">Invoice</div>
            <div style="font-family:'DM Mono',monospace; font-size:9px; color:rgba(255,255,255,0.5); margin-top:4px;">${sysRef}</div>
            <div style="font-size:8px; color:#94A3B8; margin-top:12px;">${fmtNow()}</div>
        </div>
    </div>
    
    <!-- Info Grid -->
    <div class="px-10 py-8 grid grid-cols-2 gap-8 avoid-break">
        <div>
            <h3 class="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-3">Billed To</h3>
            <p class="text-base font-bold text-slate-900">${fmt(patient.nama_lengkap)}</p>
            <p class="text-[11px] text-slate-500 mono mt-1">MR ID: ${fmt(patient.id)}</p>
        </div>
        <div>
            <h3 class="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-3">Service Details</h3>
            <div class="space-y-2 text-xs">
                <div class="flex"><span class="w-24 text-slate-500">Provider</span> <span class="font-semibold text-slate-800">Dr. ${fmt(doctor?.name, "-")}</span></div>
                <div class="flex"><span class="w-24 text-slate-500">Cashier</span> <span class="font-semibold text-slate-800">${fmt(cashier?.name, "-")}</span></div>
                <div class="flex"><span class="w-24 text-slate-500">Payment</span> <span class="font-semibold text-slate-800">${fmt(payment.payment_type, "N/A")}</span></div>
                <div class="flex"><span class="w-24 text-slate-500">Mode</span> <span class="font-semibold text-slate-800">${fmt(payment.payment_mode, "NORMAL")}</span></div>
            </div>
        </div>
    </div>

    <!-- Main Table -->
    <div class="px-10 avoid-break relative z-10">
        <div style="border:1px solid #E2E8F0; border-radius:10px; overflow:hidden; box-shadow:0 1px 4px rgba(14,21,35,0.04);">
            <table style="width:100%; border-collapse:collapse; font-family:'Sora',sans-serif;">
                <thead>
                    <tr style="background:#F4F6F9; border-bottom:1px solid #E2E8F0;">
                        <th style="padding:12px 16px; font-size:8px; font-weight:700; letter-spacing:1px; text-transform:uppercase; color:#94A3B8; text-align:left;">Description</th>
                        <th style="padding:12px 16px; font-size:8px; font-weight:700; letter-spacing:1px; text-transform:uppercase; color:#94A3B8; text-align:center;">Qty</th>
                        <th style="padding:12px 16px; font-size:8px; font-weight:700; letter-spacing:1px; text-transform:uppercase; color:#94A3B8; text-align:right;">Price</th>
                        <th style="padding:12px 16px; font-size:8px; font-weight:700; letter-spacing:1px; text-transform:uppercase; color:#94A3B8; text-align:right;">Subtotal</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                    ${itemsHtml}
                </tbody>
            </table>
            
            <!-- Totals -->
            <div style="background:#FAFBFC; border-top:1px solid #E2E8F0; padding:20px; display:flex; justify-content:flex-end;">
                <div style="width:60%; max-width:300px; space-y:8px;">
                    <div class="flex justify-between text-xs py-1">
                        <span class="text-slate-500">Gross Total</span>
                        <span class="text-slate-800 font-bold">${fmtIdr(payment.total_sales)}</span>
                    </div>
                    <div class="flex justify-between text-xs py-1 border-b border-slate-200 pb-3">
                        <span class="text-slate-500">Discount Amount</span>
                        <span class="text-red-500 font-bold">- ${fmtIdr(payment.discount_amount)}</span>
                    </div>
                    <div class="flex justify-between items-center bg-blue-50/50 p-4 rounded-xl mt-3 border border-blue-100/50">
                        <span class="text-slate-800 font-extrabold uppercase tracking-widest text-[10px]">Net Total</span>
                        <span class="text-xl font-black text-[#1A2740]">${fmtIdr(payment.net_sales)}</span>
                    </div>
                </div>
            </div>
        </div>
        
        ${payment.note ? `
        <div class="mt-6 p-4 bg-amber-50/50 rounded-xl border border-amber-100/50">
            <span class="text-[8px] font-bold text-amber-600/70 uppercase tracking-widest mb-1 block">Notes</span>
            <p class="text-[11px] text-slate-700 italic">${fmt(payment.note)}</p>
        </div>` : ""}
    </div>

    <!-- Footer -->
    <div class="avoid-break mt-12 pt-8 border-t-[1.5px] border-slate-100 mx-10">
        <div class="flex justify-between items-end">
            <div class="flex items-center gap-4">
                <div style="border:1px solid #E2E8F0; border-radius:8px; padding:5px; background:#FFF;">
                    <img src="https://api.qrserver.com/v1/create-qr-code/?size=72x72&margin=0&data=${encodeURIComponent(origin + "/?payment=" + payment.id)}" alt="QR" style="width:72px; height:72px; opacity:0.85;"/>
                </div>
                <div>
                    <div style="font-size:7px; font-weight:700; letter-spacing:1px; text-transform:uppercase; color:#B08D57; margin-bottom:4px;">Scan to Verify</div>
                    <div style="font-size:8px; color:#94A3B8; max-width:180px;">Digital access code for payment verification and tracking.</div>
                </div>
            </div>
            
            <div class="text-right">
                <div style="font-family:'Lora',serif; font-style:italic; font-size:20px; color:#B08D57; opacity:0.18; margin-bottom:4px;">Oratio e-Sys</div>
                <div style="border-bottom:1.5px solid #CBD5E1; margin-bottom:8px;"></div>
                <div style="font-size:7px; font-weight:700; letter-spacing:1px; text-transform:uppercase; color:#94A3B8;">Authorized Receipt</div>
                <div style="font-size:6.5px; font-weight:600; color:#CBD5E1; margin-top:2px;">Thank you for trusting Oratio Clinic</div>
            </div>
        </div>
    </div>
</body>
</html>`;
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
      margin: { top: "10mm", bottom: "10mm", left: "8mm", right: "8mm" }
    });
    return pdfBuffer;
  } finally {
    await browser.close();
  }
}
export {
  generateSoapFormPdf as a,
  generatePatientProfilePdf as b,
  generatePaymentReceiptPdf as c,
  generateSoapWhoFormPdf as g
};
