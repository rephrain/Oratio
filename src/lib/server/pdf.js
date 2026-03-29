import PdfPrinter from 'pdfmake';
import { PERMANENT_TEETH } from '$lib/utils/constants.js';
import { resolve } from 'path';

const fontsDir = resolve('static/fonts');

function createPrinter() {
	return new PdfPrinter({
		Roboto: {
			normal: resolve(fontsDir, 'Roboto-Regular.ttf'),
			bold: resolve(fontsDir, 'Roboto-Medium.ttf'),
			italics: resolve(fontsDir, 'Roboto-Italic.ttf'),
			bolditalics: resolve(fontsDir, 'Roboto-BoldItalic.ttf')
		}
	});
}

export function generatePatientProfilePDF(patient, history, allergies, medications) {
	const docDefinition = {
		pageSize: 'A4',
		pageMargins: [40, 60, 40, 60],
		defaultStyle: { fontSize: 10 },
		content: [
			{ text: 'REKAM MEDIS PASIEN', style: 'header', alignment: 'center' },
			{ text: 'Oratio Clinic Clinic', alignment: 'center', margin: [0, 0, 0, 20] },
			{ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1 }] },
			{ text: ' ', margin: [0, 10] },

			// Patient info table
			{
				table: {
					widths: ['30%', '70%'],
					body: [
						['No. Rekam Medis', patient.id || '-'],
						['NIK', patient.nik || '-'],
						['Nama Lengkap', patient.nama_lengkap || '-'],
						['Tanggal Lahir', patient.birth_date || '-'],
						['Jenis Kelamin', patient.gender === 'male' ? 'Laki-laki' : 'Perempuan'],
						['Golongan Darah', `${patient.blood_type || '-'} ${patient.rhesus || ''}`.trim()],
						['Alamat', patient.address || '-'],
						['Telepon', patient.handphone || '-'],
						['Email', patient.email || '-']
					]
				},
				layout: 'lightHorizontalLines'
			},

			{ text: ' ', margin: [0, 10] },
			{ text: 'Riwayat Penyakit', style: 'subheader' },
			...(history && history.length > 0
				? history.map(h => ({ text: `• ${h.description || h.terminology?.display || '-'} (${h.type})`, margin: [10, 2] }))
				: [{ text: 'Tidak ada riwayat penyakit tercatat', italics: true, color: '#888' }]
			),

			{ text: ' ', margin: [0, 10] },
			{ text: 'Alergi', style: 'subheader' },
			...(allergies && allergies.length > 0
				? allergies.map(a => ({ text: `• ${a.substance_display || '-'} → ${a.reaction_display || '-'}`, margin: [10, 2] }))
				: [{ text: 'Tidak ada alergi tercatat', italics: true, color: '#888' }]
			),

			{ text: ' ', margin: [0, 10] },
			{ text: 'Riwayat Pengobatan', style: 'subheader' },
			...(medications && medications.length > 0
				? medications.map(m => ({ text: `• ${m.product_name || m.display || '-'} — ${m.dosage || '-'}`, margin: [10, 2] }))
				: [{ text: 'Tidak ada riwayat pengobatan tercatat', italics: true, color: '#888' }]
			)
		],
		styles: {
			header: { fontSize: 16, bold: true, margin: [0, 0, 0, 4] },
			subheader: { fontSize: 12, bold: true, margin: [0, 5, 0, 5] }
		}
	};

	return docDefinition;
}

export function generateSOAPPDF(encounter, patient, prescriptions, diagnoses, procedures, doctor) {
	const docDefinition = {
		pageSize: 'A4',
		pageMargins: [40, 60, 40, 60],
		defaultStyle: { fontSize: 10 },
		content: [
			{ text: 'CATATAN MEDIS - SOAP', style: 'header', alignment: 'center' },
			{ text: 'Oratio Clinic Clinic', alignment: 'center', margin: [0, 0, 0, 5] },
			{ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1 }] },
			{ text: ' ', margin: [0, 10] },

			{
				columns: [
					{
						width: '50%',
						stack: [
							{ text: `No. RM: ${patient.id}`, fontSize: 9 },
							{ text: `Nama: ${patient.nama_lengkap}`, fontSize: 9 },
							{ text: `Tgl Lahir: ${patient.birth_date}`, fontSize: 9 }
						]
					},
					{
						width: '50%',
						stack: [
							{ text: `No. Encounter: ${encounter.id}`, fontSize: 9 },
							{ text: `Dokter: ${doctor?.name || '-'}`, fontSize: 9 },
							{ text: `Tanggal: ${new Date(encounter.created_at).toLocaleDateString('id-ID')}`, fontSize: 9 }
						]
					}
				]
			},

			{ text: ' ', margin: [0, 10] },
			{ text: 'Subjective', style: 'subheader' },
			{ text: encounter.subjective || '-', margin: [0, 0, 0, 10] },

			{ text: 'Objective', style: 'subheader' },
			{ text: encounter.objective || '-', margin: [0, 0, 0, 5] },
			encounter.tekanan_darah ? { text: `Tekanan Darah: ${encounter.tekanan_darah} mmHg`, fontSize: 9, margin: [0, 0, 0, 10] } : {},

			{ text: 'Assessment', style: 'subheader' },
			{ text: encounter.assessment || '-', margin: [0, 0, 0, 5] },
			...(diagnoses && diagnoses.length > 0
				? [
					{ text: 'Diagnosa:', fontSize: 9, bold: true, margin: [0, 5] },
					...diagnoses.map(d => ({ text: `• [${d.code}] ${d.display}${d.is_primary ? ' (Primer)' : ''}`, fontSize: 9, margin: [10, 1] }))
				]
				: []
			),

			{ text: ' ', margin: [0, 5] },
			{ text: 'Plan', style: 'subheader' },
			{ text: encounter.plan || '-', margin: [0, 0, 0, 5] },
			...(procedures && procedures.length > 0
				? [
					{ text: 'Tindakan:', fontSize: 9, bold: true, margin: [0, 5] },
					...procedures.map(p => ({ text: `• [${p.code}] ${p.display}${p.tooth_number ? ` (Gigi ${p.tooth_number})` : ''}`, fontSize: 9, margin: [10, 1] }))
				]
				: []
			),

			{ text: ' ', margin: [0, 10] },
			{ text: 'Resep Obat', style: 'subheader' },
			...(prescriptions && prescriptions.length > 0
				? prescriptions.map(rx => ({
					text: `• ${rx.product_name} — ${rx.dosage_form || '-'} — Qty: ${rx.quantity || 0}${rx.instruction ? ` (${rx.instruction})` : ''}`,
					fontSize: 9, margin: [10, 2]
				}))
				: [{ text: 'Tidak ada resep obat', italics: true, color: '#888' }]
			),

			{ text: ' ', margin: [0, 30] },
			{
				columns: [
					{ width: '50%', text: '' },
					{
						width: '50%',
						stack: [
							{ text: `Dokter Penanggung Jawab`, alignment: 'center', fontSize: 9 },
							{ text: ' ', margin: [0, 40] },
							{ text: `(${doctor?.name || '_______________'})`, alignment: 'center', fontSize: 9 },
							{ text: doctor?.doctor_code ? `Kode: ${doctor.doctor_code}` : '', alignment: 'center', fontSize: 8, color: '#888' }
						]
					}
				]
			}
		],
		styles: {
			header: { fontSize: 14, bold: true, margin: [0, 0, 0, 4] },
			subheader: { fontSize: 11, bold: true, margin: [0, 5, 0, 3], color: '#2563EB' }
		}
	};

	return docDefinition;
}

export function generateOdontogramPDF(encounter, patient, odontogram, details, doctor) {
	// Page 1: Odontogram diagram
	// Page 2: Condition summary table
	// Page 3: SOAP notes

	const detailRows = (details || []).map(d => [
		d.tooth_number || '-',
		d.surface || '-',
		d.keadaan || '-',
		d.restorasi || '-',
		d.diagnosis_display || '-',
		d.procedure_display || '-'
	]);

	const docDefinition = {
		pageSize: 'A4',
		pageMargins: [40, 60, 40, 60],
		defaultStyle: { fontSize: 10 },
		content: [
			// Page 1: Odontogram header
			{ text: 'ODONTOGRAM', style: 'header', alignment: 'center' },
			{ text: 'Berdasarkan Standar PDGI', alignment: 'center', fontSize: 9, color: '#666', margin: [0, 0, 0, 5] },
			{ text: 'Oratio Clinic Clinic', alignment: 'center', margin: [0, 0, 0, 10] },
			{
				columns: [
					{ text: `Pasien: ${patient.nama_lengkap} (${patient.id})`, fontSize: 9 },
					{ text: `Tanggal: ${new Date(encounter.created_at).toLocaleDateString('id-ID')}`, fontSize: 9, alignment: 'right' }
				]
			},
			{ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1 }], margin: [0, 5, 0, 10] },

			// Tooth chart representation (text-based for pdfmake)
			{ text: 'Rahang Atas (Maxilla)', bold: true, alignment: 'center', margin: [0, 10] },
			{ text: '18  17  16  15  14  13  12  11  |  21  22  23  24  25  26  27  28', alignment: 'center', fontSize: 12, font: 'Courier' },
			{ text: '55  54  53  52  51  |  61  62  63  64  65', alignment: 'center', fontSize: 10, color: '#666' },
			{ text: ' ', margin: [0, 5] },
			{ canvas: [{ type: 'line', x1: 100, y1: 0, x2: 415, y2: 0, lineWidth: 2, lineColor: '#333' }] },
			{ text: ' ', margin: [0, 5] },
			{ text: '85  84  83  82  81  |  71  72  73  74  75', alignment: 'center', fontSize: 10, color: '#666' },
			{ text: '48  47  46  45  44  43  42  41  |  31  32  33  34  35  36  37  38', alignment: 'center', fontSize: 12, font: 'Courier' },
			{ text: 'Rahang Bawah (Mandible)', bold: true, alignment: 'center', margin: [0, 10, 0, 5] },

			// Odontogram metadata
			{ text: ' ', margin: [0, 10] },
			{
				table: {
					widths: ['30%', '70%'],
					body: [
						['Dentition', odontogram?.dentition_type || 'Adult'],
						['Occlusi', odontogram?.occlusi || '-'],
						['Torus Palatinus', odontogram?.torus_palatinus || '-'],
						['Torus Mandibularis', odontogram?.torus_mandibularis || '-'],
						['Palatum', odontogram?.palatum || '-'],
						['Diastema', odontogram?.diastema || 'Tidak Ada'],
						['Gigi Anomali', odontogram?.gigi_anomali || 'Tidak Ada']
					]
				},
				layout: 'lightHorizontalLines'
			},

			// Page break → Page 2: Detail table
			{ text: '', pageBreak: 'after' },
			{ text: 'DETAIL KONDISI GIGI', style: 'header', alignment: 'center' },
			{ text: ' ', margin: [0, 10] },
			detailRows.length > 0 ? {
				table: {
					headerRows: 1,
					widths: ['10%', '10%', '15%', '15%', '25%', '25%'],
					body: [
						[
							{ text: 'Gigi', bold: true },
							{ text: 'Permukaan', bold: true },
							{ text: 'Keadaan', bold: true },
							{ text: 'Restorasi', bold: true },
							{ text: 'Diagnosa', bold: true },
							{ text: 'Tindakan', bold: true }
						],
						...detailRows
					]
				},
				layout: 'lightHorizontalLines'
			} : { text: 'Tidak ada detail kondisi gigi tercatat', italics: true, color: '#888' }
		],
		styles: {
			header: { fontSize: 14, bold: true, margin: [0, 0, 0, 4] },
			subheader: { fontSize: 11, bold: true, margin: [0, 5, 0, 3] }
		}
	};

	return docDefinition;
}
