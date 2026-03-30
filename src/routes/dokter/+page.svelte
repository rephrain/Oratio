<script>
	import { onMount, onDestroy } from "svelte";
	import { goto } from "$app/navigation";
	import DataTable from "$lib/components/Tables/DataTable.svelte";
	import { STATUS_COLORS, DAYS_OF_WEEK } from "$lib/utils/constants.js";
	import {
		formatElapsedTime,
		formatTime,
		getShiftCountdown,
	} from "$lib/utils/formatters.js";

	export let data;
	$: user = data?.user;

	let encounters = [];
	let loading = true;
	let shiftInfo = { active: false, status: "no-shifts" };
	let doctorShifts = [];
	let refreshInterval;
	let shiftInterval;
	let filterDate = new Date().toISOString().split("T")[0];

	$: todayQueue = encounters.filter((e) =>
		["Planned", "Arrived"].includes(e.encounter?.status),
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
		} catch (err) {
			console.error(err);
		} finally {
			loading = false;
		}
	}

	async function loadShifts() {
		if (!user?.id) return;
		try {
			const res = await fetch(`/api/admin/doctor-shifts?limit=100`);
			const resp = await res.json();
			doctorShifts = (resp.data || []).filter(
				(s) => s.doctor_id === user.id,
			);
			updateShift();
		} catch {}
	}

	function updateShift() {
		shiftInfo = getShiftCountdown(doctorShifts);
	}

	function openEncounter(row) {
		const enc = row.encounter || row;
		if (enc?.id) goto(`/dokter/${enc.id}`);
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

	onMount(() => {
		loadEncounters();
		loadShifts();
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

<div class="-m-6 flex h-[calc(100vh-73px)] bg-slate-50 overflow-hidden font-sans">
	<section class="flex-1 overflow-y-auto custom-scrollbar p-6">
		<!-- 1. Top Section (Blue Banner) -->
		<div class="bg-[#1E40AF] rounded-2xl p-8 mb-8 text-white shadow-xl flex items-center justify-between relative overflow-hidden">
			<div class="relative z-10">
				<p class="text-blue-200 text-xs font-bold uppercase tracking-widest mb-2">
					Session • {new Date(filterDate).toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'short' })}
				</p>
				<h2 class="text-4xl font-bold">
					{#if shiftInfo.active}
						Shift ends in <span class="text-[#FACC15]">{shiftInfo.remaining}</span>
					{:else}
						No Active Shift
					{/if}
				</h2>
				<div class="mt-6 flex gap-4">
					<div class="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-md border border-white/10">
						<span class="material-symbols-outlined text-lg">person</span>
						<span class="text-sm font-semibold">{completedToday.length} Patients Treated</span>
					</div>
					<div class="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-md border border-white/10">
						<span class="material-symbols-outlined text-lg">schedule</span>
						<span class="text-sm font-semibold">{todayQueue.length} Remaining</span>
					</div>
				</div>
			</div>
			<div class="relative z-10 text-right">
				<div class="text-6xl font-black text-white/10 mb-2">STATION 04</div>
				<div class="flex items-center justify-end gap-2 text-sm font-bold text-blue-100">
					{#if shiftInfo.active}
						<span class="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse"></span>
						System Active
					{:else}
						<span class="w-2.5 h-2.5 bg-gray-400 rounded-full"></span>
						Offline
					{/if}
				</div>
			</div>
			<!-- Background Decoration -->
			<div class="absolute -right-16 -bottom-16 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
			<div class="absolute -left-16 -top-16 w-48 h-48 bg-blue-400/10 rounded-full blur-2xl"></div>
		</div>

		<!-- 2. Patient Queue Section -->
		<div class="mb-10">
			<div class="flex items-center justify-between mb-6">
				<h3 class="text-lg font-bold text-blue-900 flex items-center gap-2">
					<span class="material-symbols-outlined text-primary">pending_actions</span>
					Active Patient Queue
				</h3>
				<span class="text-xs font-bold text-slate-500 bg-slate-200 px-3 py-1 rounded-md">{todayQueue.length + inProgress.length} IN QUEUE</span>
			</div>
			
			{#if loading}
				<div style="text-align: center; padding: 2rem;">
					<div class="spinner spinner-lg" style="margin: 0 auto;"></div>
				</div>
			{:else}
				<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
					{#each encounters.filter(e => ['Arrived', 'Planned', 'In Progress'].includes(e.encounter?.status)) as row, index}
						<!-- svelte-ignore a11y-click-events-have-key-events // svelte-ignore a11y-no-static-element-interactions -->
						<div 
							class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all cursor-pointer relative"
							on:click={() => openEncounter(row)}
						>
							<div class="flex justify-between items-start mb-4">
								<div class="w-14 h-14 rounded-xl {row.encounter?.status === 'In Progress' ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-400'} flex items-center justify-center font-bold text-xl">
									{String(row.encounter?.queue_number || index + 1).padStart(2, '0')}
								</div>
								<div class="{row.encounter?.status === 'In Progress' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'} px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tight">
									{row.encounter?.status || 'Waiting'}
								</div>
							</div>
							<div class="mb-6">
								<div class="text-xs text-slate-400 font-bold mb-1">ENC-{String(row.encounter?.id).padStart(5, '0')}</div>
								<h4 class="text-xl font-bold text-slate-900 mb-2">{row.patient_name}</h4>
								<p class="text-sm text-slate-500 leading-relaxed line-clamp-2">
									Poli: {row.encounter?.notes || 'Menunggu pemeriksaan awal'}
								</p>
							</div>
							<div class="pt-4 border-t border-slate-50 flex justify-between items-center">
								<div class="flex items-center gap-2">
									<div class="w-7 h-7 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-500 shadow-sm">
										{row.patient_name.substring(0,2).toUpperCase()}
									</div>
								</div>
								<span class="text-[10px] font-black text-slate-400 tracking-wider uppercase">
									Wait Time: {formatElapsedTime(row.encounter?.created_at)}
								</span>
							</div>
						</div>
					{/each}
					{#if encounters.filter(e => ['Arrived', 'Planned', 'In Progress'].includes(e.encounter?.status)).length === 0}
						<div class="col-span-full py-8 text-center text-slate-400 text-sm font-medium">Bagus! Tidak ada antrian pasien saat ini.</div>
					{/if}
				</div>
			{/if}
		</div>

		<!-- 3. Referral Inbox Section -->
		<div>
			<div class="flex items-center justify-between mb-6">
				<h3 class="text-lg font-bold text-blue-900 flex items-center gap-2">
					<span class="material-symbols-outlined text-primary">inbox</span>
					Referral Inbox
				</h3>
				<button class="text-[11px] font-bold text-primary uppercase tracking-widest hover:underline">View All</button>
			</div>
			<div class="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
				<table class="w-full text-left">
					<thead>
						<tr class="bg-slate-50/50">
							<th class="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Sender Doctor</th>
							<th class="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
							<th class="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Patient Name</th>
							<th class="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Note</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-slate-50">
						<!-- Mock Referral Data -->
						<tr class="hover:bg-slate-50 transition-colors cursor-pointer group">
							<td class="px-6 py-5">
								<div class="flex items-center gap-3">
									<div class="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-400 shadow-sm">ST</div>
									<div>
										<div class="text-sm font-bold text-slate-900">Dr. Sarah Thompson</div>
										<div class="text-[10px] text-slate-400">Cardiology Unit</div>
									</div>
								</div>
							</td>
							<td class="px-6 py-5 text-xs text-slate-600 font-medium">Oct 23, 2024</td>
							<td class="px-6 py-5">
								<div class="text-sm font-bold text-slate-900">David Miller</div>
								<div class="text-[10px] text-slate-400">ID: 8829-X</div>
							</td>
							<td class="px-6 py-5">
								<p class="text-sm text-slate-500 line-clamp-1 italic">"Pre-op clearance for periodontal surgery. Patient has history of hypertension."</p>
							</td>
						</tr>
					</tbody>
				</table>
			</div>
		</div>
	</section>

	<!-- 4. Right Sidebar (Patient Detail) -->
	<aside class="w-80 h-full bg-white border-l border-slate-200 flex flex-col shadow-2xl relative z-30">
		<div class="flex-1 overflow-y-auto custom-scrollbar">
			<!-- Identification Header -->
			<div class="p-6 border-b border-slate-100 bg-slate-50/30 text-center">
				<div class="relative inline-block mb-4">
					<div class="w-24 h-24 rounded-full bg-blue-100 text-blue-500 flex items-center justify-center text-2xl font-bold ring-4 ring-white shadow-xl mx-auto">
						JW
					</div>
					<div class="absolute bottom-0 right-1 w-6 h-6 bg-emerald-500 border-4 border-white rounded-full"></div>
				</div>
				<h2 class="text-xl font-bold text-blue-900">Jonathan Wickham</h2>
				<p class="text-[10px] font-bold text-slate-400 tracking-tighter mt-1 uppercase">NIK: 3174092104920003</p>
				
				<div class="grid grid-cols-2 gap-3 mt-6">
					<div class="bg-slate-50 p-3 rounded-xl border border-slate-100">
						<p class="text-[9px] text-slate-400 font-black uppercase">Age / Sex</p>
						<p class="text-xs font-bold text-slate-900">32y / Male</p>
					</div>
					<div class="bg-slate-50 p-3 rounded-xl border border-slate-100">
						<p class="text-[9px] text-slate-400 font-black uppercase">Blood Type</p>
						<p class="text-xs font-bold text-slate-900">O Positive</p>
					</div>
				</div>
			</div>

			<div class="p-6 space-y-8">
				<section>
					<h4 class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
						<span class="material-symbols-outlined text-sm">id_card</span>
						Identification
					</h4>
					<div class="space-y-3">
						<div class="flex justify-between items-center text-[11px]">
							<span class="text-slate-500">Gender</span>
							<span class="font-bold text-slate-900">Male</span>
						</div>
						<div class="flex justify-between items-start text-[11px]">
							<span class="text-slate-500">Address</span>
							<span class="font-bold text-slate-900 text-right w-40 leading-relaxed">Pondok Indah Residence 4, Jakarta Selatan</span>
						</div>
					</div>
				</section>
				
				<section>
					<h4 class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
						<span class="material-symbols-outlined text-sm">medical_information</span>
						Medical Background
					</h4>
					<div class="flex items-center justify-between p-4 bg-blue-50/50 rounded-xl mb-4 border border-blue-100">
						<div>
							<p class="text-[9px] text-blue-600 font-black uppercase">Current BP</p>
							<div class="flex items-baseline gap-1">
								<span class="text-xl font-black text-blue-900">128/84</span>
								<span class="text-[10px] font-bold text-blue-700">mmHg</span>
							</div>
						</div>
						<span class="material-symbols-outlined text-blue-300 text-3xl">vital_signs</span>
					</div>
					<div class="bg-[#FEF2F2] border-2 border-[#EF4444] p-4 rounded-xl flex items-start gap-3 mb-6">
						<span class="material-symbols-outlined text-[#EF4444] font-bold" style="font-variation-settings: 'FILL' 1;">warning</span>
						<div>
							<p class="text-[10px] text-[#991B1B] font-black uppercase tracking-widest">Critical Allergy</p>
							<p class="text-sm font-black text-[#991B1B]">PENICILLIN</p>
						</div>
					</div>
				</section>
			</div>
		</div>
		<div class="p-6 bg-slate-50 border-t border-slate-200">
			<!-- svelte-ignore a11y-invalid-attribute -->
			<a href="#" class="w-full bg-primary hover:bg-blue-600 text-white font-black py-4 rounded-2xl shadow-lg shadow-blue-100 transition-all flex items-center justify-center gap-3">
				<span class="material-symbols-outlined">edit_note</span>
				Create New SOAP
			</a>
		</div>
	</aside>
</div>
