<script>
	import { onMount, onDestroy } from "svelte";
	import { goto } from "$app/navigation";
	import DataTable from "$lib/components/Tables/DataTable.svelte";
	import { STATUS_COLORS, DAYS_OF_WEEK } from "$lib/utils/constants.js";
	import {
		formatElapsedTime,
		formatTime,
		getShiftCountdown,
		formatDate,
		getWhatsAppUrl,
	} from "$lib/utils/formatters.js";

	export let data;
	$: user = data?.user;

	let encounters = [];
	let loading = true;
	let shiftInfo = { active: false, status: "no-shifts" };
	let doctorShifts = [];
	let refreshInterval;
	let shiftInterval;
	let filterDate = new Date(
		new Date().toLocaleString("en-US", { timeZone: "Asia/Jakarta" }),
	)
		.toISOString()
		.split("T")[0];

	$: todayQueue = encounters.filter((e) =>
		["Planned", "Arrived", "On Hold"].includes(e.encounter?.status),
	);
	$: inProgress = encounters.filter(
		(e) => e.encounter?.status === "In Progress",
	);
	$: completedToday = encounters.filter((e) =>
		["Discharged", "Completed"].includes(e.encounter?.status),
	);

	async function loadEncounters() {
		try {
			const res = await fetch(`/api/encounters?date=${filterDate}`);
			const resp = await res.json();
			encounters = resp.data || [];
			loadStats(); // Reload stats whenever encounters reload
		} catch (err) {
			console.error(err);
		} finally {
			loading = false;
		}
	}

	async function loadShifts() {
		if (!user?.id) return;
		try {
			const res = await fetch("/api/auth/shifts");
			const resp = await res.json();
			doctorShifts = resp.data || [];
			updateShift();
		} catch {}
	}

	function updateShift() {
		shiftInfo = getShiftCountdown(doctorShifts);
	}

	let selectedEncounterData = null;
	let patientMedicalBackground = null;
	$: personalDiseases =
		patientMedicalBackground?.diseases?.filter(
			(d) => d.type === "personal",
		) || [];
	$: familyDiseases =
		patientMedicalBackground?.diseases?.filter(
			(d) => d.type === "family",
		) || [];

	const REASON_THEMES = {
		finding: {
			bg: "bg-blue-50/50",
			border: "border-blue-100",
			text: "text-blue-700",
			icon: "search",
			label: "Finding / Symptom",
		},
		procedure: {
			bg: "bg-emerald-50/50",
			border: "border-emerald-100",
			text: "text-emerald-700",
			icon: "medical_services",
			label: "Procedure / Treatment",
		},
		situation: {
			bg: "bg-amber-50/50",
			border: "border-amber-100",
			text: "text-amber-700",
			icon: "check_circle",
			label: "General Situation",
		},
		event: {
			bg: "bg-rose-50/50",
			border: "border-rose-100",
			text: "text-rose-700",
			icon: "notification_important",
			label: "Accident / Event",
		},
	};
	let isSidebarOpen = true;
	let patientHistory = [];
	let loadingMedical = false;
	let expandedHistoryId = null;
	let referrals = [];
	let loadingReferrals = false;

	let stats = {
		patientsToday: 0,
		completedToday: 0,
		avgWaitMinutes: 0,
		avgTreatmentMinutes: 0,
	};

	async function loadStats() {
		try {
			const res = await fetch(
				`/api/dashboard/dokter/stats?date=${filterDate}`,
			);
			const resp = await res.json();
			if (!resp.error) {
				stats = resp;
			}
		} catch (err) {
			console.error("Error loading stats:", err);
		}
	}

	async function loadReferrals() {
		loadingReferrals = true;
		try {
			const res = await fetch("/api/dashboard/dokter/referrals");
			const resp = await res.json();
			referrals = resp.data || [];
		} catch (err) {
			console.error("Error loading referrals:", err);
		} finally {
			loadingReferrals = false;
		}
	}

	let sortKey = "";
	let sortDesc = false;

	function handleSort(key) {
		if (sortKey === key) {
			sortDesc = !sortDesc;
		} else {
			sortKey = key;
			sortDesc = false;
		}
	}

	$: sortedReferrals = [...referrals].sort((a, b) => {
		if (!sortKey) return 0;
		let valA, valB;
		if (sortKey === 'doctor') { valA = a.sender_name || ''; valB = b.sender_name || ''; }
		else if (sortKey === 'date') { valA = new Date(a.referral_date || 0).getTime(); valB = new Date(b.referral_date || 0).getTime(); }
		else if (sortKey === 'patient') { valA = a.patient_name || ''; valB = b.patient_name || ''; }
		else if (sortKey === 'note') { valA = a.note || ''; valB = b.note || ''; }
		
		if (typeof valA === 'string') valA = valA.toLowerCase();
		if (typeof valB === 'string') valB = valB.toLowerCase();
		
		if (valA < valB) return sortDesc ? 1 : -1;
		if (valA > valB) return sortDesc ? -1 : 1;
		return 0;
	});

	function toggleHistory(id) {
		expandedHistoryId = expandedHistoryId === id ? null : id;
	}

	function calculateAge(birthDate) {
		if (!birthDate) return "-";
		const today = new Date(
			new Date().toLocaleString("en-US", { timeZone: "Asia/Jakarta" }),
		);
		const birth = new Date(birthDate);
		let age = today.getFullYear() - birth.getFullYear();
		const m = today.getMonth() - birth.getMonth();
		if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
			age--;
		}
		return age;
	}

	async function selectEncounter(row) {
		if (selectedEncounterData?.encounter?.id === row?.encounter?.id) {
			isSidebarOpen = !isSidebarOpen;
			return;
		}
		selectedEncounterData = row;
		patientMedicalBackground = null;
		patientHistory = [];
		expandedHistoryId = null;
		isSidebarOpen = true;
		if (row?.patient?.id) {
			loadingMedical = true;
			try {
				const [bgRes, histRes] = await Promise.all([
					fetch(`/api/patients/${row.patient.id}/medical-background`),
					fetch(
						`/api/encounters?patient_id=${row.patient.id}&limit=5`,
					),
				]);
				if (bgRes.ok) patientMedicalBackground = await bgRes.json();
				if (histRes.ok) {
					const data = await histRes.json();
					patientHistory = (data.data || []).filter(
						(e) => e.encounter?.id !== row.encounter?.id,
					);
				}
			} catch (e) {
				console.error(e);
			} finally {
				loadingMedical = false;
			}
		}
	}

	async function startEncounter() {
		if (selectedEncounterData?.encounter?.id) {
			const id = selectedEncounterData.encounter.id;
			const currentStatus = selectedEncounterData.encounter.status;

			if (["Planned", "Arrived"].includes(currentStatus)) {
				try {
					await fetch(`/api/encounters/${id}`, {
						method: "PUT",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({ status: "In Progress" }),
					});
				} catch (err) {
					console.error("Failed to update status:", err);
				}
			}

			goto(`/dokter/${id}`);
		}
	}

	const tableColumns = [
		{
			key: "queue",
			label: "#",
			format: (_, r) => r.encounter?.queue_number || "-",
			sortable: true,
		},
		{
			key: "patient",
			label: "Pasien",
			format: (_, r) => r.patient_name || "-",
		},
		{
			key: "status",
			label: "Status",
			format: (_, r) => r.encounter?.status || "-",
		},
		{
			key: "time",
			label: "Waktu",
			format: (_, r) => formatTime(r.encounter?.created_at),
		},
		{
			key: "dur",
			label: "Durasi",
			format: (_, r) => formatElapsedTime(r.encounter?.created_at),
		},
	];

	$: selectedStatusConfig = (() => {
		const status = selectedEncounterData?.encounter?.status;
		const map = {
			"In Progress": {
				badge: "bg-blue-500",
				bg: "from-blue-100 to-blue-50",
				text: "text-blue-600",
			},
			Arrived: {
				badge: "bg-emerald-500",
				bg: "from-emerald-100 to-emerald-50",
				text: "text-emerald-600",
			},
			Planned: {
				badge: "bg-amber-400",
				bg: "from-amber-100 to-amber-50",
				text: "text-amber-600",
			},
			"On Hold": {
				badge: "bg-rose-400",
				bg: "from-rose-100 to-rose-50",
				text: "text-rose-600",
			},
			Discharged: {
				badge: "bg-emerald-500",
				bg: "from-emerald-100 to-emerald-50",
				text: "text-emerald-600",
			},
			Completed: {
				badge: "bg-emerald-500",
				bg: "from-emerald-100 to-emerald-50",
				text: "text-emerald-600",
			},
		};
		return (
			map[status] || {
				badge: "bg-slate-400",
				bg: "from-slate-100 to-slate-50",
				text: "text-slate-600",
			}
		);
	})();

	// Date filter has been removed, the dashboard now permanently stays on 'today' (filterDate).

	onMount(() => {
		loadEncounters();
		loadShifts();
		loadReferrals();
		refreshInterval = setInterval(loadEncounters, 30000);
		shiftInterval = setInterval(updateShift, 60000);
	});

	onDestroy(() => {
		if (refreshInterval) clearInterval(refreshInterval);
		if (shiftInterval) clearInterval(shiftInterval);
	});
</script>

<svelte:head>
	<title>Dashboard Dokter — Oratio Clinic</title>
</svelte:head>

<div
	class="-m-6 flex h-[calc(100vh-73px)] bg-slate-50 overflow-hidden font-sans relative"
>
	<section
		class="flex-1 min-w-0 {isSidebarOpen && selectedEncounterData
			? 'mr-80'
			: 'mr-0'} transition-all duration-300 ease-in-out overflow-y-auto overflow-x-hidden custom-scrollbar p-6"
	>
		<!-- Date Display -->
		<div class="flex items-center justify-end mb-6">
			<p
				class="text-xs font-bold text-slate-400 uppercase tracking-widest"
			>
				{new Date(filterDate + "T00:00:00").toLocaleDateString(
					"id-ID",
					{
						weekday: "long",
						day: "numeric",
						month: "long",
						year: "numeric",
					},
				)}
			</p>
		</div>

		<div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
			<!-- Patients Today Card -->
			<div
				class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between group hover:shadow-md transition-shadow"
			>
				<div>
					<p
						class="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-none mb-2"
					>
						Patients Today
					</p>
					<div class="flex items-center gap-2 mt-1">
						<h3 class="text-3xl font-black text-blue-900 leading-tight">
							{stats.patientsToday || 0}
						</h3>
						{#if stats.patientsTodayChange !== undefined}
							{@const chg = stats.patientsTodayChange}
							{@const isZero = chg === 0}
							{@const isPos = chg > 0}
							{#if isZero}
								<span class="text-slate-400 text-xs font-bold flex items-center">-</span>
							{:else}
								<span class="{isPos ? 'text-green-500' : 'text-red-500'} text-xs font-bold flex items-center">
									{isPos ? '+' : '-'}{Math.abs(chg)}% <span class="material-symbols-outlined text-[14px]">
										{isPos ? 'trending_up' : 'trending_down'}
									</span>
								</span>
							{/if}
						{/if}
					</div>
				</div>
				<div
					class="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
				>
					<span class="material-symbols-outlined text-2xl"
						>patient_list</span
					>
				</div>
			</div>

			<!-- Avg. Wait Time Card -->
			<div
				class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between group hover:shadow-md transition-shadow"
			>
				<div>
					<p
						class="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-none mb-2"
					>
						Avg. Wait Time
					</p>
					<div class="flex items-center gap-2 mt-1">
						<h3 class="text-3xl font-black text-blue-900 leading-tight">
							{stats.avgWaitMinutes || 0}<span class="text-sm font-bold text-slate-400 ml-1">m</span>
						</h3>
						{#if stats.avgWaitMinutesChange !== undefined}
							{@const chg = stats.avgWaitMinutesChange}
							{@const isZero = chg === 0}
							{@const isPos = chg > 0}
							{#if isZero}
								<span class="text-slate-400 text-xs font-bold flex items-center">-</span>
							{:else}
								<span class="{isPos ? 'text-green-500' : 'text-red-500'} text-xs font-bold flex items-center">
									{isPos ? '+' : '-'}{Math.abs(chg)}% <span class="material-symbols-outlined text-[14px]">
										{isPos ? 'trending_up' : 'trending_down'}
									</span>
								</span>
							{/if}
						{/if}
					</div>
				</div>
				<div
					class="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
				>
					<span class="material-symbols-outlined text-2xl"
						>hourglass_empty</span
					>
				</div>
			</div>

			<!-- Avg. Treatment Time Card -->
			<div
				class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between group hover:shadow-md transition-shadow"
			>
				<div>
					<p
						class="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-none mb-2"
					>
						Avg. Treatment Time
					</p>
					<div class="flex items-center gap-2 mt-1">
						<h3 class="text-3xl font-black text-blue-900 leading-tight">
							{stats.avgTreatmentMinutes || 0}<span class="text-sm font-bold text-slate-400 ml-1">m</span>
						</h3>
						{#if stats.avgTreatmentMinutesChange !== undefined}
							{@const chg = stats.avgTreatmentMinutesChange}
							{@const isZero = chg === 0}
							{@const isPos = chg > 0}
							{#if isZero}
								<span class="text-slate-400 text-xs font-bold flex items-center">-</span>
							{:else}
								<span class="{isPos ? 'text-green-500' : 'text-red-500'} text-xs font-bold flex items-center">
									{isPos ? '+' : '-'}{Math.abs(chg)}% <span class="material-symbols-outlined text-[14px]">
										{isPos ? 'trending_up' : 'trending_down'}
									</span>
								</span>
							{/if}
						{/if}
					</div>
				</div>
				<div
					class="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
				>
					<span class="material-symbols-outlined text-2xl"
						>schedule</span
					>
				</div>
			</div>

			<!-- Completed Card -->
			<div
				class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between group hover:shadow-md transition-shadow"
			>
				<div>
					<p
						class="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-none mb-2"
					>
						Completed
					</p>
					<div class="flex items-center gap-2 mt-1">
						<h3 class="text-3xl font-black text-blue-900 leading-tight">
							{stats.completedToday || 0}
							<span class="text-sm font-bold text-slate-300 mx-1">/</span>
							<span class="text-xl text-slate-400">{stats.patientsToday || 0}</span>
						</h3>
						{#if stats.completedTodayChange !== undefined}
							{@const chg = stats.completedTodayChange}
							{@const isZero = chg === 0}
							{@const isPos = chg > 0}
							{#if isZero}
								<span class="text-slate-400 text-xs font-bold flex items-center">-</span>
							{:else}
								<span class="{isPos ? 'text-green-500' : 'text-red-500'} text-xs font-bold flex items-center">
									{isPos ? '+' : '-'}{Math.abs(chg)}% <span class="material-symbols-outlined text-[14px]">
										{isPos ? 'trending_up' : 'trending_down'}
									</span>
								</span>
							{/if}
						{/if}
					</div>
				</div>
				<div
					class="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
				>
					<span class="material-symbols-outlined text-2xl"
						>check_circle</span
					>
				</div>
			</div>
		</div>

		<!-- 2. Patient Queue Section -->
		<div
			class="mb-10"
			style="display: grid; grid-template-columns: minmax(0, 1fr);"
		>
			<div class="flex items-center justify-between mb-6">
				<h3
					class="text-lg font-bold text-blue-900 flex items-center gap-2"
				>
					<span class="material-symbols-outlined text-primary"
						>pending_actions</span
					>
					Active Patient Queue
				</h3>
				<span
					class="text-xs font-bold text-slate-500 bg-slate-200 px-3 py-1 rounded-md"
				>
					{todayQueue.length + inProgress.length} IN QUEUE
				</span>
			</div>

			{#if loading}
				<div style="text-align: center; padding: 2rem;">
					<div
						class="spinner spinner-lg"
						style="margin: 0 auto;"
					></div>
				</div>
			{:else}
				<div
					style="
					overflow: hidden;
					mask-image: linear-gradient(to right, black 80%, transparent 100%);
					-webkit-mask-image: linear-gradient(to right, black 80%, transparent 100%);
				"
				>
					<div
						class="flex gap-6 pb-6 custom-scrollbar snap-x"
						style="overflow-x: auto; overflow-y: visible;"
					>
						{#each encounters
							.filter( (e) => ["Arrived", "Planned", "In Progress", "On Hold"].includes(e.encounter?.status), )
							.sort((a, b) => {
								const qA = a.encounter?.queue_number ?? Infinity;
								const qB = b.encounter?.queue_number ?? Infinity;
								if (qA !== qB) return qA - qB;
								return new Date(a.encounter?.created_at) - new Date(b.encounter?.created_at);
							}) as row, index}
							<!-- Status color map -->
							{@const statusConfig = {
								"In Progress": {
									banner: "bg-blue-500 text-white",
									queueBg: "bg-blue-50 text-blue-600",
									ring: "border-blue-400 ring-2 ring-blue-100",
								},
								Arrived: {
									banner: "bg-emerald-500 text-white",
									queueBg: "bg-emerald-50 text-emerald-600",
									ring: "border-emerald-400 ring-2 ring-emerald-100",
								},
								Planned: {
									banner: "bg-amber-400 text-white",
									queueBg: "bg-amber-50 text-amber-600",
									ring: "border-amber-400 ring-2 ring-amber-100",
								},
								"On Hold": {
									banner: "bg-rose-400 text-white",
									queueBg: "bg-rose-50 text-rose-500",
									ring: "border-rose-400 ring-2 ring-rose-100",
								},
							}}
							{@const config = statusConfig[
								row.encounter?.status
							] ?? {
								banner: "bg-slate-400 text-white",
								queueBg: "bg-slate-50 text-slate-400",
								ring: "border-slate-300 ring-2 ring-slate-100",
							}}

							<!-- svelte-ignore a11y-click-events-have-key-events // svelte-ignore a11y-no-static-element-interactions -->
							<div
								class="bg-white p-6 rounded-2xl shadow-sm border overflow-hidden transition-all cursor-pointer relative shrink-0 snap-start
									{selectedEncounterData?.encounter?.id === row.encounter?.id
									? config.ring
									: 'border-slate-100 hover:shadow-md'}"
								style="min-width: 340px; width: 340px;"
								on:click={() => selectEncounter(row)}
							>
								<!-- Status Banner (top-right ribbon) -->
								<div class="absolute top-0 right-0">
									<div
										class="relative w-28 h-28 overflow-hidden"
									>
										<div
											class="absolute top-4 -right-7 w-36 text-center py-1 text-[10px] font-black uppercase tracking-widest shadow-sm rotate-45 {config.banner}"
										>
											{row.encounter?.status || "Waiting"}
										</div>
									</div>
								</div>

								<div
									class="flex justify-between items-start mb-4"
								>
									<div
										class="w-14 h-14 rounded-xl flex items-center justify-center font-bold text-xl {config.queueBg}"
									>
										{String(
											row.encounter?.queue_number ||
												index + 1,
										).padStart(2, "0")}
									</div>
								</div>

								<div class="mb-6">
									<div
										class="text-xs text-slate-400 font-bold mb-1"
									>
										{String(row.encounter?.id).padStart(
											5,
											"0",
										)}
									</div>
									<h4
										class="text-xl font-bold text-slate-900 mb-2"
									>
										{row.patient_name}
									</h4>
									<p
										class="text-sm text-slate-500 leading-relaxed line-clamp-2"
									>
										<span
											class="font-bold text-slate-700 text-xs uppercase tracking-wider"
										>
											{row.patient?.gender === "Male" ||
											row.patient?.gender === "L"
												? "Laki-laki"
												: row.patient?.gender ===
															"Female" ||
													  row.patient?.gender ===
															"P"
													? "Perempuan"
													: row.patient?.gender ||
														"-"} • {calculateAge(
												row.patient?.birth_date,
											)}th
										</span>
										<br />
										Alasan Kunjungan: {row.encounter_reason_display}
									</p>
								</div>

								<div
									class="pt-4 border-t border-slate-50 flex justify-between items-center"
								>
									<div class="flex items-center gap-2">
										<div
											class="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shadow-sm"
										>
											{#if row.kasir_profile_image}
												<img
													src={row.kasir_profile_image}
													alt={row.kasir_name}
													class="w-full h-full object-cover"
												/>
											{:else}
												<span
													class="text-[10px] font-bold text-slate-400"
												>
													{row.kasir_name
														? row.kasir_name
																.substring(0, 2)
																.toUpperCase()
														: "??"}
												</span>
											{/if}
										</div>
										<span
											class="text-[10px] font-bold text-slate-400 uppercase tracking-widest"
										>
											{row.kasir_name || "System"}
										</span>
									</div>
									<span
										class="text-[10px] font-black text-slate-400 tracking-wider uppercase"
									>
										Wait Time: {formatElapsedTime(
											row.encounter?.created_at,
										)}
									</span>
								</div>
							</div>
						{/each}

						{#if encounters.filter( (e) => ["Arrived", "Planned", "In Progress", "On Hold"].includes(e.encounter?.status), ).length === 0}
							<div
								class="col-span-full py-8 text-center text-slate-400 text-sm font-medium"
							>
								Bagus! Tidak ada antrian pasien saat ini.
							</div>
						{/if}
					</div>
				</div>
			{/if}
		</div>

		<!-- 3. Referral Inbox Section -->
		<div>
			<div class="flex items-center justify-between mb-6">
				<h3
					class="text-lg font-bold text-blue-900 flex items-center gap-2"
				>
					<span class="material-symbols-outlined text-primary"
						>inbox</span
					>
					Referral Inbox
				</h3>
				<button
					class="text-[11px] font-bold text-primary uppercase tracking-widest hover:underline"
					>View All</button
				>
			</div>
			<div
				class="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden"
			>
				<table class="w-full text-left">
					<thead>
						<tr class="bg-slate-50/50">
							<th class="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest cursor-pointer hover:text-primary transition-colors select-none group" on:click={() => handleSort('doctor')}>
							    <div class="flex items-center gap-1">Sender Doctor<span class="material-symbols-outlined text-[14px] {sortKey === 'doctor' ? 'text-primary' : 'text-slate-300 opacity-0 group-hover:opacity-100'}">{sortKey === 'doctor' ? (sortDesc ? 'arrow_downward' : 'arrow_upward') : 'unfold_more'}</span></div>
							</th>
							<th class="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest cursor-pointer hover:text-primary transition-colors select-none group" on:click={() => handleSort('date')}>
							    <div class="flex items-center gap-1">Date<span class="material-symbols-outlined text-[14px] {sortKey === 'date' ? 'text-primary' : 'text-slate-300 opacity-0 group-hover:opacity-100'}">{sortKey === 'date' ? (sortDesc ? 'arrow_downward' : 'arrow_upward') : 'unfold_more'}</span></div>
							</th>
							<th class="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest cursor-pointer hover:text-primary transition-colors select-none group" on:click={() => handleSort('patient')}>
							    <div class="flex items-center gap-1">Patient Name<span class="material-symbols-outlined text-[14px] {sortKey === 'patient' ? 'text-primary' : 'text-slate-300 opacity-0 group-hover:opacity-100'}">{sortKey === 'patient' ? (sortDesc ? 'arrow_downward' : 'arrow_upward') : 'unfold_more'}</span></div>
							</th>
							<th class="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest cursor-pointer hover:text-primary transition-colors select-none group" on:click={() => handleSort('note')}>
							    <div class="flex items-center gap-1">Note<span class="material-symbols-outlined text-[14px] {sortKey === 'note' ? 'text-primary' : 'text-slate-300 opacity-0 group-hover:opacity-100'}">{sortKey === 'note' ? (sortDesc ? 'arrow_downward' : 'arrow_upward') : 'unfold_more'}</span></div>
							</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-slate-50">
						{#if loadingReferrals}
							<tr>
								<td colspan="4" class="px-6 py-10 text-center">
									<div
										class="spinner spinner-sm"
										style="margin: 0 auto;"
									></div>
									<p class="text-[10px] text-slate-400 mt-2">
										Loading referrals...
									</p>
								</td>
							</tr>
						{:else if referrals.length > 0}
							{#each sortedReferrals as ref}
								<tr
									class="hover:bg-slate-50 transition-colors cursor-pointer group"
								>
									<td class="px-6 py-5">
										<div class="flex items-center gap-3">
											<div
												class="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-400 shadow-sm overflow-hidden"
											>
												{#if ref.sender_profile_image}
													<img
														src={ref.sender_profile_image}
														alt={ref.sender_name}
														class="w-full h-full object-cover"
													/>
												{:else}
												    {ref.sender_name?.[0] || "D"}
												{/if}
											</div>
											<div>
												<div
													class="text-sm font-bold text-slate-900"
												>
													{ref.sender_name}
												</div>
												<div
													class="text-[10px] text-slate-400"
												>
													Sender Doctor
												</div>
											</div>
										</div>
									</td>
									<td
										class="px-6 py-5 text-xs text-slate-600 font-medium"
									>
										{formatDate(ref.referral_date)}
									</td>
									<td class="px-6 py-5">
										<div
											class="text-sm font-bold text-slate-900"
										>
											{ref.patient_name}
										</div>
										<div class="text-[10px] text-slate-400">
											ID: {ref.patient_id}
										</div>
									</td>
									<td class="px-6 py-5">
										<p
											class="text-sm text-slate-500 line-clamp-1 italic"
										>
											"{ref.note || "No note"}"
										</p>
									</td>
								</tr>
							{/each}
						{:else}
							<tr>
								<td
									colspan="4"
									class="px-6 py-10 text-center text-slate-400 text-sm font-medium"
								>
									Tidak ada rujukan masuk saat ini.
								</td>
							</tr>
						{/if}
					</tbody>
				</table>
			</div>
		</div>
	</section>

	<!-- Right Pinned Sidebar (Patient Context) -->
	<aside
		class="fixed right-0 top-16 bottom-0 w-80 bg-white border-l border-slate-200 z-[40] flex flex-col shadow-2xl transition-transform duration-300 ease-in-out {isSidebarOpen &&
		selectedEncounterData
			? 'translate-x-0'
			: 'translate-x-full'}"
	>
		{#if selectedEncounterData}
			<div class="flex-1 overflow-y-auto custom-scrollbar relative">
				<!-- Close Button -->
				<button
					type="button"
					class="absolute top-4 right-4 z-50 w-8 h-8 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full transition-colors"
					on:click={() => (isSidebarOpen = false)}
				>
					<span class="material-symbols-outlined text-[18px]"
						>close</span
					>
				</button>

				<!-- Patient Header -->
				<div class="p-6 border-b border-slate-100 bg-slate-50/30">
					<div class="flex flex-col items-center text-center">
						<div class="relative mb-4">
							<div
								class="w-20 h-20 rounded-full ring-4 ring-white shadow-xl bg-gradient-to-br {selectedStatusConfig.bg} flex items-center justify-center transition-transform hover:scale-105 duration-300"
							>
								<span
									class="text-3xl font-black {selectedStatusConfig.text} drop-shadow-sm"
									>{selectedEncounterData.patient_name
										.substring(0, 2)
										.toUpperCase()}</span
								>
							</div>
							<div
								class="absolute -bottom-1 -right-1 w-7 h-7 {selectedStatusConfig.badge} rounded-full border-2 border-white shadow-lg flex items-center justify-center z-10"
							>
								<span class="text-white text-[11px] font-black"
									>{selectedEncounterData.encounter
										?.queue_number || "-"}</span
								>
							</div>
						</div>
						<h3
							class="text-lg font-bold text-slate-800 leading-tight"
						>
							{selectedEncounterData.patient_name}
						</h3>
						<p
							class="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest"
						>
							ID Tindakan: {selectedEncounterData.encounter?.id ||
								"-"}
						</p>
					</div>
				</div>

				<!-- Context Sections -->
				<div class="p-6 flex flex-col gap-8 pb-32">
					<!-- Encounter Reason -->
					{#if selectedEncounterData.encounter?.reason_type || selectedEncounterData.encounter_reason_display}
						<section>
							<h4
								class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2"
							>
								<span class="material-symbols-outlined text-sm"
									>assignment</span
								>
								Encounter Reason
							</h4>
							<div
								class="p-4 rounded-2xl border {REASON_THEMES[
									selectedEncounterData.encounter?.reason_type
								]?.bg || 'bg-slate-50'} {REASON_THEMES[
									selectedEncounterData.encounter?.reason_type
								]?.border || 'border-slate-200'}"
							>
								<div class="flex items-center gap-3">
									<div
										class="w-8 h-8 rounded-lg flex items-center justify-center {REASON_THEMES[
											selectedEncounterData.encounter
												?.reason_type
										]?.bg ||
											'bg-white'} border {REASON_THEMES[
											selectedEncounterData.encounter
												?.reason_type
										]?.border ||
											'border-slate-200'} {REASON_THEMES[
											selectedEncounterData.encounter
												?.reason_type
										]?.text || 'text-slate-600'}"
									>
										<span
											class="material-symbols-outlined text-[18px]"
											>{REASON_THEMES[
												selectedEncounterData.encounter
													?.reason_type
											]?.icon || "info"}</span
										>
									</div>
									<div>
										<p
											class="text-[9px] font-black uppercase tracking-widest {REASON_THEMES[
												selectedEncounterData.encounter
													?.reason_type
											]?.text || 'text-slate-500'}"
										>
											{REASON_THEMES[
												selectedEncounterData.encounter
													?.reason_type
											]?.label || "Visit Reason"}
										</p>
										<p
											class="text-xs font-bold text-slate-800 leading-tight"
										>
											{selectedEncounterData.encounter_reason_display ||
												"No detailed reason provided"}
										</p>
									</div>
								</div>
							</div>
						</section>
					{/if}

					<!-- Identification Section -->
					<section>
						<h4
							class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2"
						>
							<span class="material-symbols-outlined text-sm"
								>id_card</span
							>
							Identification
						</h4>
						<div class="space-y-3">
							<div
								class="flex justify-between items-center group"
							>
								<span class="text-[11px] text-slate-500"
									>Patient ID</span
								>
								<span
									class="text-[11px] font-bold text-slate-800"
									>{selectedEncounterData.encounter
										?.patient_id || "-"}</span
								>
							</div>
							<div class="flex justify-between items-center">
								<span class="text-[11px] text-slate-500"
									>DOB / Age</span
								>
								<span
									class="text-[11px] font-bold text-slate-800"
									>{formatDate(
										selectedEncounterData.patient_birth_date ||
											selectedEncounterData.patient
												?.birth_date,
									) || "-"} ({calculateAge(
										selectedEncounterData.patient_birth_date ||
											selectedEncounterData.patient
												?.birth_date,
									)}y)</span
								>
							</div>
							<div class="flex justify-between items-center">
								<span class="text-[11px] text-slate-500"
									>Gender</span
								>
								<div class="flex items-center gap-1">
									{#if selectedEncounterData.patient?.gender === "Male" || selectedEncounterData.patient?.gender === "L" || selectedEncounterData.patient?.gender === "male"}
										<span
											class="material-symbols-outlined text-[14px] text-blue-500"
											>male</span
										>
									{:else if (selectedEncounterData.patient_gender || selectedEncounterData.patient?.gender) === "Female" || (selectedEncounterData.patient_gender || selectedEncounterData.patient?.gender) === "P" || (selectedEncounterData.patient_gender || selectedEncounterData.patient?.gender) === "female"}
										<span
											class="material-symbols-outlined text-[14px] text-pink-500"
											>female</span
										>
									{/if}
									<span
										class="text-[11px] font-bold text-slate-800"
										>{(selectedEncounterData.patient_gender ||
											selectedEncounterData.patient
												?.gender) === "Male" ||
										(selectedEncounterData.patient_gender ||
											selectedEncounterData.patient
												?.gender) === "L" ||
										(selectedEncounterData.patient_gender ||
											selectedEncounterData.patient
												?.gender) === "male"
											? "Male"
											: (selectedEncounterData.patient_gender ||
														selectedEncounterData
															.patient
															?.gender) ===
														"Female" ||
												  (selectedEncounterData.patient_gender ||
														selectedEncounterData
															.patient
															?.gender) === "P" ||
												  (selectedEncounterData.patient_gender ||
														selectedEncounterData
															.patient
															?.gender) ===
														"female"
												? "Female"
												: selectedEncounterData.patient_gender ||
													selectedEncounterData
														.patient?.gender ||
													"-"}</span
									>
								</div>
							</div>
							<div class="flex justify-between items-start">
								<span class="text-[11px] text-slate-500"
									>Address</span
								>
								<span
									class="text-[11px] font-bold text-slate-800 text-right w-30 leading-relaxed"
									>{selectedEncounterData.patient_address ||
										selectedEncounterData.patient
											?.address ||
										"-"}</span
								>
							</div>
							<div class="flex justify-between items-center">
								<span class="text-[11px] text-slate-500"
									>Contact</span
								>
								<div class="text-right">
									{#if selectedEncounterData.patient_email || selectedEncounterData.patient?.email}
										<a
											href="mailto:{selectedEncounterData.patient_email ||
												selectedEncounterData.patient
													?.email}"
											class="text-[11px] font-bold text-primary hover:underline flex items-center justify-end gap-1"
										>
											<span
												class="material-symbols-outlined text-[14px]"
												>mail</span
											>
											{selectedEncounterData.patient_email ||
												selectedEncounterData.patient
													?.email}
										</a>
									{/if}
									{#if selectedEncounterData.patient_handphone || selectedEncounterData.patient?.handphone}
										<a
											href={getWhatsAppUrl(
												selectedEncounterData.patient_handphone ||
													selectedEncounterData
														.patient?.handphone,
											)}
											target="_blank"
											class="text-[11px] font-bold text-primary hover:underline flex items-center justify-end gap-1"
										>
											<span
												class="material-symbols-outlined text-[14px]"
												>chat</span
											>
											{selectedEncounterData.patient_handphone ||
												selectedEncounterData.patient
													?.handphone}
										</a>
									{:else}
										<span
											class="text-[11px] font-bold text-slate-800"
											>-</span
										>
									{/if}
								</div>
							</div>
						</div>
					</section>

					<!-- Medical Background -->
					<section id="aside-medical-background">
						<header class="flex items-center justify-between mb-4">
							<h4
								class="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"
							>
								<span class="material-symbols-outlined text-sm"
									>medical_services</span
								>
								Medical Background
							</h4>
						</header>

						<div class="grid grid-cols-2 gap-3 mb-4">
							<!-- Blood Type -->
							<div
								class="p-3 bg-blue-50 rounded-xl border border-blue-100 flex items-center justify-between"
							>
								<div class="flex flex-col">
									<span
										class="text-[10px] text-blue-600 uppercase font-bold"
									>
										Blood Type
									</span>

									<div class="flex items-baseline gap-1">
										<span
											class="text-lg font-black text-blue-900"
										>
											{selectedEncounterData.patient_blood_type ||
												selectedEncounterData.patient
													?.blood_type ||
												"-"}
										</span>
										<span
											class="text-sm font-bold text-blue-700"
										>
											{(selectedEncounterData.patient_rhesus ||
												selectedEncounterData.patient
													?.rhesus) === "+"
												? "+"
												: (selectedEncounterData.patient_rhesus ||
															selectedEncounterData
																.patient
																?.rhesus) ===
													  "-"
													? "-"
													: ""}
										</span>
									</div>
								</div>

								<span
									class="material-symbols-outlined text-blue-400 shrink-0"
								>
									bloodtype
								</span>
							</div>

							<!-- BP -->
							<div
								class="p-3 bg-blue-50 rounded-xl border border-blue-100 flex items-center justify-between"
							>
								<div class="flex flex-col flex-1">
									<span
										class="text-[10px] text-blue-600 uppercase font-bold"
									>
										BP
									</span>

									<div class="flex items-baseline gap-1">
										<span
											class="text-lg font-black text-blue-900"
										>
											{selectedEncounterData.patient_tekanan_darah ||
												selectedEncounterData.patient
													?.tekanan_darah ||
												"-"}
										</span>
										<span
											class="text-[10px] font-bold text-blue-700"
										>
											mmHg
										</span>
									</div>
								</div>

								<span
									class="material-symbols-outlined text-blue-400 shrink-0"
								>
									vital_signs
								</span>
							</div>
						</div>

						{#if loadingMedical}
							<div class="py-6 flex justify-center">
								<span
									class="material-symbols-outlined animate-spin text-primary"
									>progress_activity</span
								>
							</div>
						{:else if patientMedicalBackground}
							<!-- Allergy Section -->
							<div class="mb-8">
								<p
									class="text-[10px] text-slate-400 font-bold uppercase mb-3 flex items-center gap-2"
								>
									Allergies
								</p>
								{#if patientMedicalBackground.allergies?.length > 0}
									<div class="space-y-3">
										{#each patientMedicalBackground.allergies as allergy}
											<div
												class="bg-red-50 border border-red-100 p-3 rounded-xl flex items-start gap-3"
											>
												<span
													class="material-symbols-outlined text-red-500 text-lg"
													style="font-variation-settings: 'FILL' 1;"
													>warning</span
												>
												<div>
													<p
														class="text-xs font-bold text-red-900 leading-tight"
													>
														{allergy.substance ||
															"Unknown Substance"}
													</p>
													{#if allergy.reaction_display}
														<p
															class="text-[10px] font-medium text-red-700 leading-tight mt-0.5"
														>
															{allergy.reaction_display}
														</p>
													{/if}
												</div>
											</div>
										{/each}
									</div>
								{:else}
									<p
										class="text-[11px] font-medium text-slate-400 italic bg-slate-50/50 p-2.5 rounded-xl border border-dashed border-slate-200 text-center"
									>
										No allergies reported
									</p>
								{/if}
							</div>

							<div class="space-y-8">
								<!-- Illness (Personal) -->
								<div class="space-y-3">
									<p
										class="text-[10px] text-slate-400 font-bold uppercase mb-3 flex items-center gap-2"
									>
										Illness / History
									</p>
									<p
										class="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-2"
									>
										<span
											class="w-1 h-1 rounded-full bg-orange-400"
										></span>
										Illness (Personal)
									</p>
									{#if personalDiseases.length > 0}
										{#each personalDiseases as disease}
											<div
												class="flex items-start gap-3 p-3 rounded-xl bg-orange-50/50 border border-orange-100"
											>
												<div
													class="w-7 h-7 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center shrink-0"
												>
													<span
														class="material-symbols-outlined text-[14px]"
														>person</span
													>
												</div>
												<div>
													<p
														class="text-xs font-bold text-slate-800 leading-tight"
													>
														{disease.disease ||
															"Condition"}
													</p>
													{#if disease.description}
														<p
															class="text-[10px] text-slate-500 mt-0.5"
														>
															{disease.description}
														</p>
													{/if}
												</div>
											</div>
										{/each}
									{:else}
										<p
											class="text-[11px] font-medium text-slate-400 italic bg-slate-50/50 p-2.5 rounded-xl border border-dashed border-slate-200 text-center"
										>
											None reported
										</p>
									{/if}
								</div>

								<!-- Illness (Family) -->
								<div class="space-y-3">
									<p
										class="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-2"
									>
										<span
											class="w-1 h-1 rounded-full bg-purple-400"
										></span>
										Illness (Family)
									</p>
									{#if familyDiseases.length > 0}
										{#each familyDiseases as disease}
											<div
												class="flex items-start gap-3 p-3 rounded-xl bg-purple-50/50 border border-purple-100"
											>
												<div
													class="w-7 h-7 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center shrink-0"
												>
													<span
														class="material-symbols-outlined text-[14px]"
														>family_history</span
													>
												</div>
												<div>
													<p
														class="text-xs font-bold text-slate-800 leading-tight"
													>
														{disease.disease ||
															"Condition"}
													</p>
													{#if disease.description}
														<p
															class="text-[10px] text-slate-500 mt-0.5"
														>
															{disease.description}
														</p>
													{/if}
												</div>
											</div>
										{/each}
									{:else}
										<p
											class="text-[11px] font-medium text-slate-400 italic bg-slate-50/50 p-2.5 rounded-xl border border-dashed border-slate-200 text-center"
										>
											None reported
										</p>
									{/if}
								</div>
								<div class="space-y-2">
									<p
										class="text-[10px] text-slate-400 font-bold uppercase mb-2"
									>
										Current Medication
									</p>
									{#if patientMedicalBackground.medications?.length > 0}
										{#each patientMedicalBackground.medications as med}
											<div
												class="flex items-start gap-3 p-3 rounded-xl bg-emerald-50/50 border border-emerald-100"
											>
												<div
													class="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0"
												>
													<span
														class="material-symbols-outlined text-[16px]"
														>prescriptions</span
													>
												</div>
												<div>
													<p
														class="text-xs font-bold text-slate-800 leading-tight mb-0.5"
													>
														{med.product_name ||
															med.medication ||
															"Unknown"}
													</p>
													<p
														class="text-[10px] font-medium text-slate-600 leading-tight"
													>
														{med.dosage_form || ""}
														{med.dosage || ""}
													</p>
												</div>
											</div>
										{/each}
									{:else}
										<p
											class="text-[11px] font-medium text-slate-400 italic bg-slate-50 p-3 rounded-xl border border-dashed border-slate-200 text-center"
										>
											None reported
										</p>
									{/if}
								</div>
							</div>
						{/if}
					</section>

					<!-- Encounter History -->
					<section>
						<h4
							class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2"
						>
							<span class="material-symbols-outlined text-sm"
								>history</span
							>
							Encounter History
						</h4>
						<div
							class="space-y-4 relative before:absolute before:left-[7px] before:top-2 before:bottom-0 before:w-[2px] before:bg-slate-100 pb-2"
						>
							{#each patientHistory as hist, i}
								<div class="relative pl-6">
									<div
										class="absolute left-0 top-1.5 w-[16px] h-[16px] bg-white border-2 {i ===
										0
											? 'border-primary'
											: 'border-slate-200'} rounded-full"
									></div>

									<!-- svelte-ignore a11y-click-events-have-key-events // svelte-ignore a11y-no-static-element-interactions -->
									<div
										class="cursor-pointer group"
										on:click={() =>
											toggleHistory(hist.encounter?.id)}
									>
										<div
											class="flex justify-between items-start"
										>
											<div>
												<p
													class="text-[11px] font-bold text-slate-800 group-hover:text-primary transition-colors"
												>
													{hist.encounter?.id}
												</p>
												<p
													class="text-[10px] text-slate-500"
												>
													{formatDate(
														hist.encounter
															?.created_at,
													)}
													{#if hist.doctor_name}
														• {hist.doctor_name}
													{/if}
												</p>
												<p
													class="text-[10px] text-slate-400 mt-0.5"
												>
													{hist.encounter?.status}
												</p>
											</div>
											<span
												class="material-symbols-outlined text-slate-400 text-lg group-hover:text-primary transition-colors"
											>
												{expandedHistoryId ===
												hist.encounter?.id
													? "expand_less"
													: "expand_more"}
											</span>
										</div>

										{#if expandedHistoryId === hist.encounter?.id}
											<div
												class="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-100 text-[11px] text-slate-700 space-y-2 relative z-10 leading-relaxed shadow-inner"
											>
												{#if hist.encounter?.subjective}
													<div class="whitespace-pre-wrap">
														<strong
															class="text-blue-900 font-black"
															>S:</strong
														>
														{hist.encounter
															.subjective}
													</div>
												{/if}
												{#if hist.encounter?.objective}
													<div class="whitespace-pre-wrap">
														<strong
															class="text-blue-900 font-black"
															>O:</strong
														>
														{hist.encounter
															.objective}
													</div>
												{/if}
												{#if hist.encounter?.assessment}
													<div class="whitespace-pre-wrap">
														<strong
															class="text-blue-900 font-black"
															>A:</strong
														>
														{hist.encounter
															.assessment}
													</div>
												{/if}
												{#if hist.encounter?.plan}
													<div class="whitespace-pre-wrap">
														<strong
															class="text-blue-900 font-black"
															>P:</strong
														>
														{hist.encounter.plan}
													</div>
												{/if}
												{#if hist.encounter?.resep}
													<div class="whitespace-pre-wrap">
														<strong
															class="text-blue-900 font-black"
															>R:</strong
														>
														{hist.encounter.resep}
													</div>
												{/if}
												{#if hist.encounter?.keterangan}
													<div
														class="mt-1 p-2 bg-amber-50 rounded border border-amber-100 text-amber-800 whitespace-pre-wrap"
													>
														<strong
															class="font-black"
															>Ket:</strong
														>
														{hist.encounter
															.keterangan}
													</div>
												{/if}
												{#if !hist.encounter?.subjective && !hist.encounter?.assessment && !hist.encounter?.objective && !hist.encounter?.plan && !hist.encounter?.resep && !hist.encounter?.keterangan}
													<div
														class="italic text-slate-400"
													>
														No clinical notes
														recorded.
													</div>
												{/if}
												<div
													class="pt-2 mt-2 border-t border-slate-200 flex justify-between items-center"
												>
													<span
														class="text-[9px] font-bold uppercase tracking-wider text-slate-400"
														>Status: {hist.encounter
															?.status}</span
													>
												</div>
											</div>
										{/if}
									</div>
								</div>
							{:else}
								<div class="relative pl-6">
									<p
										class="text-[11px] font-medium text-slate-500 italic"
									>
										No past encounters recorded.
									</p>
								</div>
							{/each}
						</div>
					</section>
				</div>
			</div>

			<!-- Bottom Actions Sticky -->
			<div
				class="sticky bottom-0 bg-white p-6 border-t border-slate-100 flex flex-col gap-2 shrink-0"
			>
				<button
					on:click={startEncounter}
					class="w-full bg-primary hover:bg-blue-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2"
				>
					<span class="material-symbols-outlined text-[20px]"
						>play_arrow</span
					>
					Start New Encounter
				</button>
			</div>
		{:else}
			<div
				class="flex-1 flex flex-col items-center justify-center p-6 text-center text-slate-400"
			>
				<span
					class="material-symbols-outlined text-6xl mb-4 text-slate-200"
					>person_search</span
				>
				<h3 class="text-lg font-bold text-slate-500 mb-2">
					No Patient Selected
				</h3>
				<p class="text-xs">
					Select a patient from the active queue to view details
				</p>
			</div>
		{/if}
	</aside>

	<!-- Button to Reopen Sidebar when collapsed -->
	{#if selectedEncounterData && !isSidebarOpen}
		<button
			class="fixed right-0 top-1/2 -translate-y-1/2 bg-white hover:bg-slate-50 border-y border-l border-slate-200 px-2 py-4 rounded-l-xl shadow-[-8px_0_15px_-4px_rgba(0,0,0,0.1)] z-30 flex flex-col items-center gap-2 group transition-all"
			on:click={() => (isSidebarOpen = true)}
		>
			<span
				class="material-symbols-outlined text-primary group-hover:scale-110 transition-transform"
				>menu_open</span
			>
			<span
				class="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-2"
				style="writing-mode: vertical-rl; text-orientation: mixed; transform: rotate(180deg);"
			>
				{selectedEncounterData.patient_name.split(" ")[0]} Profile
			</span>
		</button>
	{/if}
</div>
