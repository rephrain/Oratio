<script>
	import { page } from "$app/stores";
	import { onMount } from "svelte";
	import DataTable from "$lib/components/Tables/DataTable.svelte";
	import { formatDate, formatCurrency } from "$lib/utils/formatters.js";
	import { STATUS_COLORS } from "$lib/utils/constants.js";

	const patientId = $page.params.patientId;
	let patient = null;
	let encounters = [];
	let loading = true;

	async function loadPatient() {
		try {
			const res = await fetch(
				`/api/patients?search=${patientId}&limit=1`,
			);
			const data = await res.json();
			patient = data.data?.[0] || null;

			const encRes = await fetch(
				`/api/encounters?patient_id=${patientId}&limit=50`,
			);
			const encData = await encRes.json();
			encounters = encData.data || [];
		} catch (err) {
			console.error(err);
		} finally {
			loading = false;
		}
	}

	const encColumns = [
		{ key: "id", label: "ID", format: (_, r) => r.encounter?.id || "-" },
		{
			key: "date",
			label: "Tanggal",
			format: (_, r) => formatDate(r.encounter?.created_at),
		},
		{
			key: "status",
			label: "Status",
			format: (_, r) => r.encounter?.status || "-",
		},
		{
			key: "mode",
			label: "Mode",
			format: (_, r) => r.encounter?.form_mode || "-",
		},
		{
			key: "doctor",
			label: "Dokter",
			format: (_, r) => r.doctor_name || "-",
		},
	];

	onMount(loadPatient);
</script>

<svelte:head>
	<title>Pasien {patientId} — Oratio Clinic</title>
</svelte:head>

<div>
	<div class="flex items-center justify-between mb-6">
		<h1 class="page-title" style="margin: 0;">Detail Pasien</h1>
		<a href="/dokter" class="btn btn-secondary">← Kembali</a>
	</div>

	{#if loading}
		<div style="text-align: center; padding: var(--space-16);">
			<div class="spinner spinner-lg" style="margin: 0 auto;"></div>
		</div>
	{:else if patient}
		<div class="card mb-6">
			<h3 class="card-title mb-4">📋 Informasi Pasien</h3>
			<div class="grid grid-3 gap-4">
				<div>
					<span class="text-sm text-muted">No. RM</span>
					<p class="font-semibold">{patient.id}</p>
				</div>
				<div>
					<span class="text-sm text-muted">Nama</span>
					<p class="font-semibold">{patient.nama_lengkap}</p>
				</div>
				<div>
					<span class="text-sm text-muted">NIK</span>
					<p>{patient.nik || "-"}</p>
				</div>
				<div>
					<span class="text-sm text-muted">Tanggal Lahir</span>
					<p>{patient.birth_date || "-"}</p>
				</div>
				<div>
					<span class="text-sm text-muted">Jenis Kelamin</span>
					<p>
						{patient.gender === "male" ? "Laki-laki" : "Perempuan"}
					</p>
				</div>
				<div>
					<span class="text-sm text-muted">Gol. Darah</span>
					<p>{patient.blood_type || "-"}{patient.rhesus || ""}</p>
				</div>
				<div>
					<span class="text-sm text-muted">Telepon</span>
					<p>{patient.handphone || "-"}</p>
				</div>
				<div>
					<span class="text-sm text-muted">Email</span>
					<p>{patient.email || "-"}</p>
				</div>
				<div>
					<span class="text-sm text-muted">Alamat</span>
					<p>{patient.address || "-"}</p>
				</div>
			</div>
		</div>

		<div class="card">
			<h3 class="card-title mb-4">📊 Riwayat Encounter</h3>
			<DataTable
				data={encounters}
				columns={encColumns}
				total={encounters.length}
				limit={100}
				searchable={false}
			/>
		</div>
	{:else}
		<div class="empty-state">
			<div class="empty-state-icon">❌</div>
			<div class="empty-state-title">Pasien tidak ditemukan</div>
		</div>
	{/if}
</div>
