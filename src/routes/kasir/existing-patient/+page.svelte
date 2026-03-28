<script>
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import SearchableSelect from '$lib/components/Forms/SearchableSelect.svelte';
	import { addToast } from '$lib/stores/toast.js';

	let loading = false;
	let doctors = [];
	let selectedPatient = null;
	let doctorId = '';
	let referralSource = '';

	async function loadDoctors() {
		const today = new Date().getDay();
		const res = await fetch(`/api/doctors?day=${today}`);
		const data = await res.json();
		doctors = data.doctors || [];
	}

	async function searchPatient(term) {
		const res = await fetch(`/api/patients?search=${encodeURIComponent(term)}&limit=10`);
		const data = await res.json();
		return (data.data || []).map(p => ({
			value: p.id,
			label: `${p.nama_lengkap} (${p.id})`,
			sublabel: `NIK: ${p.nik || '-'}`,
			patient: p
		}));
	}

	function handlePatientSelect(e) {
		selectedPatient = e.detail.patient || null;
	}

	async function handleSubmit() {
		if (!selectedPatient || !doctorId) {
			addToast('Pilih pasien dan dokter', 'error');
			return;
		}

		loading = true;
		try {
			const res = await fetch('/api/encounters', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					patient_id: selectedPatient.id,
					doctor_id: doctorId,
					referral_source: referralSource || null
				})
			});

			if (!res.ok) {
				const err = await res.json();
				addToast(err.error || 'Gagal membuat antrian', 'error');
				return;
			}

			const data = await res.json();
			addToast(`${selectedPatient.nama_lengkap} ditambahkan ke antrian #${data.queue_number}`, 'success');
			goto('/kasir');
		} catch {
			addToast('Terjadi kesalahan', 'error');
		} finally {
			loading = false;
		}
	}

	onMount(loadDoctors);
</script>

<svelte:head>
	<title>Pasien Lama — Oratio Dental</title>
</svelte:head>

<div>
	<div class="flex items-center justify-between mb-6">
		<h1 class="page-title" style="margin: 0;">Pendaftaran Pasien Lama</h1>
		<a href="/kasir" class="btn btn-secondary">← Kembali</a>
	</div>

	<form on:submit|preventDefault={handleSubmit}>
		<div class="card mb-6">
			<h3 class="card-title mb-4">🔍 Cari Pasien</h3>
			<SearchableSelect
				label="Cari berdasarkan Nama, NIK, atau No. RM"
				placeholder="Ketik minimal 2 karakter..."
				searchFn={searchPatient}
				on:select={handlePatientSelect}
				on:clear={() => selectedPatient = null}
			/>
		</div>

		{#if selectedPatient}
			<div class="card mb-6">
				<h3 class="card-title mb-4">📋 Data Pasien</h3>
				<div class="grid grid-3 gap-4">
					<div>
						<span class="text-sm text-muted">No. Rekam Medis</span>
						<p class="font-semibold">{selectedPatient.id}</p>
					</div>
					<div>
						<span class="text-sm text-muted">Nama Lengkap</span>
						<p class="font-semibold">{selectedPatient.nama_lengkap}</p>
					</div>
					<div>
						<span class="text-sm text-muted">NIK</span>
						<p class="font-semibold">{selectedPatient.nik || '-'}</p>
					</div>
					<div>
						<span class="text-sm text-muted">Tanggal Lahir</span>
						<p>{selectedPatient.birth_date || '-'}</p>
					</div>
					<div>
						<span class="text-sm text-muted">Jenis Kelamin</span>
						<p>{selectedPatient.gender === 'male' ? 'Laki-laki' : 'Perempuan'}</p>
					</div>
					<div>
						<span class="text-sm text-muted">Golongan Darah</span>
						<p>{selectedPatient.blood_type || '-'}{selectedPatient.rhesus || ''}</p>
					</div>
				</div>
			</div>

			<div class="card mb-6">
				<h3 class="card-title mb-4">👨‍⚕️ Penugasan</h3>
				<div class="form-row">
					<div class="form-group">
						<label class="form-label" for="doctor-assign-sel">Kode Dokter <span class="required">*</span></label>
						<select id="doctor-assign-sel" class="form-select" bind:value={doctorId} required>
							<option value="">-- Pilih Dokter (On-Shift Hari Ini) --</option>
							{#each doctors as doc}
								<option value={doc.id}>{doc.name} ({doc.doctor_code})</option>
							{/each}
						</select>
					</div>
					<div class="form-group">
						<label class="form-label" for="rujukan-inp">Sumber Rujukan</label>
						<input id="rujukan-inp" class="form-input" bind:value={referralSource} placeholder="Opsional" />
					</div>
				</div>
			</div>

			<div class="flex justify-between">
				<a href="/kasir" class="btn btn-secondary">Batal</a>
				<button type="submit" class="btn btn-primary btn-lg" disabled={loading}>
					{#if loading}
						<span class="spinner"></span> Memproses...
					{:else}
						➕ Tambahkan ke Antrian
					{/if}
				</button>
			</div>
		{/if}
	</form>
</div>
