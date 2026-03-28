const PAYMENT_TYPES = [
  { label: "ORATIO BCA DEBIT", code: "EDC-B1" },
  { label: "ORATIO BCA CREDIT", code: "EDC-B2" },
  { label: "ORATIO BCA SWITCHING", code: "EDC-B3" },
  { label: "ORATIO MANDIRI DEBIT", code: "EDC-OO" },
  { label: "ORATIO MANDIRI CREDIT", code: "EDC-OQ" },
  { label: "ORATIO MANDIRI SWITCHING", code: "EDC-OP" },
  { label: "KUO BCA DEBIT", code: "EDC-B4" },
  { label: "KUO BCA CREDIT", code: "EDC-B5" },
  { label: "KUO BCA SWITCHING", code: "EDC-B6" },
  { label: "KUO MANDIRI DEBIT", code: "EDC-KO" },
  { label: "KUO MANDIRI CREDIT", code: "EDC-KQ" },
  { label: "KUO MANDIRI SWITCHING", code: "EDC-KP" },
  { label: "ASURANSI", code: "A-ASS1" },
  { label: "TUNAI", code: "K-01" },
  { label: "AR-PIUTANG", code: "" },
  { label: "QRIS", code: "E-QRIS" },
  { label: "NO PAYMENT", code: "-" },
  { label: "TRANSFER BCA 7773778789", code: "B-BCA" },
  { label: "TRANSFER MANDIRI 1310072789789", code: "B-MDR" }
];
const QUEUE_COLUMNS = [
  { key: "waiting", label: "Menunggu", statuses: ["Planned", "Arrived"] },
  { key: "inprogress", label: "Dalam Proses", statuses: ["In Progress"] },
  { key: "discharged", label: "Selesai Pemeriksaan", statuses: ["Discharged"] },
  { key: "completed", label: "Selesai", statuses: ["Completed"] }
];
const BLOOD_TYPES = ["A", "B", "AB", "O"];
const ALLERGY_REACTIONS = [
  { code: "1985008", display: "Vomitus" },
  { code: "4386001", display: "Bronchospasm" },
  { code: "9826008", display: "Conjunctivitis" },
  { code: "23924001", display: "Tight chest" },
  { code: "24079001", display: "Atopic dermatitis" },
  { code: "31996006", display: "Vasculitis" },
  { code: "39579001", display: "Anaphylaxis" },
  { code: "41291007", display: "Angioedema" },
  { code: "43116000", display: "Eczema" },
  { code: "49727002", display: "Cough" },
  { code: "51599000", display: "Edema of larynx" },
  { code: "62315008", display: "Diarrhea" },
  { code: "70076002", display: "Rhinitis" },
  { code: "73442001", display: "Stevens-Johnson syndrome" },
  { code: "76067001", display: "Sneezing" },
  { code: "91175000", display: "Seizure" },
  { code: "126485001", display: "Urticaria" },
  { code: "162290004", display: "Dry eyes" },
  { code: "195967001", display: "Asthma" },
  { code: "247472004", display: "Wheal" },
  { code: "267036007", display: "Dyspnea" },
  { code: "271757001", display: "Papular eruption" },
  { code: "271759003", display: "Bullous eruption" },
  { code: "271807003", display: "Eruption of skin" },
  { code: "410430005", display: "Cardiorespiratory arrest" },
  { code: "418363000", display: "Itching of skin" },
  { code: "422587007", display: "Nausea" },
  { code: "698247007", display: "Cardiac arrhythmia" },
  { code: "702809001", display: "Drug reaction with eosinophilia and systemic symptoms" },
  { code: "768962006", display: "Lyell syndrome" }
];
const TOOTH_SURFACES = [
  { key: "O", label: "Occlusal" },
  { key: "B", label: "Buccal/Labial" },
  { key: "L", label: "Lingual/Palatal" },
  { key: "M", label: "Mesial" },
  { key: "D", label: "Distal" }
];
const ADMIN_TABLES = {
  "users": { label: "Users", schema: "users" },
  "doctor-shifts": { label: "Doctor Shifts", schema: "doctorShifts" },
  "patients": { label: "Patients", schema: "patients" },
  "patient-disease-history": { label: "Patient Disease History", schema: "patientDiseaseHistory" },
  "patient-allergy": { label: "Patient Allergy", schema: "patientAllergy" },
  "patient-medication": { label: "Patient Medication", schema: "patientMedication" },
  "terminology": { label: "Terminology Master", schema: "terminologyMaster" },
  "documents": { label: "Documents", schema: "documents" },
  "encounters": { label: "Encounters", schema: "encounters" },
  "status-history": { label: "Status History", schema: "statusHistory" },
  "encounter-odontograms": { label: "Encounter Odontograms", schema: "encounterOdontograms" },
  "odontogram-details": { label: "Odontogram Details", schema: "odontogramDetails" },
  "encounter-prescriptions": { label: "Encounter Prescriptions", schema: "encounterPrescriptions" },
  "encounter-referrals": { label: "Encounter Referrals", schema: "encounterReferrals" },
  "encounter-diagnoses": { label: "Encounter Diagnoses", schema: "encounterDiagnoses" },
  "encounter-procedures": { label: "Encounter Procedures", schema: "encounterProcedures" },
  "items": { label: "Items", schema: "items" },
  "encounter-items": { label: "Encounter Items", schema: "encounterItems" },
  "payments": { label: "Payments", schema: "payments" }
};

export { ADMIN_TABLES as A, BLOOD_TYPES as B, PAYMENT_TYPES as P, QUEUE_COLUMNS as Q, TOOTH_SURFACES as T, ALLERGY_REACTIONS as a };
//# sourceMappingURL=constants-6ed35477.js.map
