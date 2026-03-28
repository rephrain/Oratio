// Payment type options
export const PAYMENT_TYPES = [
	{ label: 'ORATIO BCA DEBIT', code: 'EDC-B1' },
	{ label: 'ORATIO BCA CREDIT', code: 'EDC-B2' },
	{ label: 'ORATIO BCA SWITCHING', code: 'EDC-B3' },
	{ label: 'ORATIO MANDIRI DEBIT', code: 'EDC-OO' },
	{ label: 'ORATIO MANDIRI CREDIT', code: 'EDC-OQ' },
	{ label: 'ORATIO MANDIRI SWITCHING', code: 'EDC-OP' },
	{ label: 'KUO BCA DEBIT', code: 'EDC-B4' },
	{ label: 'KUO BCA CREDIT', code: 'EDC-B5' },
	{ label: 'KUO BCA SWITCHING', code: 'EDC-B6' },
	{ label: 'KUO MANDIRI DEBIT', code: 'EDC-KO' },
	{ label: 'KUO MANDIRI CREDIT', code: 'EDC-KQ' },
	{ label: 'KUO MANDIRI SWITCHING', code: 'EDC-KP' },
	{ label: 'ASURANSI', code: 'A-ASS1' },
	{ label: 'TUNAI', code: 'K-01' },
	{ label: 'AR-PIUTANG', code: '' },
	{ label: 'QRIS', code: 'E-QRIS' },
	{ label: 'NO PAYMENT', code: '-' },
	{ label: 'TRANSFER BCA 7773778789', code: 'B-BCA' },
	{ label: 'TRANSFER MANDIRI 1310072789789', code: 'B-MDR' }
];

// Encounter statuses
export const ENCOUNTER_STATUSES = [
	'Planned', 'Arrived', 'In Progress', 'On Hold',
	'Discharged', 'Completed', 'Cancelled', 'Discontinued'
];

// Status colors
export const STATUS_COLORS = {
	'Planned': 'badge-info',
	'Arrived': 'badge-warning',
	'In Progress': 'badge-primary',
	'On Hold': 'badge-gray',
	'Discharged': 'badge-success',
	'Completed': 'badge-success',
	'Cancelled': 'badge-danger',
	'Discontinued': 'badge-danger'
};

// Queue board columns
export const QUEUE_COLUMNS = [
	{ key: 'waiting', label: 'Menunggu', statuses: ['Planned', 'Arrived'] },
	{ key: 'inprogress', label: 'Dalam Proses', statuses: ['In Progress'] },
	{ key: 'discharged', label: 'Selesai Pemeriksaan', statuses: ['Discharged'] },
	{ key: 'completed', label: 'Selesai', statuses: ['Completed'] }
];

// Days of week
export const DAYS_OF_WEEK = [
	'Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'
];

// Blood types
export const BLOOD_TYPES = ['A', 'B', 'AB', 'O'];

// Allergy reactions — exact 30 items from the original spec
export const ALLERGY_REACTIONS = [
	{ code: '1985008', display: 'Vomitus' },
	{ code: '4386001', display: 'Bronchospasm' },
	{ code: '9826008', display: 'Conjunctivitis' },
	{ code: '23924001', display: 'Tight chest' },
	{ code: '24079001', display: 'Atopic dermatitis' },
	{ code: '31996006', display: 'Vasculitis' },
	{ code: '39579001', display: 'Anaphylaxis' },
	{ code: '41291007', display: 'Angioedema' },
	{ code: '43116000', display: 'Eczema' },
	{ code: '49727002', display: 'Cough' },
	{ code: '51599000', display: 'Edema of larynx' },
	{ code: '62315008', display: 'Diarrhea' },
	{ code: '70076002', display: 'Rhinitis' },
	{ code: '73442001', display: 'Stevens-Johnson syndrome' },
	{ code: '76067001', display: 'Sneezing' },
	{ code: '91175000', display: 'Seizure' },
	{ code: '126485001', display: 'Urticaria' },
	{ code: '162290004', display: 'Dry eyes' },
	{ code: '195967001', display: 'Asthma' },
	{ code: '247472004', display: 'Wheal' },
	{ code: '267036007', display: 'Dyspnea' },
	{ code: '271757001', display: 'Papular eruption' },
	{ code: '271759003', display: 'Bullous eruption' },
	{ code: '271807003', display: 'Eruption of skin' },
	{ code: '410430005', display: 'Cardiorespiratory arrest' },
	{ code: '418363000', display: 'Itching of skin' },
	{ code: '422587007', display: 'Nausea' },
	{ code: '698247007', display: 'Cardiac arrhythmia' },
	{ code: '702809001', display: 'Drug reaction with eosinophilia and systemic symptoms' },
	{ code: '768962006', display: 'Lyell syndrome' }
];

// Tooth numbers for odontogram
export const PERMANENT_TEETH = {
	upper_right: ['18', '17', '16', '15', '14', '13', '12', '11'],
	upper_left: ['21', '22', '23', '24', '25', '26', '27', '28'],
	lower_right: ['48', '47', '46', '45', '44', '43', '42', '41'],
	lower_left: ['31', '32', '33', '34', '35', '36', '37', '38']
};

export const DECIDUOUS_TEETH = {
	upper_right: ['55', '54', '53', '52', '51'],
	upper_left: ['61', '62', '63', '64', '65'],
	lower_right: ['85', '84', '83', '82', '81'],
	lower_left: ['71', '72', '73', '74', '75']
};

// Tooth surfaces
export const TOOTH_SURFACES = [
	{ key: 'O', label: 'Occlusal' },
	{ key: 'B', label: 'Buccal/Labial' },
	{ key: 'L', label: 'Lingual/Palatal' },
	{ key: 'M', label: 'Mesial' },
	{ key: 'D', label: 'Distal' }
];

// Odontogram dropdown options (per spec)
export const OCCLUSI_OPTIONS = ['Normal Bite', 'Cross Bite', 'Steep Bite'];

export const TORUS_PALATINUS_OPTIONS = ['Tidak Ada', 'Kecil', 'Sedang', 'Besar', 'Multiple'];

export const TORUS_MANDIBULARIS_OPTIONS = ['Tidak Ada', 'Sisi Kiri', 'Sisi Kanan', 'Kedua Sisi'];

export const PALATUM_OPTIONS = ['Dalam', 'Sedang', 'Rendah'];

// SOAP-WHO Reason categories
export const REASON_CATEGORIES = [
	{ key: 'finding', label: 'Finding', snomedCode: '404684003' },
	{ key: 'procedure', label: 'Procedure', snomedCode: '71388002' },
	{ key: 'situation', label: 'Situation', snomedCode: '243796009' },
	{ key: 'event', label: 'Event', snomedCode: '272379006' }
];

// Admin table names mapped to schema keys
export const ADMIN_TABLES = {
	'users': { label: 'Users', schema: 'users' },
	'doctor-shifts': { label: 'Doctor Shifts', schema: 'doctorShifts' },
	'patients': { label: 'Patients', schema: 'patients' },
	'patient-disease-history': { label: 'Patient Disease History', schema: 'patientDiseaseHistory' },
	'patient-allergy': { label: 'Patient Allergy', schema: 'patientAllergy' },
	'patient-medication': { label: 'Patient Medication', schema: 'patientMedication' },
	'terminology': { label: 'Terminology Master', schema: 'terminologyMaster' },
	'documents': { label: 'Documents', schema: 'documents' },
	'encounters': { label: 'Encounters', schema: 'encounters' },
	'status-history': { label: 'Status History', schema: 'statusHistory' },
	'encounter-odontograms': { label: 'Encounter Odontograms', schema: 'encounterOdontograms' },
	'odontogram-details': { label: 'Odontogram Details', schema: 'odontogramDetails' },
	'encounter-prescriptions': { label: 'Encounter Prescriptions', schema: 'encounterPrescriptions' },
	'encounter-referrals': { label: 'Encounter Referrals', schema: 'encounterReferrals' },
	'encounter-diagnoses': { label: 'Encounter Diagnoses', schema: 'encounterDiagnoses' },
	'encounter-procedures': { label: 'Encounter Procedures', schema: 'encounterProcedures' },
	'items': { label: 'Items', schema: 'items' },
	'encounter-items': { label: 'Encounter Items', schema: 'encounterItems' },
	'payments': { label: 'Payments', schema: 'payments' }
};

// Doctor codes mapping (14 doctors from spec)
export const DOCTOR_CODES = [
	{ code: 'BS', name: 'drg. Badi Soerachman, Sp.KG' },
	{ code: 'MK', name: 'drg. Merrida Kartawidjaja, Sp.KG' },
	{ code: 'MM', name: 'drg. Maya Mukti Sari, Sp.KG' },
	{ code: 'MG', name: 'drg. Monique Gabriela' },
	{ code: 'ER', name: 'drg. Erika Subiyanto, Sp.KGA' },
	{ code: 'HH', name: 'drg. Henri Hartman, Sp.KGA' },
	{ code: 'FL', name: 'drg. Felicia Melati, Sp.KGA' },
	{ code: 'CY', name: 'drg. Cynthia Tanujaya' },
	{ code: 'AM', name: 'drg. Arismunandar, Sp.BM' },
	{ code: 'AA', name: 'drg. Asri Arumsari, Sp.BM(K), MMRS' },
	{ code: 'EK', name: 'drg. Eka Marwansyah Oli\'i, Sp.BM(K)' },
	{ code: 'HS', name: 'drg. Helmi Siti Aminah, Sp.Pros' },
	{ code: 'WA', name: 'drg. Wenny Awalia, Sp.Pros' },
	{ code: 'WD', name: 'drg. Widia Hafsyah, Sp.Perio' }
];
