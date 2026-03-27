<script>
	import QueueCard from './QueueCard.svelte';
	
	export let encounters = []; // Array of { id, queueNumber, patientName, doctorName, status, arrivedAt }

	// Current time to calculate wait durations reactively
	let now = Date.now();
	
	import { onMount, onDestroy } from 'svelte';
	let interval;
	onMount(() => {
		// Auto refresh wait times every 30 seconds
		interval = setInterval(() => { now = Date.now(); }, 30000);
	});
	onDestroy(() => { if (interval) clearInterval(interval); });

	// Group Data by Status
	$: waiting = encounters.filter(e => e.status === 'Waiting');
	$: inProgress = encounters.filter(e => e.status === 'In Progress');
	$: discharged = encounters.filter(e => e.status === 'Discharged');
	$: completed = encounters.filter(e => e.status === 'Completed');
</script>

<div class="mb-4 text-sm font-medium text-muted">
	Hari ini: <strong class="text-primary">{waiting.length}</strong> waiting • 
	<strong>{inProgress.length}</strong> in progress • 
	<strong>{discharged.length}</strong> discharged • 
	<strong>{completed.length}</strong> completed
</div>

<div class="queue-board">
	<!-- WAITING COLUMN -->
	<div class="queue-column">
		<div class="queue-column-header">
			<span class="queue-column-title">Waiting</span>
			<span class="queue-column-count">{waiting.length}</span>
		</div>
		<div class="queue-column-body">
			{#each waiting as p (p.id)}
				<QueueCard 
					queueNumber={p.queueNumber} 
					patientName={p.patientName} 
					doctorName={p.doctorName} 
					status={p.status}
					waitTimeMs={now - new Date(p.arrivedAt).getTime()} 
				/>
			{/each}
			{#if waiting.length === 0}
				<div class="text-center text-muted text-sm p-4">Antrian kosong</div>
			{/if}
		</div>
	</div>

	<!-- IN PROGRESS COLUMN -->
	<div class="queue-column">
		<div class="queue-column-header">
			<span class="queue-column-title">In Progress</span>
			<span class="queue-column-count">{inProgress.length}</span>
		</div>
		<div class="queue-column-body">
			{#each inProgress as p (p.id)}
				<QueueCard queueNumber={p.queueNumber} patientName={p.patientName} doctorName={p.doctorName} status={p.status} waitTimeMs={now - new Date(p.arrivedAt).getTime()} />
			{/each}
		</div>
	</div>

	<!-- DISCHARGED COLUMN (Waiting Payment) -->
	<div class="queue-column">
		<div class="queue-column-header">
			<span class="queue-column-title">Menunggu Bayar</span>
			<span class="queue-column-count">{discharged.length}</span>
		</div>
		<div class="queue-column-body">
			{#each discharged as p (p.id)}
				<QueueCard queueNumber={p.queueNumber} patientName={p.patientName} doctorName={p.doctorName} status="Discharged" waitTimeMs={now - new Date(p.arrivedAt).getTime()} />
			{/each}
		</div>
	</div>

	<!-- COMPLETED COLUMN -->
	<div class="queue-column">
		<div class="queue-column-header">
			<span class="queue-column-title">Selesai</span>
			<span class="queue-column-count">{completed.length}</span>
		</div>
		<div class="queue-column-body">
			{#each completed as p (p.id)}
				<QueueCard queueNumber={p.queueNumber} patientName={p.patientName} doctorName={p.doctorName} status="Completed" waitTimeMs={now - new Date(p.arrivedAt).getTime()} />
			{/each}
		</div>
	</div>
</div>
