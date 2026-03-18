<script>
	import { goto } from '$app/navigation';
	import SearchableSelect from '$lib/components/Forms/SearchableSelect.svelte';
	import { ALLERGY_REACTIONS, BLOOD_TYPES } from '$lib/utils/constants.js';
	import { validatePatientForm } from '$lib/utils/validators.js';
	import { addToast } from '$lib/stores/toast.js';

	let loading = false;
	let errors = {};
	let doctors = [];
	let form = {
		nik: '', nama_lengkap: '', birth_date: '', birthplace: '', gender: 'male',
		nomor_kk: '', address: '', province: '', city: '', district: '', village: '',
		rt: '', rw: '', handphone: '', email: '',
		marital_status: 'S', citizenship: 'WNI', language: 'id',
		blood_type: '', rhesus: '+', pregnancy_status: false,
		tekanan_darah: '', doctor_id: '',
		chief_complaint_code: '', chief_complaint_display: ''
	};

	let diseaseHistory = [];
	let allergies = [];
	let medications = [];

	// Load on-shift doctors
	async function loadDoctors() {
		const today = new Date().getDay();
		const res = await fetch(`/api/doctors?day=${today}`);
		const data = await res.json();
		doctors = data.doctors || [];
	}

	// Snowstorm search
	async function searchDisease(term) {
		const res = await fetch(`/api/snowstorm?term=${encodeURIComponent(term)}&type=disease`);
		const data = await res.json();
		return (data.results || []).map(r => ({ value: r.code, label: r.display || r.preferred }));
	}

	async function searchAllergy(term) {
		const res = await fetch(`/api/snowstorm?term=${encodeURIComponent(term)}&type=allergy`);
		const data = await res.json();
		return (data.results || []).map(r => ({ value: r.code, label: r.display || r.preferred }));
	}

	async function searchComplaint(term) {
		const res = await fetch(`/api/snowstorm?term=${encodeURIComponent(term)}&type=reason`);
		const data = await res.json();
		return (data.results || []).map(r => ({ value: r.code, label: r.display || r.preferred }));
	}

	async function searchMedication(term) {
		const res = await fetch(`/api/kfa?query=${encodeURIComponent(term)}`);
		const data = await res.json();
		return (data.results || []).map(r => ({ value: r.code, label: r.display }));
	}

	function addDiseaseHistory() { diseaseHistory = [...diseaseHistory, { type: 'personal', description: '', code: '' }]; }
	function removeDiseaseHistory(i) { diseaseHistory = diseaseHistory.filter((_, idx) => idx !== i); }

	function addAllergy() { allergies = [...allergies, { substance_code: '', substance_display: '', reaction_code: '', reaction_display: '' }]; }
	function removeAllergy(i) { allergies = allergies.filter((_, idx) => idx !== i); }

	function addMedication() { medications = [...medications, { code: '', display: '', dosage: '', note: '' }]; }
	function removeMedication(i) { medications = medications.filter((_, idx) => idx !== i); }

	async function handleSubmit() {
		const validation = validatePatientForm(form);
		if (!validation.valid) {
			errors = validation.errors;
			return;
		}

		if (!form.doctor_id) {
			errors.doctor_id = 'Pilih dokter';
			return;
		}

		loading = true;
		errors = {};

		try {
			// 1. Create patient
			const patientRes = await fetch('/api/patients', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					...form,
					disease_history: diseaseHistory,
					allergies,
					medications
				})
			});

			if (!patientRes.ok) {
				const err = await patientRes.json();
				addToast(err.error || 'Gagal membuat pasien', 'error');
				loading = false;
				return;
			}

			const patientData = await patientRes.json();
			const patientId = patientData.patient.id;

			// 2. Create encounter (auto-queue)
			const encRes = await fetch('/api/encounters', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					patient_id: patientId,
					doctor_id: form.doctor_id,
					chief_complaint_code: form.chief_complaint_code,
					chief_complaint_display: form.chief_complaint_display,
					tekanan_darah: form.tekanan_darah
				})
			});

			if (!encRes.ok) {
				const err = await encRes.json();
				addToast(err.error || 'Gagal membuat antrian', 'error');
				loading = false;
				return;
			}

			const encData = await encRes.json();

			addToast(`Pasien ${form.nama_lengkap} ditambahkan ke antrian #${encData.queue_number}`, 'success');
			goto('/kasir');
		} catch (err) {
			addToast('Terjadi kesalahan', 'error');
		} finally {
			loading = false;
		}
	}

	import { onMount } from 'svelte';
	onMount(loadDoctors);
</script>

<svelte:head>
	<title>Pasien Baru — Oratio Dental</title>
</svelte:head>

<div>
	<div class="flex items-center justify-between mb-6">
		<h1 class="page-title" style="margin: 0;">Registrasi Pasien Baru</h1>
		<a href="/kasir" class="btn btn-secondary">← Kembali</a>
	</div>

	<form on:submit|preventDefault={handleSubmit}>
		<!-- Identity -->
		<div class="card mb-6">
			<h3 class="card-title mb-4">📋 Data Identitas</h3>
			<div class="form-row">
				<div class="form-group">
					<label class="form-label">NIK <span class="required">*</span></label>
					<input class="form-input" class:error={errors.nik} bind:value={form.nik} maxlength="16" placeholder="16 digit NIK" />
					{#if errors.nik}<span class="form-error">{errors.nik}</span>{/if}
				</div>
				<div class="form-group">
					<label class="form-label">Nama Lengkap <span class="required">*</span></label>
					<input class="form-input" class:error={errors.nama_lengkap} bind:value={form.nama_lengkap} />
					{#if errors.nama_lengkap}<span class="form-error">{errors.nama_lengkap}</span>{/if}
				</div>
			</div>
			<div class="form-row mt-4">
				<div class="form-group">
					<label class="form-label">Tanggal Lahir <span class="required">*</span></label>
					<input type="date" class="form-input" class:error={errors.birth_date} bind:value={form.birth_date} />
					{#if errors.birth_date}<span class="form-error">{errors.birth_date}</span>{/if}
				</div>
				<div class="form-group">
					<label class="form-label">Tempat Lahir</label>
					<input class="form-input" bind:value={form.birthplace} />
				</div>
				<div class="form-group">
					<label class="form-label">Jenis Kelamin <span class="required">*</span></label>
					<select class="form-select" bind:value={form.gender}>
						<option value="male">Laki-laki</option>
						<option value="female">Perempuan</option>
					</select>
				</div>
			</div>
			<div class="form-row mt-4">
				<div class="form-group">
					<label class="form-label">Nomor KK</label>
					<input class="form-input" bind:value={form.nomor_kk} maxlength="16" />
				</div>
				<div class="form-group">
					<label class="form-label">Status Perkawinan</label>
					<select class="form-select" bind:value={form.marital_status}>
						<option value="S">Belum Menikah</option>
						<option value="M">Menikah</option>
						<option value="W">Janda/Duda</option>
						<option value="D">Cerai</option>
					</select>
				</div>
				<div class="form-group">
					<label class="form-label">Kewarganegaraan</label>
					<select class="form-select" bind:value={form.citizenship}>
						<option value="WNI">WNI</option>
						<option value="WNA">WNA</option>
					</select>
				</div>
			</div>
		</div>

		<!-- Address -->
		<div class="card mb-6">
			<h3 class="card-title mb-4">📍 Alamat</h3>
			<div class="form-group">
				<label class="form-label">Alamat Lengkap <span class="required">*</span></label>
				<textarea class="form-textarea" class:error={errors.address} bind:value={form.address} rows="2"></textarea>
				{#if errors.address}<span class="form-error">{errors.address}</span>{/if}
			</div>
			<div class="form-row mt-4">
				<div class="form-group">
					<label class="form-label">Provinsi</label>
					<input class="form-input" bind:value={form.province} />
				</div>
				<div class="form-group">
					<label class="form-label">Kota/Kabupaten</label>
					<input class="form-input" bind:value={form.city} />
				</div>
				<div class="form-group">
					<label class="form-label">Kecamatan</label>
					<input class="form-input" bind:value={form.district} />
				</div>
			</div>
			<div class="form-row mt-4">
				<div class="form-group">
					<label class="form-label">Kelurahan/Desa</label>
					<input class="form-input" bind:value={form.village} />
				</div>
				<div class="form-group">
					<label class="form-label">RT</label>
					<input class="form-input" bind:value={form.rt} maxlength="5" />
				</div>
				<div class="form-group">
					<label class="form-label">RW</label>
					<input class="form-input" bind:value={form.rw} maxlength="5" />
				</div>
			</div>
		</div>

		<!-- Contact & Medical -->
		<div class="card mb-6">
			<h3 class="card-title mb-4">🩺 Data Medis & Kontak</h3>
			<div class="form-row">
				<div class="form-group">
					<label class="form-label">Handphone</label>
					<input class="form-input" bind:value={form.handphone} placeholder="08xx-xxxx-xxxx" />
					{#if errors.handphone}<span class="form-error">{errors.handphone}</span>{/if}
				</div>
				<div class="form-group">
					<label class="form-label">Email</label>
					<input type="email" class="form-input" bind:value={form.email} />
					{#if errors.email}<span class="form-error">{errors.email}</span>{/if}
				</div>
			</div>
			<div class="form-row mt-4">
				<div class="form-group">
					<label class="form-label">Golongan Darah <span class="required">*</span></label>
					<select class="form-select" class:error={errors.blood_type} bind:value={form.blood_type}>
						<option value="">-- Pilih --</option>
						{#each BLOOD_TYPES as bt}
							<option value={bt}>{bt}</option>
						{/each}
					</select>
					{#if errors.blood_type}<span class="form-error">{errors.blood_type}</span>{/if}
				</div>
				<div class="form-group">
					<label class="form-label">Rhesus</label>
					<select class="form-select" bind:value={form.rhesus}>
						<option value="+">Positif (+)</option>
						<option value="-">Negatif (-)</option>
					</select>
				</div>
				<div class="form-group">
					<label class="form-label">Status Kehamilan</label>
					<select class="form-select" bind:value={form.pregnancy_status}>
						<option value={false}>Tidak</option>
						<option value={true}>Ya</option>
					</select>
				</div>
			</div>
			<div class="form-row mt-4">
				<div class="form-group">
					<label class="form-label">Tekanan Darah</label>
					<input class="form-input" bind:value={form.tekanan_darah} placeholder="120/80" />
					{#if errors.tekanan_darah}<span class="form-error">{errors.tekanan_darah}</span>{/if}
				</div>
			</div>
		</div>

		<!-- Doctor Assignment -->
		<div class="card mb-6">
			<h3 class="card-title mb-4">👨‍⚕️ Penugasan Dokter</h3>
			<div class="form-row">
				<div class="form-group">
					<label class="form-label">Kode Dokter <span class="required">*</span></label>
					<select class="form-select" class:error={errors.doctor_id} bind:value={form.doctor_id}>
						<option value="">-- Pilih Dokter (On-Shift Hari Ini) --</option>
						{#each doctors as doc}
							<option value={doc.id}>{doc.name} ({doc.doctor_code})</option>
						{/each}
					</select>
					{#if errors.doctor_id}<span class="form-error">{errors.doctor_id}</span>{/if}
					{#if doctors.length === 0}
						<span class="form-hint">Tidak ada dokter on-shift hari ini</span>
					{/if}
				</div>
			</div>
			<div class="form-row mt-4">
				<SearchableSelect
					label="Keluhan Utama"
					placeholder="Cari keluhan (SNOMED)..."
					searchFn={searchComplaint}
					bind:value={form.chief_complaint_code}
					on:select={(e) => { form.chief_complaint_display = e.detail.label; }}
				/>
			</div>
		</div>

		<!-- Disease History -->
		<div class="card mb-6">
			<div class="card-header">
				<h3 class="card-title">📝 Riwayat Penyakit</h3>
				<button type="button" class="btn btn-secondary btn-sm" on:click={addDiseaseHistory}>+ Tambah</button>
			</div>
			{#each diseaseHistory as item, i}
				<div class="flex gap-3 items-end mt-2">
					<div class="form-group" style="flex: 0 0 120px;">
						<select class="form-select" bind:value={item.type}>
							<option value="personal">Pribadi</option>
							<option value="family">Keluarga</option>
						</select>
					</div>
					<div class="form-group" style="flex: 1;">
						<input class="form-input" bind:value={item.description} placeholder="Deskripsi penyakit" />
					</div>
					<button type="button" class="btn btn-danger btn-sm btn-icon" on:click={() => removeDiseaseHistory(i)}>✕</button>
				</div>
			{/each}
			{#if diseaseHistory.length === 0}
				<p class="text-sm text-muted mt-2">Belum ada riwayat penyakit</p>
			{/if}
		</div>

		<!-- Allergies -->
		<div class="card mb-6">
			<div class="card-header">
				<h3 class="card-title">⚠️ Alergi</h3>
				<button type="button" class="btn btn-secondary btn-sm" on:click={addAllergy}>+ Tambah</button>
			</div>
			{#each allergies as item, i}
				<div class="flex gap-3 items-end mt-2">
					<div class="form-group" style="flex: 1;">
						<SearchableSelect
							placeholder="Cari substansi..."
							searchFn={searchAllergy}
							bind:value={item.substance_code}
							on:select={(e) => { item.substance_display = e.detail.label; }}
						/>
					</div>
					<div class="form-group" style="flex: 1;">
						<select class="form-select" bind:value={item.reaction_code} on:change={(e) => {
							const sel = ALLERGY_REACTIONS.find(r => r.code === item.reaction_code);
							if (sel) item.reaction_display = sel.display;
						}}>
							<option value="">-- Reaksi --</option>
							{#each ALLERGY_REACTIONS as r}
								<option value={r.code}>{r.display}</option>
							{/each}
						</select>
					</div>
					<button type="button" class="btn btn-danger btn-sm btn-icon" on:click={() => removeAllergy(i)}>✕</button>
				</div>
			{/each}
			{#if allergies.length === 0}
				<p class="text-sm text-muted mt-2">Belum ada data alergi</p>
			{/if}
		</div>

		<!-- Medications -->
		<div class="card mb-6">
			<div class="card-header">
				<h3 class="card-title">💊 Riwayat Pengobatan</h3>
				<button type="button" class="btn btn-secondary btn-sm" on:click={addMedication}>+ Tambah</button>
			</div>
			{#each medications as item, i}
				<div class="flex gap-3 items-end mt-2">
					<div class="form-group" style="flex: 1;">
						<SearchableSelect
							placeholder="Cari obat (KFA)..."
							searchFn={searchMedication}
							bind:value={item.code}
							on:select={(e) => { item.display = e.detail.label; }}
						/>
					</div>
					<div class="form-group" style="flex: 0 0 150px;">
						<input class="form-input" bind:value={item.dosage} placeholder="Dosis" />
					</div>
					<button type="button" class="btn btn-danger btn-sm btn-icon" on:click={() => removeMedication(i)}>✕</button>
				</div>
			{/each}
			{#if medications.length === 0}
				<p class="text-sm text-muted mt-2">Belum ada riwayat pengobatan</p>
			{/if}
		</div>

		<!-- Submit -->
		<div class="flex justify-between">
			<a href="/kasir" class="btn btn-secondary">Batal</a>
			<button type="submit" class="btn btn-primary btn-lg" disabled={loading}>
				{#if loading}
					<span class="spinner"></span> Memproses...
				{:else}
					➕ Daftarkan & Antri
				{/if}
			</button>
		</div>
	</form>
</div>
