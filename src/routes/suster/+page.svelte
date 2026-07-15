<script>
	import { onMount, onDestroy } from "svelte";

	export let data;
	$: user = data?.user;

	let greeting = "";
	let glCanvas;
	let reqFrame;
	let clockInterval;
	let now = new Date();

	// TODO: wire these up to real data from the page's load function.
	// Kept here as clearly-labelled placeholders so the layout and
	// interactions can be reviewed before the backend is connected.
	const todayStats = [
		{ icon: "groups", value: "8", label: "Patients Today" },
		{ icon: "fact_check", value: "3", label: "Charts Pending Review" },
		{ icon: "event_upcoming", value: "10:30", label: "Next Appointment · Room 3" }
	];

	// Full literal Tailwind class strings per accent, so the JIT
	// compiler can find and generate them (dynamic interpolation
	// like `bg-${accent}-500/10` would not be picked up at build time).
	const accentStyles = {
		primary: {
			blob: "bg-primary/5",
			iconBg: "bg-primary/10",
			iconText: "text-primary",
			hoverBorder: "hover:border-primary/30",
			hoverShadow: "hover:shadow-[0_8px_30px_rgba(225,29,72,0.15)]",
			hoverTitle: "group-hover:text-primary",
			ctaText: "text-primary"
		},
		teal: {
			blob: "bg-teal-500/5",
			iconBg: "bg-teal-500/10",
			iconText: "text-teal-600",
			hoverBorder: "hover:border-teal-600/30",
			hoverShadow: "hover:shadow-[0_8px_30px_rgba(13,148,136,0.15)]",
			hoverTitle: "group-hover:text-teal-600",
			ctaText: "text-teal-600"
		},
		sky: {
			blob: "bg-sky-500/5",
			iconBg: "bg-sky-500/10",
			iconText: "text-sky-600",
			hoverBorder: "hover:border-sky-600/30",
			hoverShadow: "hover:shadow-[0_8px_30px_rgba(2,132,199,0.15)]",
			hoverTitle: "group-hover:text-sky-600",
			ctaText: "text-sky-600"
		},
		amber: {
			blob: "bg-amber-500/5",
			iconBg: "bg-amber-500/10",
			iconText: "text-amber-600",
			hoverBorder: "hover:border-amber-600/30",
			hoverShadow: "hover:shadow-[0_8px_30px_rgba(217,119,6,0.15)]",
			hoverTitle: "group-hover:text-amber-600",
			ctaText: "text-amber-600"
		}
	};

	const quickActions = [
		{
			href: "/suster/history",
			icon: "history",
			title: "Encounter History",
			description:
				"Access recent patient records, review detailed SOAP notes, and manage ongoing clinical encounters.",
			cta: "View Records",
			accent: "primary",
			delay: "delay-100"
		},
		{
			href: "/suster/patients",
			icon: "patient_list",
			title: "Patient Registry",
			description:
				"Browse the complete patient database, verify medical histories, and update critical allergy information.",
			cta: "Manage Registry",
			accent: "teal",
			delay: "delay-200"
		},
		{
			href: "/suster/schedule",
			icon: "calendar_today",
			title: "Today's Schedule",
			description:
				"View today's full appointment list, confirm arrivals, and prepare treatment rooms ahead of time.",
			cta: "View Schedule",
			accent: "sky",
			delay: "delay-300"
		},
		{
			href: "/suster/sterilization",
			icon: "sanitizer",
			title: "Sterilization Log",
			description:
				"Record and verify instrument sterilization cycles to keep every treatment room compliant and safe.",
			cta: "Open Log",
			accent: "amber",
			delay: "delay-400"
		}
	];

	$: formattedDate = now.toLocaleDateString("id-ID", {
		weekday: "long",
		day: "numeric",
		month: "long",
		year: "numeric"
	});
	$: formattedTime = now.toLocaleTimeString("id-ID", {
		hour: "2-digit",
		minute: "2-digit"
	});

	onMount(() => {
		const hour = new Date().getHours();
		if (hour >= 5 && hour < 12) greeting = "Selamat Pagi";
		else if (hour >= 12 && hour < 15) greeting = "Selamat Siang";
		else if (hour >= 15 && hour < 18) greeting = "Selamat Sore";
		else greeting = "Selamat Malam";

		clockInterval = setInterval(() => {
			now = new Date();
		}, 30000);

		const prefersReducedMotion = window.matchMedia(
			"(prefers-reduced-motion: reduce)"
		).matches;

		// WebGL Shader Background
		const canvas = glCanvas;
		const gl = canvas.getContext("webgl");

		if (gl) {
			const vsSource = `
				attribute vec4 aVertexPosition;
				void main() {
					gl_Position = aVertexPosition;
				}
			`;

			const fsSource = `
				precision highp float;
				uniform float u_time;
				uniform vec2 u_resolution;

				void main() {
					vec2 uv = gl_FragCoord.xy / u_resolution.xy;

					// Slow, soothing organic motion - three overlapping waves
					float wave1 = sin(uv.x * 2.0 + u_time * 0.35) * 0.5 + 0.5;
					float wave2 = sin(uv.y * 2.6 - u_time * 0.28) * 0.5 + 0.5;
					float wave3 = sin((uv.x + uv.y) * 1.8 + u_time * 0.2) * 0.5 + 0.5;

					// Calming duotone: warm rose meeting a whisper of cool teal
					vec3 colorRose = vec3(1.0, 0.98, 0.98);
					vec3 colorRoseTint = vec3(0.99, 0.93, 0.94);
					vec3 colorTealTint = vec3(0.94, 0.98, 0.97);

					vec3 mixed = mix(colorRose, colorRoseTint, wave1 * wave2);
					vec3 finalColor = mix(mixed, colorTealTint, wave3 * 0.25);

					// Soft vignette for depth
					float vignette = 1.0 - length(uv - 0.5) * 0.45;
					finalColor *= vignette;

					gl_FragColor = vec4(finalColor, 1.0);
				}
			`;

			const initShaderProgram = (gl, vsSource, fsSource) => {
				const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
				const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);
				const shaderProgram = gl.createProgram();
				gl.attachShader(shaderProgram, vertexShader);
				gl.attachShader(shaderProgram, fragmentShader);
				gl.linkProgram(shaderProgram);
				return shaderProgram;
			};

			const loadShader = (gl, type, source) => {
				const shader = gl.createShader(type);
				gl.shaderSource(shader, source);
				gl.compileShader(shader);
				return shader;
			};

			const shaderProgram = initShaderProgram(gl, vsSource, fsSource);
			const programInfo = {
				program: shaderProgram,
				attribLocations: {
					vertexPosition: gl.getAttribLocation(shaderProgram, "aVertexPosition")
				},
				uniformLocations: {
					time: gl.getUniformLocation(shaderProgram, "u_time"),
					resolution: gl.getUniformLocation(shaderProgram, "u_resolution")
				}
			};

			const buffers = { position: gl.createBuffer() };
			gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
			const positions = [-1.0, 1.0, 1.0, 1.0, -1.0, -1.0, 1.0, -1.0];
			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

			const drawFrame = (time) => {
				time *= 0.001;

				const displayWidth = window.innerWidth;
				const displayHeight = window.innerHeight;

				if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
					canvas.width = displayWidth;
					canvas.height = displayHeight;
				}

				gl.viewport(0, 0, canvas.width, canvas.height);

				gl.clearColor(0.0, 0.0, 0.0, 1.0);
				gl.clear(gl.COLOR_BUFFER_BIT);

				gl.useProgram(programInfo.program);

				gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
				gl.vertexAttribPointer(programInfo.attribLocations.vertexPosition, 2, gl.FLOAT, false, 0, 0);
				gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);

				gl.uniform1f(programInfo.uniformLocations.time, time);
				gl.uniform2f(programInfo.uniformLocations.resolution, canvas.width, canvas.height);

				gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
			};

			const render = (time) => {
				drawFrame(time);
				reqFrame = requestAnimationFrame(render);
			};

			// Respect users who prefer reduced motion: paint one calm,
			// static frame instead of animating indefinitely.
			if (prefersReducedMotion) {
				drawFrame(0);
			} else {
				reqFrame = requestAnimationFrame(render);
			}
		}
	});

	onDestroy(() => {
		if (reqFrame) cancelAnimationFrame(reqFrame);
		if (clockInterval) clearInterval(clockInterval);
	});
</script>

<svelte:head>
	<title>Suster Dashboard — Oratio Clinic</title>
</svelte:head>

<!-- WebGL Background -->
<canvas
	bind:this={glCanvas}
	aria-hidden="true"
	class="fixed inset-0 w-full h-full -z-10 dark:opacity-5 transition-opacity duration-500"
></canvas>

<div class="flex-1 p-6 lg:p-12 max-w-7xl mx-auto w-full animate-fade-in-up opacity-0">
	<!-- Welcome Section -->
	<section
		aria-labelledby="welcome-heading"
		class="relative overflow-hidden rounded-2xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl shadow-[0px_8px_32px_rgba(225,29,72,0.08)] mb-8 p-8 lg:p-12 animate-scale-in opacity-0"
	>
		<div class="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-primary/20 rounded-full blur-3xl pointer-events-none animate-float"></div>
		<div class="absolute bottom-0 left-0 -mb-20 -ml-20 w-48 h-48 bg-teal-500/20 rounded-full blur-2xl pointer-events-none animate-float-slow"></div>

		<div class="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
			<div class="max-w-2xl">
				<div class="flex flex-wrap items-center gap-2 mb-6">
					<div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary">
						<span class="material-symbols-outlined text-[16px]">medical_services</span>
						<span class="text-xs font-bold uppercase tracking-wider">Clinical Dashboard</span>
					</div>
					<div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
						<span class="material-symbols-outlined text-[16px]">calendar_today</span>
						<span class="text-xs font-semibold">{formattedDate}</span>
					</div>
				</div>
				<h2 id="welcome-heading" class="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-3 tracking-tight leading-tight">
					{greeting}, <span class="text-primary">{user?.name || "Suster"}</span>
				</h2>
				<p class="text-lg text-slate-600 dark:text-slate-400">
					Your shift is currently active. You have access to patient histories and editing capabilities for today's encounters.
				</p>
			</div>

			<!-- Live shift status, replaces the previous avatar with something functional -->
			<div class="hidden lg:flex flex-col items-center justify-center gap-2 w-48 h-48 rounded-2xl bg-white/80 dark:bg-slate-800/70 border border-slate-200/60 dark:border-slate-700/60 shadow-xl flex-shrink-0 p-6">
				<span class="relative flex h-3 w-3 mb-1">
					<span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
					<span class="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
				</span>
				<p class="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Shift Active</p>
				<p class="text-3xl font-extrabold text-slate-900 dark:text-white tabular-nums tracking-tight" aria-label="Current time">
					{formattedTime}
				</p>
				<p class="text-xs text-slate-500 dark:text-slate-400 text-center leading-snug">
					WIB · {user?.name ? "On duty" : "Nurse station"}
				</p>
			</div>
		</div>
	</section>

	<!-- Today at a Glance -->
	<section aria-labelledby="glance-heading" class="mb-12">
		<h3 id="glance-heading" class="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2 animate-fade-in-up opacity-0 delay-100">
			<span class="material-symbols-outlined text-primary text-[20px]">insights</span>
			Today at a Glance
		</h3>
		<div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
			{#each todayStats as stat, i}
				<div
					class="flex items-center gap-4 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md rounded-xl p-5 border border-slate-200/50 dark:border-slate-700/50 shadow-[0px_4px_20px_rgba(225,29,72,0.04)] animate-fade-in-up opacity-0"
					style="animation-delay: {150 + i * 100}ms"
				>
					<div class="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
						<span class="material-symbols-outlined text-[22px]">{stat.icon}</span>
					</div>
					<div class="min-w-0">
						<p class="text-2xl font-extrabold text-slate-900 dark:text-white leading-none tabular-nums">{stat.value}</p>
						<p class="text-sm text-slate-500 dark:text-slate-400 mt-1 truncate">{stat.label}</p>
					</div>
				</div>
			{/each}
		</div>
	</section>

	<!-- Quick Operations -->
	<section aria-labelledby="operations-heading">
		<h3 id="operations-heading" class="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2 animate-fade-in-up opacity-0 delay-100">
			<span class="material-symbols-outlined text-primary">bolt</span>
			Quick Operations
		</h3>
		<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
			{#each quickActions as action (action.href)}
				{@const s = accentStyles[action.accent]}
				<a
					href={action.href}
					class="group relative overflow-hidden bg-white/60 dark:bg-slate-900/60 backdrop-blur-md rounded-2xl p-6 lg:p-8 shadow-[0px_4px_20px_rgba(225,29,72,0.04)] border border-slate-200/50 dark:border-slate-700/50 {s.hoverBorder} transition-all duration-300 hover:-translate-y-1 {s.hoverShadow} flex flex-col h-full animate-fade-in-up opacity-0 {action.delay}"
				>
					<div class="absolute top-0 right-0 w-32 h-32 {s.blob} rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
					<div class="w-14 h-14 rounded-xl {s.iconBg} flex items-center justify-center mb-6 {s.iconText} group-hover:animate-pulse transition-all">
						<span class="material-symbols-outlined text-[28px]" style="font-variation-settings: 'FILL' 1;">{action.icon}</span>
					</div>
					<h4 class="text-xl font-bold text-slate-900 dark:text-white mb-2 {s.hoverTitle} transition-colors">{action.title}</h4>
					<p class="text-base text-slate-500 dark:text-slate-400 mb-8 flex-1">
						{action.description}
					</p>
					<div class="flex items-center {s.ctaText} text-sm font-bold mt-auto">
						{action.cta}
						<span class="material-symbols-outlined ml-2 group-hover:translate-x-1 transition-transform">arrow_forward</span>
					</div>
				</a>
			{/each}
		</div>
	</section>
</div>

<style>
	@keyframes fadeInUp {
		from { opacity: 0; transform: translateY(30px); }
		to { opacity: 1; transform: translateY(0); }
	}
	@keyframes scaleIn {
		from { opacity: 0; transform: scale(0.95); }
		to { opacity: 1; transform: scale(1); }
	}
	@keyframes float {
		0%, 100% { transform: translateY(0) scale(1); }
		50% { transform: translateY(-16px) scale(1.05); }
	}
	.animate-fade-in-up {
		animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
	}
	.animate-scale-in {
		animation: scaleIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
	}
	.animate-float {
		animation: float 10s ease-in-out infinite;
	}
	.animate-float-slow {
		animation: float 14s ease-in-out infinite;
		animation-delay: 2s;
	}
	.delay-100 { animation-delay: 100ms; }
	.delay-200 { animation-delay: 200ms; }
	.delay-300 { animation-delay: 300ms; }
	.delay-400 { animation-delay: 400ms; }
	.opacity-0 { opacity: 0; }

	@media (prefers-reduced-motion: reduce) {
		.animate-fade-in-up,
		.animate-scale-in,
		.animate-float,
		.animate-float-slow {
			animation: none !important;
			opacity: 1 !important;
			transform: none !important;
		}
	}
</style>