export function validateNIK(nik) {
	if (!nik) return true; // optional
	return /^\d{16}$/.test(nik);
}

export function validateRequired(value, fieldName) {
	if (!value || (typeof value === 'string' && !value.trim())) {
		return `${fieldName} wajib diisi`;
	}
	return null;
}

export function validateEmail(email) {
	if (!email) return null;
	const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return re.test(email) ? null : 'Format email tidak valid';
}

export function validatePhone(phone) {
	if (!phone) return null;
	return /^[0-9+\-\s]{8,15}$/.test(phone) ? null : 'Format nomor telepon tidak valid';
}

export function validateBloodPressure(bp) {
	if (!bp) return null;
	return /^\d{2,3}\/\d{2,3}$/.test(bp) ? null : 'Format: XXX/XXX mmHg';
}

export function validatePatientForm(data) {
	const errors = {};

	const nikErr = validateRequired(data.nik, 'NIK');
	if (nikErr) errors.nik = nikErr;
	else if (!validateNIK(data.nik)) errors.nik = 'NIK harus 16 digit';

	const namaErr = validateRequired(data.nama_lengkap, 'Nama Lengkap');
	if (namaErr) errors.nama_lengkap = namaErr;

	const birthErr = validateRequired(data.birth_date, 'Tanggal Lahir');
	if (birthErr) errors.birth_date = birthErr;

	const genderErr = validateRequired(data.gender, 'Jenis Kelamin');
	if (genderErr) errors.gender = genderErr;

	if (!data.blood_type) errors.blood_type = 'Golongan darah wajib diisi';

	const addrErr = validateRequired(data.address, 'Alamat');
	if (addrErr) errors.address = addrErr;

	const bpErr = validateBloodPressure(data.tekanan_darah);
	if (bpErr) errors.tekanan_darah = bpErr;

	const emailErr = validateEmail(data.email);
	if (emailErr) errors.email = emailErr;

	const phoneErr = validatePhone(data.handphone);
	if (phoneErr) errors.handphone = phoneErr;

	return { valid: Object.keys(errors).length === 0, errors };
}
