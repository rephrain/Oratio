import fs from 'fs';
import path from 'path';

const pdfFormatCode = `
export async function generatePaymentReceiptPdf(data) {
    const { payment, encounter, patient, doctor, cashier, items = [], origin } = data;
    const logo = getLogoBase64();
    const sysRef = \`INV-\${new Date().getFullYear()}-\${payment.id.toString().split('-')[0].toUpperCase()}\`;
    
    function fmtIdr(amount) {
        if (amount == null) return 'Rp 0';
        return 'Rp ' + Number(amount).toLocaleString('id-ID');
    }

    let itemsHtml = "";
    if (items.length > 0) {
        items.forEach((it, i) => {
            const bg = i % 2 !== 0 ? ' bg-slate-50/50' : ' bg-white';
            itemsHtml += \`
            <tr class="\${bg}">
                <td class="px-5 py-3 text-xs text-secondary font-semibold">\${fmt(it.item_name || it.name)}</td>
                <td class="px-5 py-3 text-xs text-center text-slate-700">\${it.quantity || 1}</td>
                <td class="px-5 py-3 text-xs text-right text-slate-700">\${fmtIdr(it.price_at_time)}</td>
                <td class="px-5 py-3 text-xs text-right text-slate-900 font-bold">\${fmtIdr(it.subtotal)}</td>
            </tr>\`;
        });
    } else {
        itemsHtml = \`
        <tr class="bg-white">
            <td colspan="4" class="px-5 py-6 text-xs italic text-slate-500 text-center">No billing items found.</td>
        </tr>\`;
    }

    const htmlBody = \`<!DOCTYPE html>
<html class="light" lang="en">
<head>
    <meta charset="utf-8"/>
    <meta content="width=device-width, initial-scale=1.0" name="viewport"/>
    <title>Payment Receipt — \${sysRef}</title>
    <script src="https://cdn.tailwindcss.com"></script>
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
    </script>
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
                <img alt="Logo" style="max-width:100%; max-height:100%; object-fit:contain;" src="\${logo}"/>
            </div>
            <div style="width:1px; height:52px; background:linear-gradient(180deg, transparent, #B08D57 40%, #B08D57 60%, transparent);"></div>
            <div>
                <h1 style="color:#FFFFFF; font-size:24px; font-weight:800;">ORATIO CLINIC</h1>
                <p style="color:#94A3B8; font-size:10px; margin-top:2px;">Advanced Dental Care & Aesthetics</p>
                <div style="display:flex; gap:10px; margin-top:8px;">
                    <span style="background:rgba(176,141,87,0.25); color:#E8D5A8; font-size:8px; font-weight:700; padding:3px 8px; border-radius:20px; text-transform:uppercase; letter-spacing:1px;">OFFICIAL RECEIPT</span>
                </div>
            </div>
        </div>
        <div style="text-align:right;">
            <div style="font-family:'Lora',serif; font-style:italic; font-size:18px; color:#E8D5A8;">Invoice</div>
            <div style="font-family:'DM Mono',monospace; font-size:10px; color:rgba(255,255,255,0.5); margin-top:4px;">\${sysRef}</div>
            <div style="font-size:9px; color:#94A3B8; margin-top:12px;">\${fmtNow()}</div>
        </div>
    </div>
    
    <!-- Info Grid -->
    <div class="px-10 py-8 grid grid-cols-2 gap-8 avoid-break">
        <div>
            <h3 class="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-3">Billed To</h3>
            <p class="text-lg font-bold text-slate-900">\${fmt(patient.nama_lengkap)}</p>
            <p class="text-xs text-slate-500 mono mt-1">MR ID: \${fmt(patient.id)}</p>
            <p class="text-xs text-slate-500 mt-1">NIK: \${fmt(patient.nik, '-')}</p>
        </div>
        <div>
            <h3 class="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-3">Service Details</h3>
            <div class="space-y-2 text-sm">
                <div class="flex"><span class="w-24 text-slate-500">Provider</span> <span class="font-semibold text-slate-800">Dr. \${fmt(doctor?.name, '-')}</span></div>
                <div class="flex"><span class="w-24 text-slate-500">Cashier</span> <span class="font-semibold text-slate-800">\${fmt(cashier?.name, '-')}</span></div>
                <div class="flex"><span class="w-24 text-slate-500">Payment</span> <span class="font-semibold text-slate-800">\${fmt(payment.payment_type, 'N/A')}</span></div>
                <div class="flex"><span class="w-24 text-slate-500">Mode</span> <span class="font-semibold text-slate-800">\${fmt(payment.payment_mode, 'NORMAL')}</span></div>
            </div>
        </div>
    </div>

    <!-- Main Table -->
    <div class="px-10 avoid-break relative z-10">
        <div style="border:1px solid #E2E8F0; border-radius:10px; overflow:hidden; box-shadow:0 1px 4px rgba(14,21,35,0.04);">
            <table style="width:100%; border-collapse:collapse; font-family:'Sora',sans-serif;">
                <thead>
                    <tr style="background:#F4F6F9; border-bottom:1px solid #E2E8F0;">
                        <th style="padding:12px 16px; font-size:9px; font-weight:700; letter-spacing:1px; text-transform:uppercase; color:#94A3B8; text-align:left;">Description</th>
                        <th style="padding:12px 16px; font-size:9px; font-weight:700; letter-spacing:1px; text-transform:uppercase; color:#94A3B8; text-align:center;">Qty</th>
                        <th style="padding:12px 16px; font-size:9px; font-weight:700; letter-spacing:1px; text-transform:uppercase; color:#94A3B8; text-align:right;">Price</th>
                        <th style="padding:12px 16px; font-size:9px; font-weight:700; letter-spacing:1px; text-transform:uppercase; color:#94A3B8; text-align:right;">Subtotal</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                    \${itemsHtml}
                </tbody>
            </table>
            
            <!-- Totals -->
            <div style="background:#FAFBFC; border-top:1px solid #E2E8F0; padding:20px; display:flex; justify-content:flex-end;">
                <div style="width:60%; max-width:300px; space-y:8px;">
                    <div class="flex justify-between text-sm py-1">
                        <span class="text-slate-500">Gross Total</span>
                        <span class="text-slate-800 font-bold">\${fmtIdr(payment.total_sales)}</span>
                    </div>
                    <div class="flex justify-between text-sm py-1 border-b border-slate-200 pb-3">
                        <span class="text-slate-500">Discount Amount</span>
                        <span class="text-red-500 font-bold">- \${fmtIdr(payment.discount_amount)}</span>
                    </div>
                    <div class="flex justify-between items-center bg-blue-50/50 p-4 rounded-xl mt-3 border border-blue-100/50">
                        <span class="text-slate-800 font-extrabold uppercase tracking-widest text-xs">Net Total</span>
                        <span class="text-2xl font-black text-[#1A2740]">\${fmtIdr(payment.net_sales)}</span>
                    </div>
                </div>
            </div>
        </div>
        
        \${payment.note ? \`
        <div class="mt-6 p-4 bg-amber-50/50 rounded-xl border border-amber-100/50">
            <span class="text-[9px] font-bold text-amber-600/70 uppercase tracking-widest mb-1 block">Notes</span>
            <p class="text-xs text-slate-700 italic">\${fmt(payment.note)}</p>
        </div>\` : ''}
    </div>

    <!-- Footer -->
    <div class="avoid-break mt-12 pt-8 border-t-[1.5px] border-slate-100 mx-10">
        <div class="flex justify-between items-end">
            <div class="flex items-center gap-4">
                <div style="border:1px solid #E2E8F0; border-radius:8px; padding:5px; background:#FFF;">
                    <img src="https://api.qrserver.com/v1/create-qr-code/?size=72x72&margin=0&data=\${encodeURIComponent(origin + '/?payment=' + payment.id)}" alt="QR" style="width:72px; height:72px; opacity:0.85;"/>
                </div>
                <div>
                    <div style="font-size:8px; font-weight:700; letter-spacing:1px; text-transform:uppercase; color:#B08D57; margin-bottom:4px;">Scan to Verify</div>
                    <div style="font-size:9px; color:#94A3B8; max-width:180px;">Digital access code for payment verification and tracking.</div>
                </div>
            </div>
            
            <div class="text-right">
                <div style="font-family:'Lora',serif; font-style:italic; font-size:24px; color:#B08D57; opacity:0.18; margin-bottom:4px;">Oratio e-Sys</div>
                <div style="border-bottom:1.5px solid #CBD5E1; margin-bottom:8px;"></div>
                <div style="font-size:8px; font-weight:700; letter-spacing:1px; text-transform:uppercase; color:#94A3B8;">Authorized Receipt</div>
                <div style="font-size:7px; font-weight:600; color:#CBD5E1; margin-top:2px;">Thank you for trusting Oratio Clinic</div>
            </div>
        </div>
    </div>
</body>
</html>\`;

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
        await page.setContent(htmlBody, { waitUntil: 'networkidle0', timeout: 30000 });
        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: { top: '10mm', bottom: '10mm', left: '8mm', right: '8mm' }
        });
        return pdfBuffer;
    } finally {
        await browser.close();
    }
}
`;

const targetPath = 'd:\\Rephrain\\PERSONAL PROJECT\\ORATIO\\Oratio\\src\\lib\\server\\pdfGenerator.js';
fs.appendFileSync(targetPath, '\n' + pdfFormatCode);
console.log('Appended function to pdfGenerator.js');
