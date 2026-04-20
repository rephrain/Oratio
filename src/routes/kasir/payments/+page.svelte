<script>
	import { onMount, onDestroy } from "svelte";
	import { goto } from "$app/navigation";
	import RichSelect from "$lib/components/Forms/RichSelect.svelte";
	import {
		formatCurrency,
		formatTime,
		formatDate,
		getJakartaDateString,
	} from "$lib/utils/formatters.js";
	import { PAYMENT_TYPES } from "$lib/utils/constants.js";

	let payments = [];
	let loading = true;
	let filterDate = getJakartaDateString();
	let refreshInterval;

	// Table View filters
	let tablePaymentModeFilter = "";
	const PAYMENT_MODE_OPTIONS = [
		{ value: "", label: "All Payment Modes" },
		{ value: "NORMAL", label: "Normal" },
		{ value: "VOUCHER", label: "Voucher" },
	];

	let tablePaymentTypeFilter = "";
	const PAYMENT_TYPE_OPTIONS = [
		{ value: "", label: "All Payment Types" },
		...PAYMENT_TYPES.map(p => ({ value: p.label, label: p.label }))
	];

	let filterDoctor = "";
	let doctorOptions = [];

	let filterCashier = "";
	let cashierOptions = [];

	$: filteredPayments = payments.filter((p) => {
		if (
			tablePaymentModeFilter &&
			p.payment?.payment_mode !== tablePaymentModeFilter
		) {
			return false;
		}
		if (
			tablePaymentTypeFilter &&
			p.payment?.payment_type !== tablePaymentTypeFilter
		) {
			return false;
		}
		if (filterDoctor && p.encounter?.doctor_id !== filterDoctor) {
			return false;
		}
		if (filterCashier && p.payment?.cashier_id !== filterCashier) {
			return false;
		}
		return true;
	});

	let sortKey = "time";
	let sortDesc = true;

	function handleSort(key) {
		if (sortKey === key) {
			sortDesc = !sortDesc;
		} else {
			sortKey = key;
			sortDesc = false;
		}
	}

	$: sortedPayments = [...filteredPayments].sort((a, b) => {
		if (!sortKey) return 0;
		let valA, valB;
		if (sortKey === "receipt") {
			valA = a.payment?.id || "";
			valB = b.payment?.id || "";
		} else if (sortKey === "patient") {
			valA = a.patient_name || "";
			valB = b.patient_name || "";
		} else if (sortKey === "doctor") {
			valA = a.doctor_name || "";
			valB = b.doctor_name || "";
		} else if (sortKey === "mode") {
			valA = a.payment?.payment_mode || "";
			valB = b.payment?.payment_mode || "";
		} else if (sortKey === "method") {
			valA = a.payment?.payment_type || "";
			valB = b.payment?.payment_type || "";
		} else if (sortKey === "sales") {
			valA = a.payment?.net_sales || 0;
			valB = b.payment?.net_sales || 0;
		} else if (sortKey === "time") {
			valA = new Date(a.payment?.paid_at || 0).getTime();
			valB = new Date(b.payment?.paid_at || 0).getTime();
		}

		if (typeof valA === "string") valA = valA.toLowerCase();
		if (typeof valB === "string") valB = valB.toLowerCase();

		if (valA < valB) return sortDesc ? 1 : -1;
		if (valA > valB) return sortDesc ? -1 : 1;
		return 0;
	});

	// Summary counts
	$: totalIncome = payments.reduce(
		(sum, p) => sum + (p.payment?.total_paid || 0),
		0,
	);
	$: normalPaymentsCount = payments.filter(
		(p) => p.payment?.payment_mode === "NORMAL",
	).length;
	$: voucherPaymentsCount = payments.filter(
		(p) => p.payment?.payment_mode === "VOUCHER",
	).length;

	async function loadPayments() {
		try {
			const params = new URLSearchParams({ date: filterDate });
			const res = await fetch(`/api/payments?${params}`);
			const data = await res.json();
			payments = data.data || [];
		} catch (err) {
			console.error("Failed to load payments:", err);
		} finally {
			loading = false;
		}
	}

	async function loadDoctors() {
		try {
			const res = await fetch("/api/doctors");
			const data = await res.json();
			const docs = data.doctors || [];
			doctorOptions = [
				{ value: "", label: "All Doctors" },
				...docs.map((d) => ({
					value: d.id,
					label: `drg. ${d.name}`,
					sublabel: d.doctor_code || "General Dentist",
					meta: { profile_image_url: d.profile_image_url }
				}))
			];
		} catch (err) {
			console.error("Failed to load doctors:", err);
		}
	}

	async function loadCashiers() {
		try {
			const res = await fetch("/api/cashiers");
			const data = await res.json();
			const cashiers = data.cashiers || [];
			cashierOptions = [
				{ value: "", label: "All Cashiers" },
				...cashiers.map((c) => ({
					value: c.id,
					label: c.name,
					meta: { profile_image_url: c.profile_image_url }
				}))
			];
		} catch (err) {
			console.error("Failed to load cashiers:", err);
		}
	}

	onMount(() => {
		loadDoctors();
		loadCashiers();
		loadPayments();
		refreshInterval = setInterval(loadPayments, 30000);
	});

	onDestroy(() => {
		if (refreshInterval) clearInterval(refreshInterval);
	});
</script>

<div class="h-full flex flex-col">
	<!-- Summary Bar -->
	<div class="flex gap-4 mb-8 shrink-0">
		<div
			class="flex-1 min-w-[200px] bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4"
		>
			<div
				class="size-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center"
			>
				<span class="material-symbols-outlined">payments</span>
			</div>
			<div>
				<p class="text-2xl font-bold text-slate-900">
					{formatCurrency(totalIncome)}
				</p>
				<p
					class="text-xs font-medium text-slate-500 uppercase tracking-wide"
				>
					Total Income
				</p>
			</div>
		</div>
		<div
			class="flex-1 min-w-[200px] bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4"
		>
			<div
				class="size-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center"
			>
				<span class="material-symbols-outlined">receipt_long</span>
			</div>
			<div>
				<p class="text-2xl font-bold text-slate-900">
					{payments.length}
				</p>
				<p
					class="text-xs font-medium text-slate-500 uppercase tracking-wide"
				>
					Total Transactions
				</p>
			</div>
		</div>
		<div
			class="flex-1 min-w-[200px] bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4"
		>
			<div
				class="size-12 rounded-full bg-primary/10 text-primary flex items-center justify-center"
			>
				<span class="material-symbols-outlined">check_circle</span>
			</div>
			<div>
				<p class="text-2xl font-bold text-slate-900">
					{normalPaymentsCount}
				</p>
				<p
					class="text-xs font-medium text-slate-500 uppercase tracking-wide"
				>
					Normal Payments
				</p>
			</div>
		</div>
		<div
			class="flex-1 min-w-[200px] bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4"
		>
			<div
				class="size-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center"
			>
				<span class="material-symbols-outlined">redeem</span>
			</div>
			<div>
				<p class="text-2xl font-bold text-slate-900">
					{voucherPaymentsCount}
				</p>
				<p
					class="text-xs font-medium text-slate-500 uppercase tracking-wide"
				>
					Voucher Payments
				</p>
			</div>
		</div>
	</div>

	<!-- Title -->
	<div class="flex items-center justify-between mb-6 shrink-0">
		<div>
			<h2 class="text-xl font-bold text-slate-900">Payment History</h2>
			<p class="text-sm text-slate-500">
				Manage and review all completed transactions
			</p>
		</div>
	</div>

	{#if loading}
		<div
			class="flex-1 flex flex-col items-center justify-center text-slate-400"
		>
			<span
				class="material-symbols-outlined text-4xl animate-spin mb-2"
				style="animation: spin 1s linear infinite;">refresh</span
			>
			<p>Memuat pembayaran...</p>
		</div>
	{:else}
		<!-- Table View -->
		<div class="flex-1 flex flex-col min-h-0">
			<!-- Filters Bar -->
			<div
				class="bg-white p-4 rounded-t-xl border-x border-t border-slate-200 flex flex-wrap items-center gap-4 shrink-0"
			>
				<div class="flex items-center gap-2">
					<label
						class="text-xs font-semibold text-slate-500 uppercase tracking-wider"
						>Date:</label
					>
					<input
						type="date"
						class="text-sm py-1.5 px-3 border border-slate-200 rounded-md bg-slate-50 focus:ring-primary focus:border-primary outline-none h-[42px]"
						bind:value={filterDate}
						on:change={loadPayments}
					/>
				</div>
				<div class="flex items-center gap-2">
					<RichSelect
						label=""
						placeholder="All Payment Modes"
						options={PAYMENT_MODE_OPTIONS}
						bind:value={tablePaymentModeFilter}
						wrapperClass="min-w-[180px]"
					/>
				</div>
				<div class="flex items-center gap-2">
					<RichSelect
						label=""
						placeholder="All Payment Types"
						options={PAYMENT_TYPE_OPTIONS}
						bind:value={tablePaymentTypeFilter}
						wrapperClass="min-w-[200px]"
					/>
				</div>
				<div class="flex items-center gap-2">
					<RichSelect
						label=""
						placeholder="All Doctors"
						options={doctorOptions}
						bind:value={filterDoctor}
						wrapperClass="min-w-[200px]"
					/>
				</div>
				<div class="flex items-center gap-2">
					<RichSelect
						label=""
						placeholder="All Cashiers"
						options={cashierOptions}
						bind:value={filterCashier}
						wrapperClass="min-w-[200px]"
					/>
				</div>
				<div class="ml-auto">
					<button
						class="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md transition-colors h-[42px]"
					>
						<span class="material-symbols-outlined text-sm"
							>download</span
						>
						Export List
					</button>
				</div>
			</div>

			<!-- Table Content -->
			<div
				class="bg-white rounded-b-xl border border-slate-200 shadow-sm overflow-hidden flex-1 flex flex-col"
			>
				<div class="overflow-y-auto custom-scrollbar flex-1">
					<table class="w-full text-left text-sm whitespace-nowrap">
						<thead
							class="bg-slate-50 border-b border-slate-200 sticky top-0 z-10"
						>
							<tr>

								<th
									class="px-6 py-4 font-semibold text-slate-700 cursor-pointer hover:text-primary transition-colors select-none group"
									on:click={() => handleSort("patient")}
								>
									<div class="flex items-center gap-1">
										Patient Name<span
											class="material-symbols-outlined text-[14px] {sortKey ===
											'patient'
												? 'text-primary'
												: 'text-slate-300 opacity-0 group-hover:opacity-100'}"
											>{sortKey === "patient"
												? sortDesc
													? "arrow_downward"
													: "arrow_upward"
												: "unfold_more"}</span
										>
									</div>
								</th>
								<th
									class="px-6 py-4 font-semibold text-slate-700 cursor-pointer hover:text-primary transition-colors select-none group"
									on:click={() => handleSort("doctor")}
								>
									<div class="flex items-center gap-1">
										Doctor<span
											class="material-symbols-outlined text-[14px] {sortKey ===
											'doctor'
												? 'text-primary'
												: 'text-slate-300 opacity-0 group-hover:opacity-100'}"
											>{sortKey === "doctor"
												? sortDesc
													? "arrow_downward"
													: "arrow_upward"
												: "unfold_more"}</span
										>
									</div>
								</th>
								<th
									class="px-6 py-4 font-semibold text-slate-700 cursor-pointer hover:text-primary transition-colors select-none group"
									on:click={() => handleSort("mode")}
								>
									<div class="flex items-center gap-1">
										Mode<span
											class="material-symbols-outlined text-[14px] {sortKey ===
											'mode'
												? 'text-primary'
												: 'text-slate-300 opacity-0 group-hover:opacity-100'}"
											>{sortKey === "mode"
												? sortDesc
													? "arrow_downward"
													: "arrow_upward"
												: "unfold_more"}</span
										>
									</div>
								</th>
								<th
									class="px-6 py-4 font-semibold text-slate-700 cursor-pointer hover:text-primary transition-colors select-none group"
									on:click={() => handleSort("method")}
								>
									<div class="flex items-center gap-1">
										Payment Method<span
											class="material-symbols-outlined text-[14px] {sortKey ===
											'method'
												? 'text-primary'
												: 'text-slate-300 opacity-0 group-hover:opacity-100'}"
											>{sortKey === "method"
												? sortDesc
													? "arrow_downward"
													: "arrow_upward"
												: "unfold_more"}</span
										>
									</div>
								</th>
								<th
									class="px-6 py-4 font-semibold text-slate-700 cursor-pointer hover:text-primary transition-colors select-none group"
									on:click={() => handleSort("sales")}
								>
									<div class="flex items-center gap-1">
										Net Sales<span
											class="material-symbols-outlined text-[14px] {sortKey ===
											'sales'
												? 'text-primary'
												: 'text-slate-300 opacity-0 group-hover:opacity-100'}"
											>{sortKey === "sales"
												? sortDesc
													? "arrow_downward"
													: "arrow_upward"
												: "unfold_more"}</span
										>
									</div>
								</th>
								<th
									class="px-6 py-4 font-semibold text-slate-700 cursor-pointer hover:text-primary transition-colors select-none group"
									on:click={() => handleSort("time")}
								>
									<div class="flex items-center gap-1">
										Paid At<span
											class="material-symbols-outlined text-[14px] {sortKey ===
											'time'
												? 'text-primary'
												: 'text-slate-300 opacity-0 group-hover:opacity-100'}"
											>{sortKey === "time"
												? sortDesc
													? "arrow_downward"
													: "arrow_upward"
												: "unfold_more"}</span
										>
									</div>
								</th>
								<th class="px-6 py-4 text-right"></th>
							</tr>
						</thead>
						<tbody class="divide-y divide-slate-100">
							{#each sortedPayments as row}
								<tr
									class="hover:bg-slate-50/50 transition-colors"
								>

									<td
										class="px-6 py-4 font-medium max-w-[200px] truncate"
										title={row.patient_name}
									>
										{row.patient_name || "-"}
									</td>
									<td class="px-6 py-4 text-slate-600">
										{row.doctor_name
											? `Dr. ${row.doctor_name}`
											: "-"}
									</td>
									<td class="px-6 py-4">
										{#if row.payment?.payment_mode === "NORMAL"}
											<span
												class="px-3 py-1 bg-primary/10 text-primary rounded-full text-[11px] font-bold uppercase tracking-wider"
												>Normal</span
											>
										{:else if row.payment?.payment_mode === "INSTALLMENT"}
											<span
												class="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-[11px] font-bold uppercase tracking-wider"
												>Installment</span
											>
										{:else}
											<span
												class="px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-[11px] font-bold uppercase tracking-wider"
												>{row.payment?.payment_mode ||
													"-"}</span
											>
										{/if}
									</td>
									<td
										class="px-6 py-4 text-slate-600 font-medium"
									>
										{row.payment?.payment_type || "-"}
									</td>
									<td
										class="px-6 py-4 font-bold text-slate-900"
									>
										{formatCurrency(row.payment?.net_sales)}
									</td>
									<td
										class="px-6 py-4 text-slate-500 text-xs"
									>
										{formatTime(row.payment?.paid_at)}<br />
										<span class="text-[10px] text-slate-400"
											>{formatDate(
												row.payment?.paid_at,
											)}</span
										>
									</td>
									<td class="px-6 py-4 text-right whitespace-nowrap">
										{#if row.payment?.proof_document_id}
											<button
												class="p-2 text-amber-500 hover:bg-amber-50 rounded-lg transition-colors mr-1"
												title="View Proof of Payment"
												on:click={() => window.open(`/api/documents/${row.payment.proof_document_id}`, '_blank')}
											>
												<span class="material-symbols-outlined text-lg">image</span>
											</button>
										{/if}
										<button
											class="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
											title="View Receipt PDF"
											on:click={() => window.open(`/api/payments/${row.payment?.id}/pdf`, '_blank')}
										>
											<span class="material-symbols-outlined text-lg">description</span>
										</button>
									</td>
								</tr>
							{:else}
								<tr>
									<td
										colspan="7"
										class="px-6 py-8 text-center text-slate-400"
									>
										Tidak ada data pembayaran pada tanggal
										ini.
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
				<!-- Pagination Footer -->
				<div
					class="px-6 py-4 bg-white border-t border-slate-100 flex items-center justify-between shrink-0"
				>
					<p class="text-xs text-slate-500">
						Showing {filteredPayments.length} transactions
					</p>
					<div class="flex items-center gap-2">
						<button
							class="size-8 flex items-center justify-center border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50"
							disabled
						>
							<span class="material-symbols-outlined text-sm"
								>chevron_left</span
							>
						</button>
						<button
							class="size-8 flex items-center justify-center bg-primary text-white rounded text-xs font-bold"
							>1</button
						>
						<button
							class="size-8 flex items-center justify-center border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50"
							disabled
						>
							<span class="material-symbols-outlined text-sm"
								>chevron_right</span
							>
						</button>
					</div>
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	/* No styles needed, tailwind handles scrollbars */
</style>
