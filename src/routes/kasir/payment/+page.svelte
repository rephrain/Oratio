<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { PAYMENT_TYPES } from '$lib/utils/constants.js';
	import { formatCurrency } from '$lib/utils/formatters.js';
	import { addToast } from '$lib/stores/toast.js';

	export let data;
	$: cashierName = data?.user?.name || 'Kasir';

	let loading = false;
	let dischargedEncounters = [];
	let selectedEncounterId = '';
	let encounterDetail = null;
	let items = [];

	// Payment form
	let paymentMode = 'NORMAL';
	let paymentType = '';
	let paymentCode = '';
	let cardNumber = '';
	let discountType = 'percent'; // 'percent' | 'fixed'
	let discountValue = 0;
	let note = '';

	$: selectedPaymentType = PAYMENT_TYPES.find(pt => pt.label === paymentType);
	$: showCardNumber = selectedPaymentType?.code?.startsWith('EDC-') || false;
	$: paymentCode = selectedPaymentType?.code || '';

	$: totalSales = items.reduce((sum, it) => sum + (parseFloat(it.subtotal) || 0), 0);
	$: discountAmount = discountType === 'percent'
		? totalSales * (parseFloat(discountValue) || 0) / 100
		: parseFloat(discountValue) || 0;
	$: netSales = totalSales - discountAmount;

	async function loadDischargedEncounters() {
		const today = new Date().toISOString().split('T')[0];
		const res = await fetch(`/api/encounters?date=${today}&status=Discharged`);
		const data = await res.json();
		dischargedEncounters = data.data || [];
	}

	async function loadEncounterDetail() {
		if (!selectedEncounterId) {
			encounterDetail = null;
			items = [];
			return;
		}

		const res = await fetch(`/api/encounters/${selectedEncounterId}`);
		const data = await res.json();
		encounterDetail = data;
		items = data.items || [];
	}

	async function handleSubmit() {
		if (!selectedEncounterId) {
			addToast('Pilih encounter', 'error');
			return;
		}
		if (!paymentType) {
			addToast('Pilih tipe pembayaran', 'error');
			return;
		}

		loading = true;
		try {
			const res = await fetch('/api/payments', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					encounter_id: selectedEncounterId,
					payment_mode: paymentMode,
					payment_type: paymentType,
					payment_code: paymentCode,
					card_number: showCardNumber ? cardNumber : null,
					discount_percent: discountType === 'percent' ? discountValue : null,
					discount_amount: discountType === 'fixed' ? discountValue : null,
					note
				})
			});

			if (!res.ok) {
				const err = await res.json();
				addToast(err.error || 'Pembayaran gagal', 'error');
				return;
			}

			addToast('Pembayaran berhasil!', 'success');
			goto('/kasir');
		} catch {
			addToast('Terjadi kesalahan', 'error');
		} finally {
			loading = false;
		}
	}

	onMount(loadDischargedEncounters);
</script>

<svelte:head>
	<title>Pembayaran — Oratio Dental</title>
</svelte:head>

<div>
	<div class="flex items-center justify-between mb-6">
		<h1 class="page-title" style="margin: 0;">Pembayaran</h1>
		<a href="/kasir" class="btn btn-secondary">← Kembali</a>
	</div>

	<div class="card mb-6">
		<div class="flex items-center gap-2 mb-4">
			<span class="badge badge-primary">👤 Kasir: {cashierName}</span>
		</div>

		<div class="form-group">
			<label class="form-label">Pilih Encounter (Status: Discharged)</label>
			<select class="form-select" bind:value={selectedEncounterId} on:change={loadEncounterDetail}>
				<option value="">-- Pilih Encounter --</option>
				{#each dischargedEncounters as enc}
					<option value={enc.encounter.id}>
						#{enc.encounter.queue_number} — {enc.patient_name} ({enc.encounter.id})
					</option>
				{/each}
			</select>
		</div>
	</div>

	{#if encounterDetail}
		<!-- Items Summary -->
		<div class="card mb-6">
			<h3 class="card-title mb-4">🛒 Item Tindakan</h3>
			{#if items.length > 0}
				<div class="table-container">
					<table>
						<thead>
							<tr>
								<th>Item</th>
								<th>Qty</th>
								<th>Harga</th>
								<th>Subtotal</th>
							</tr>
						</thead>
						<tbody>
							{#each items as item}
								<tr>
									<td>{item.item_id}</td>
									<td>{item.quantity}</td>
									<td>{formatCurrency(item.price_at_time)}</td>
									<td class="font-semibold">{formatCurrency(item.subtotal)}</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{:else}
				<p class="text-sm text-muted">Tidak ada item tindakan</p>
			{/if}
		</div>

		<!-- Payment Form -->
		<form on:submit|preventDefault={handleSubmit}>
			<div class="card mb-6">
				<h3 class="card-title mb-4">💳 Detail Pembayaran</h3>

				<div class="form-row">
					<div class="form-group">
						<label class="form-label">Mode Pembayaran</label>
						<select class="form-select" bind:value={paymentMode}>
							<option value="NORMAL">Normal</option>
							<option value="VOUCHER">Voucher</option>
						</select>
					</div>
					<div class="form-group">
						<label class="form-label">Tipe Pembayaran <span class="required">*</span></label>
						<select class="form-select" bind:value={paymentType}>
							<option value="">-- Pilih --</option>
							{#each PAYMENT_TYPES as pt}
								<option value={pt.label}>{pt.label} {pt.code ? `(${pt.code})` : ''}</option>
							{/each}
						</select>
					</div>
				</div>

				{#if showCardNumber}
					<div class="form-group mt-4">
						<label class="form-label">Nomor Kartu</label>
						<input class="form-input" bind:value={cardNumber} placeholder="Masukkan nomor kartu" />
					</div>
				{/if}

				<div class="form-row mt-4">
					<div class="form-group">
						<label class="form-label">Tipe Diskon</label>
						<select class="form-select" bind:value={discountType}>
							<option value="percent">Persen (%)</option>
							<option value="fixed">Nominal (Rp)</option>
						</select>
					</div>
					<div class="form-group">
						<label class="form-label">Nilai Diskon</label>
						<input type="number" class="form-input" bind:value={discountValue} min="0" />
					</div>
				</div>

				<div class="form-group mt-4">
					<label class="form-label">Catatan</label>
					<textarea class="form-textarea" bind:value={note} rows="2"></textarea>
				</div>
			</div>

			<!-- Totals -->
			<div class="card mb-6">
				<div class="flex justify-between mb-2">
					<span class="text-muted">Total Penjualan</span>
					<span class="font-semibold">{formatCurrency(totalSales)}</span>
				</div>
				<div class="flex justify-between mb-2">
					<span class="text-muted">Diskon</span>
					<span style="color: var(--danger);">- {formatCurrency(discountAmount)}</span>
				</div>
				<hr style="border: none; border-top: 2px solid var(--border-color); margin: var(--space-3) 0;" />
				<div class="flex justify-between">
					<span class="font-bold text-lg">Total Bayar</span>
					<span class="font-bold text-lg" style="color: var(--primary);">{formatCurrency(netSales)}</span>
				</div>
			</div>

			<div class="flex justify-between">
				<a href="/kasir" class="btn btn-secondary">Batal</a>
				<button type="submit" class="btn btn-primary btn-lg" disabled={loading}>
					{#if loading}
						<span class="spinner"></span> Memproses...
					{:else}
						✅ Proses Pembayaran
					{/if}
				</button>
			</div>
		</form>
	{/if}
</div>
