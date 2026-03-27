<script>
	export let id = '';
	export let queueNumber = '';
	export let patientName = '';
	export let doctorName = '';
	export let waitTimeMs = 0; // Number of milliseconds waiting
	export let status = 'Waiting';

	// Compute human readable wait time
	$: waitMin = Math.floor(waitTimeMs / 1000 / 60);
	$: waitStr = waitMin > 60 
		? `${Math.floor(waitMin/60)}j ${waitMin%60}m` 
		: `${waitMin}m`;

	// Map wait time to alert colors
	let waitClass = 'wait-green';
	$: {
		if (waitMin > 30) waitClass = 'wait-red';
		else if (waitMin > 15) waitClass = 'wait-yellow';
		else waitClass = 'wait-green';
	}
</script>

<div class="queue-card">
	<div class="flex items-center justify-between mb-2">
		<span class="queue-number">#{queueNumber}</span>
		<span class="badge badge-gray">{status}</span>
	</div>
	
	<div class="patient-name truncate" title={patientName}>{patientName}</div>
	<div class="doctor-name truncate" title={doctorName}>{doctorName}</div>
	
	<div class="wait-time {waitClass}">
		<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
			<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
		</svg>
		<span>Tunggu: {waitStr}</span>
	</div>
</div>
