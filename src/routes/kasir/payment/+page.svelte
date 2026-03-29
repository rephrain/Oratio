<script>
	import { onMount } from "svelte";
	import { goto } from "$app/navigation";
	import { PAYMENT_TYPES } from "$lib/utils/constants.js";
	import { formatCurrency } from "$lib/utils/formatters.js";
	import { addToast } from "$lib/stores/toast.js";

	export let data;
	$: cashierName = data?.user?.name || "Kasir";

	let loading = false;
	let dischargedEncounters = [];
	let selectedEncounterId = "";
	let encounterDetail = null;
	let items = [];

	// Payment form
	let paymentMode = "NORMAL";
	let paymentType = "";
	let paymentCode = "";
	let cardNumber = "";
	let totalPaid = 0;
	let discountType = "fixed"; 
	let discountPct = 0;
    let discountFixed = 0;
	let note = "";

    // Sync discount values
    function handlePercentChange() {
        discountType = "percent";
        discountFixed = totalSales > 0 ? (totalSales * discountPct) / 100 : 0;
    }
    function handleFixedChange() {
        discountType = "fixed";
        discountPct = totalSales > 0 ? (discountFixed / totalSales) * 100 : 0;
    }

	$: selectedPaymentType = PAYMENT_TYPES.find(
		(pt) => pt.label === paymentType,
	);
	$: showCardNumber = selectedPaymentType?.code?.startsWith("EDC-") || false;
	$: paymentCode = selectedPaymentType?.code || "";

	$: totalSales = items.reduce(
		(sum, it) => sum + (parseFloat(it.subtotal) || 0),
		0,
	);
    
	$: discountAmount = discountType === "percent" ? (totalSales * discountPct) / 100 : Number(discountFixed);
	$: netSales = totalSales - discountAmount;

	async function loadDischargedEncounters() {
		const today = new Date().toISOString().split("T")[0];
		const res = await fetch(
			`/api/encounters?date=${today}&status=Discharged`,
		);
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
			addToast("Pilih encounter", "error");
			return;
		}
		if (!paymentType) {
			addToast("Pilih tipe pembayaran", "error");
			return;
		}

		loading = true;
		try {
			const res = await fetch("/api/payments", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					encounter_id: selectedEncounterId,
					payment_mode: paymentMode,
					payment_type: paymentType,
					payment_code: paymentCode,
					card_number: showCardNumber ? cardNumber : null,
					reference_number: cardNumber || null,
					discount_percent: discountType === "percent" ? discountPct : null,
					discount_amount: discountType === "fixed" ? discountFixed : null,
					total_paid: netSales,
					note,
				}),
			});

			if (!res.ok) {
				const err = await res.json();
				addToast(err.error || "Pembayaran gagal", "error");
				return;
			}

			addToast("Pembayaran berhasil!", "success");
			goto("/kasir");
		} catch {
			addToast("Terjadi kesalahan", "error");
		} finally {
			loading = false;
		}
	}

	onMount(loadDischargedEncounters);
</script>

<svelte:head>
	<title>Pembayaran — Oratio Clinic</title>
</svelte:head>

<div class="p-8 space-y-8 max-w-6xl mx-auto">
	<!-- Page Title -->
	<div class="flex items-end justify-between">
		<div>
			<h2 class="text-3xl font-extrabold text-slate-800 tracking-tight">Proses Pembayaran</h2>
			<p class="text-slate-500 mt-1 flex items-center gap-2">
				<span class="material-symbols-outlined text-sm">account_circle</span>
				Petugas Kasir: <span class="font-semibold text-primary">{cashierName}</span>
			</p>
		</div>
		
		{#if encounterDetail}
		<div class="bg-primary/5 px-4 py-2 rounded-lg border border-primary/20">
			<p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Transaction ID</p>
			<p class="font-mono font-bold text-primary">#ORD-{new Date().getFullYear()}-{encounterDetail.encounter?.id?.toString().slice(0,4) || 'XXXX'}</p>
		</div>
		{/if}
	</div>

	<!-- Encounter Selection -->
	<div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative z-20">
		<label for="queue-select" class="block text-sm font-bold text-slate-700 mb-2">Pilih Antrean Pasien (Status: Discharged)</label>
		<div class="relative">
			<select
				id="queue-select"
				class="w-full py-3 pl-4 pr-10 rounded-xl border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 appearance-none bg-slate-50 text-sm font-medium cursor-pointer transition-all"
				bind:value={selectedEncounterId}
				on:change={loadEncounterDetail}
			>
				<option value="">-- Cari atau Pilih Pasien yang Selesai Pemeriksaan --</option>
				{#each dischargedEncounters as enc}
					<option value={enc.encounter.id}>
						Antrean #{enc.encounter.queue_number} — {enc.patient_name} (MR: {enc.patient_id})
					</option>
				{/each}
			</select>
			<div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
				<span class="material-symbols-outlined text-slate-400">expand_more</span>
			</div>
		</div>
	</div>

	{#if encounterDetail}
	<div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
		<!-- Left Column: Summary and Billing -->
		<div class="lg:col-span-7 space-y-6">
			<!-- Patient Summary Card -->
			<div class="bg-white p-6 rounded-xl shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)] border border-slate-100 flex items-center gap-6">
				<div class="w-20 h-20 rounded-xl bg-secondary flex items-center justify-center text-primary border border-primary/10 shrink-0">
					<span class="material-symbols-outlined text-4xl">person</span>
				</div>
				<div class="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
					<div>
						<p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nama Pasien</p>
						<p class="text-lg font-extrabold text-slate-800 truncate">{encounterDetail.patient?.nama_lengkap || 'Unknown'}</p>
					</div>
					<div>
						<p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">MR ID</p>
						<p class="text-lg font-bold text-slate-800">{encounterDetail.patient?.id || '-'}</p>
					</div>
					<div class="sm:col-span-2">
						<p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Encounter Date</p>
						<p class="text-sm font-medium text-slate-600">
							{new Date(encounterDetail.encounter?.created_at).toLocaleDateString('id-ID', {day: 'numeric', month: 'short', year: 'numeric'})} • 
							{new Date(encounterDetail.encounter?.created_at).toLocaleTimeString('id-ID', {hour: '2-digit', minute: '2-digit'})} WIB
						</p>
					</div>
				</div>
			</div>

			<!-- Billing Table -->
			<div class="bg-white rounded-xl shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)] border border-slate-100 overflow-hidden">
				<div class="p-4 bg-slate-50 border-b border-slate-100">
					<h3 class="font-bold text-slate-700 flex items-center gap-2">
						<span class="material-symbols-outlined text-primary">receipt_long</span>
						Billing Items
					</h3>
				</div>
				<div class="overflow-x-auto">
					<table class="w-full text-left">
						<thead class="bg-white">
							<tr class="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-50">
								<th class="px-6 py-4">Description</th>
								<th class="px-6 py-4 text-center">Qty</th>
								<th class="px-6 py-4 text-right">Price</th>
								<th class="px-6 py-4 text-right">Subtotal</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-slate-50">
							{#each items as item}
							<tr class="text-sm hover:bg-slate-50/50 transition-colors">
								<td class="px-6 py-4 font-semibold text-slate-800 truncate max-w-[200px]">{item.item_id}</td>
								<td class="px-6 py-4 text-center text-slate-600">{item.quantity}</td>
								<td class="px-6 py-4 text-right text-slate-600">{formatCurrency(item.price_at_time)}</td>
								<td class="px-6 py-4 text-right font-bold text-slate-800">{formatCurrency(item.subtotal)}</td>
							</tr>
							{:else}
							<tr>
								<td colspan="4" class="px-6 py-8 text-center text-slate-400 text-sm">Tidak ada item tindakan</td>
							</tr>
							{/each}
						</tbody>
					</table>
				</div>
				
				<div class="p-6 bg-secondary/30 border-t border-slate-100 flex justify-end items-center gap-10">
					<div class="text-right">
						<p class="text-xs font-bold text-slate-400 uppercase tracking-widest">Gross Total</p>
						<p class="text-xl font-extrabold text-slate-800">{formatCurrency(totalSales)}</p>
					</div>
				</div>
			</div>
		</div>

		<!-- Right Column: Payment Settings -->
		<div class="lg:col-span-5 space-y-6">
			<form on:submit|preventDefault={handleSubmit} class="bg-white rounded-xl shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)] border border-slate-100 overflow-hidden">
				<div class="p-4 bg-primary text-white font-bold flex items-center justify-between">
					<span class="flex items-center gap-2">
						<span class="material-symbols-outlined">payments</span>
						Payment Settings
					</span>
					<span class="bg-white/20 px-3 py-1 rounded-full text-[10px] tracking-widest uppercase">Secured</span>
				</div>
				
				<div class="p-6 space-y-6">
					<!-- Mode Toggle -->
					<div class="flex p-1 bg-slate-100 rounded-xl relative">
						<button 
							type="button"
							class="flex-1 py-2 text-sm font-bold rounded-lg transition-all {paymentMode === 'NORMAL' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}"
							on:click={() => paymentMode = 'NORMAL'}
						>NORMAL</button>
						<button 
							type="button"
							class="flex-1 py-2 text-sm font-bold rounded-lg transition-all {paymentMode === 'VOUCHER' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}"
							on:click={() => paymentMode = 'VOUCHER'}
						>VOUCHER</button>
					</div>

					<!-- Discount Field -->
					<div>
						<label for="disc-fixed" class="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Discount (Amount or %)</label>
						<div class="flex gap-2">
							<div class="relative flex-1">
								<span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">Rp</span>
								<input 
									id="disc-fixed"
									class="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-slate-200 focus:ring-primary focus:border-primary rounded-xl text-sm font-bold outline-none transition-all" 
									type="number" 
									min="0"
									bind:value={discountFixed}
									on:input={handleFixedChange}
								/>
							</div>
							<div class="w-24 relative shrink-0">
								<span class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">%</span>
								<input 
									aria-label="Discount in percent"
									class="w-full px-3 py-2.5 pr-8 bg-slate-50 border-slate-200 focus:ring-primary focus:border-primary rounded-xl text-sm font-bold text-center outline-none transition-all" 
									type="number" 
									min="0"
									max="100"
									step="0.1"
									bind:value={discountPct}
									on:input={handlePercentChange}
								/>
							</div>
						</div>
					</div>

					<!-- Payment Type -->
					<div>
						<label for="payment-type" class="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Payment Type <span class="text-red-500">*</span></label>
						<div class="relative">
							<select 
								id="payment-type"
								class="w-full px-4 py-2.5 bg-slate-50 border-slate-200 focus:ring-primary focus:border-primary rounded-xl text-sm font-bold outline-none cursor-pointer appearance-none transition-all"
								bind:value={paymentType}
								required
							>
								<option value="">-- Pilih --</option>
								{#each PAYMENT_TYPES as pt}
									<option value={pt.label}>{pt.label} {pt.code ? `(${pt.code})` : ""}</option>
								{/each}
							</select>
							<div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
								<span class="material-symbols-outlined text-slate-400">expand_more</span>
							</div>
						</div>
					</div>

					<!-- Card Number Field -->
					<div>
						<label for="card-num" class="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Last 4 Digits / Ref No.</label>
						<input 
							id="card-num"
							class="w-full px-4 py-2.5 bg-slate-50 border-slate-200 focus:ring-primary focus:border-primary rounded-xl text-sm font-bold outline-none transition-all" 
							placeholder="XXXX XXXX XXXX 4452" 
							type="text"
							bind:value={cardNumber}
							required={showCardNumber}
						/>
					</div>

					<!-- Note Field -->
					<div>
						<label for="payment-note" class="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Keterangan / Notes</label>
						<textarea 
							id="payment-note"
							class="w-full px-4 py-2.5 bg-slate-50 border-slate-200 focus:ring-primary focus:border-primary rounded-xl text-sm outline-none resize-none transition-all" 
							placeholder="Input specific note if any..." 
							rows="2"
							bind:value={note}
						></textarea>
					</div>

					<!-- Proof Upload -->
					<div>
						<span class="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Upload Proof of Payment</span>
						<div class="border-2 border-dashed border-slate-200 rounded-xl p-4 flex flex-col items-center justify-center gap-2 hover:border-primary hover:bg-primary/5 transition-all cursor-pointer group">
							<span class="material-symbols-outlined text-slate-300 group-hover:text-primary transition-colors">cloud_upload</span>
							<p class="text-[10px] font-medium text-slate-500">Drag file or <span class="text-primary font-bold underline">browse</span></p>
						</div>
					</div>

					<!-- Totals Summary -->
					<div class="pt-6 border-t border-slate-100 space-y-3">
						<div class="flex justify-between text-sm">
							<span class="text-slate-500 font-medium">Subtotal</span>
							<span class="text-slate-800 font-bold">{formatCurrency(totalSales)}</span>
						</div>
						<div class="flex justify-between text-sm">
							<span class="text-slate-500 font-medium">Discount Amount</span>
							<span class="text-red-500 font-bold">- {formatCurrency(discountAmount)}</span>
						</div>
						<div class="flex justify-between items-center bg-secondary/50 p-4 rounded-xl">
							<span class="text-slate-800 font-extrabold uppercase tracking-widest text-xs">Net Total</span>
							<span class="text-3xl font-black text-primary">{formatCurrency(netSales)}</span>
						</div>
					</div>

					<!-- Action Button -->
					<button 
						type="submit"
						class="w-full py-4 bg-primary hover:bg-primary/90 text-white font-extrabold text-lg rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
						disabled={loading}
					>
						{#if loading}
							<span class="material-symbols-outlined animate-spin" style="animation: spin 1s linear infinite;">refresh</span>
							Memproses...
						{:else}
							<span class="material-symbols-outlined">verified</span>
							Konfirmasi & Selesai
						{/if}
					</button>
					<p class="text-center text-[10px] text-slate-400 font-medium italic">By confirming, the invoice will be finalized and sent to the patient's WhatsApp.</p>
				</div>
			</form>
		</div>
	</div>
	{/if}
</div>
