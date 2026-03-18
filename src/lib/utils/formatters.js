export function formatDate(date, locale = 'id-ID') {
	if (!date) return '-';
	return new Date(date).toLocaleDateString(locale, {
		year: 'numeric', month: 'long', day: 'numeric'
	});
}

export function formatDateTime(date, locale = 'id-ID') {
	if (!date) return '-';
	return new Date(date).toLocaleDateString(locale, {
		year: 'numeric', month: 'short', day: 'numeric',
		hour: '2-digit', minute: '2-digit'
	});
}

export function formatTime(date) {
	if (!date) return '-';
	return new Date(date).toLocaleTimeString('id-ID', {
		hour: '2-digit', minute: '2-digit'
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
	const now = new Date();
	const prefix = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${doctorCode}`;
	if (!lastId || !lastId.startsWith(prefix)) {
		return prefix + '000001';
	}
	const num = parseInt(lastId.substring(prefix.length)) + 1;
	return prefix + String(num).padStart(6, '0');
}

export function getShiftCountdown(shifts) {
	const now = new Date();
	const dayOfWeek = now.getDay();
	const currentTime = now.getHours() * 60 + now.getMinutes();

	const todayShifts = shifts
		.filter(s => s.day_of_week === dayOfWeek)
		.sort((a, b) => a.start_time.localeCompare(b.start_time));

	for (const shift of todayShifts) {
		const [startH, startM] = shift.start_time.split(':').map(Number);
		const [endH, endM] = shift.end_time.split(':').map(Number);
		const startMin = startH * 60 + startM;
		const endMin = endH * 60 + endM;

		if (currentTime >= startMin && currentTime < endMin) {
			const remaining = endMin - currentTime;
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

		if (shift.day_of_week > dayOfWeek || (shift.day_of_week === dayOfWeek && startMin > currentTime)) {
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
