<script>
	import { onMount, onDestroy } from "svelte";

	export let data;
	$: user = data?.user;

	let greeting = "";
	let glCanvas;
	let reqFrame;

	onMount(() => {
		const hour = new Date().getHours();
		if (hour >= 5 && hour < 12) greeting = "Selamat Pagi";
		else if (hour >= 12 && hour < 15) greeting = "Selamat Siang";
		else if (hour >= 15 && hour < 18) greeting = "Selamat Sore";
		else greeting = "Selamat Malam";

		// WebGL Shader Background
		const canvas = glCanvas;
		const gl = canvas.getContext('webgl');

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
					
					// Slow, clinical, organic motion
					float wave1 = sin(uv.x * 2.0 + u_time * 0.4) * 0.5 + 0.5;
					float wave2 = sin(uv.y * 3.0 - u_time * 0.3) * 0.5 + 0.5;
					
					// Base colors from the design system (Rose theme)
					vec3 color1 = vec3(1.0, 0.98, 0.98); // Very light rose
					vec3 color2 = vec3(0.99, 0.93, 0.94); // Light rose tint
					
					vec3 finalColor = mix(color1, color2, wave1 * wave2);
					
					// Add a very subtle vignette
					float vignette = 1.0 - length(uv - 0.5) * 0.5;
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
					vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
				},
				uniformLocations: {
					time: gl.getUniformLocation(shaderProgram, 'u_time'),
					resolution: gl.getUniformLocation(shaderProgram, 'u_resolution'),
				},
			};

			const buffers = { position: gl.createBuffer() };
			gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
			const positions = [ -1.0,  1.0, 1.0,  1.0, -1.0, -1.0, 1.0, -1.0 ];
			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

			const render = (time) => {
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

				reqFrame = requestAnimationFrame(render);
			};

			reqFrame = requestAnimationFrame(render);
		}
	});

	onDestroy(() => {
		if (reqFrame) cancelAnimationFrame(reqFrame);
	});
</script>

<svelte:head>
	<title>Suster Dashboard — Oratio Clinic</title>
</svelte:head>

<!-- WebGL Background -->
<canvas bind:this={glCanvas} class="fixed inset-0 w-full h-full -z-10 dark:opacity-5 transition-opacity duration-500"></canvas>

<div class="flex-1 p-6 lg:p-12 max-w-7xl mx-auto w-full animate-fade-in-up opacity-0">
	<!-- Welcome Section -->
	<section class="relative overflow-hidden rounded-2xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl shadow-[0px_8px_32px_rgba(225,29,72,0.08)] mb-12 p-8 lg:p-12 animate-scale-in opacity-0">
		<div class="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-primary/20 rounded-full blur-3xl pointer-events-none"></div>
		<div class="absolute bottom-0 left-0 -mb-20 -ml-20 w-48 h-48 bg-teal-500/20 rounded-full blur-2xl pointer-events-none"></div>
		
		<div class="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
			<div class="max-w-2xl">
				<div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary mb-6">
					<span class="material-symbols-outlined text-[16px]">medical_services</span>
					<span class="text-xs font-bold uppercase tracking-wider">Clinical Dashboard</span>
				</div>
				<h2 class="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-3 tracking-tight leading-tight">
					{greeting}, <span class="text-primary">{user?.name || "Suster"}</span>
				</h2>
				<p class="text-lg text-slate-600 dark:text-slate-400">
					Your shift is currently active. You have access to patient histories and editing capabilities for today's encounters.
				</p>
			</div>
			
			<div class="hidden lg:block w-32 h-32 rounded-full border-4 border-white dark:border-slate-800 shadow-xl overflow-hidden relative flex-shrink-0">
				<img class="w-full h-full object-cover" alt="Profile" src={user?.profile_image_url || "https://lh3.googleusercontent.com/aida-public/AB6AXuD-Gsf5sRf5OLQJ0XWfu7b_wz4ogFFRz8qnFzKQdbXy53cSEICf4TuUO_k4v5pNpftpZTPwdfXlC-g4Zk6KWHnRVPlFFdtyl0AMJRY_DV2b50PqUFKYYB5aLspMaU14sZs7aYPPu_9vGgc0wx_EM7zO46ZnNF2RLWnaQ5BjUusHG0lY6TDOCx2i3_ghpxdWW0t4tQb5pmfJsod20AkLEuaqZinNi2LeaKl7VQhjgZtaphc3x7EtWNazvA"}/>
			</div>
		</div>
	</section>

	<!-- Quick Operations -->
	<section class="mb-12">
		<h3 class="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2 animate-fade-in-up opacity-0 delay-100">
			<span class="material-symbols-outlined text-primary">bolt</span>
			Quick Operations
		</h3>
		<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
			<a href="/suster/history" class="group relative overflow-hidden bg-white/60 dark:bg-slate-900/60 backdrop-blur-md rounded-2xl p-6 lg:p-8 shadow-[0px_4px_20px_rgba(225,29,72,0.04)] border border-slate-200/50 dark:border-slate-700/50 hover:border-primary/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(225,29,72,0.15)] flex flex-col h-full animate-fade-in-up opacity-0 delay-100">
				<div class="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
				<div class="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 text-primary group-hover:animate-pulse transition-all">
					<span class="material-symbols-outlined text-[28px]" style="font-variation-settings: 'FILL' 1;">history</span>
				</div>
				<h4 class="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-primary transition-colors">Encounter History</h4>
				<p class="text-base text-slate-500 dark:text-slate-400 mb-8 flex-1">
					Access recent patient records, review detailed SOAP notes, and manage ongoing clinical encounters.
				</p>
				<div class="flex items-center text-primary text-sm font-bold mt-auto">
					View Records
					<span class="material-symbols-outlined ml-2 group-hover:translate-x-1 transition-transform">arrow_forward</span>
				</div>
			</a>
			
			<a href="/suster/patients" class="group relative overflow-hidden bg-white/60 dark:bg-slate-900/60 backdrop-blur-md rounded-2xl p-6 lg:p-8 shadow-[0px_4px_20px_rgba(225,29,72,0.04)] border border-slate-200/50 dark:border-slate-700/50 hover:border-teal-600/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(13,148,136,0.15)] flex flex-col h-full animate-fade-in-up opacity-0 delay-200">
				<div class="absolute top-0 right-0 w-32 h-32 bg-teal-500/5 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
				<div class="w-14 h-14 rounded-xl bg-teal-500/10 flex items-center justify-center mb-6 text-teal-600 group-hover:animate-pulse transition-all">
					<span class="material-symbols-outlined text-[28px]" style="font-variation-settings: 'FILL' 1;">patient_list</span>
				</div>
				<h4 class="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-teal-600 transition-colors">Patient Registry</h4>
				<p class="text-base text-slate-500 dark:text-slate-400 mb-8 flex-1">
					Browse the complete patient database, verify medical histories, and update critical allergy information.
				</p>
				<div class="flex items-center text-teal-600 text-sm font-bold mt-auto">
					Manage Registry
					<span class="material-symbols-outlined ml-2 group-hover:translate-x-1 transition-transform">arrow_forward</span>
				</div>
			</a>
		</div>
	</section>

	<!-- Footer matching the design -->
	<footer class="w-full py-6 mt-12 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md rounded-2xl border border-slate-200/50 dark:border-slate-800/50 px-8 animate-fade-in-up opacity-0 delay-200">
		<div class="flex flex-col md:flex-row justify-between items-center gap-4">
			<div class="flex flex-col md:flex-row items-center gap-4">
				<span class="text-sm font-bold text-primary">Oratio Clinic</span>
				<span class="text-xs text-slate-500 font-medium">© {new Date().getFullYear()} Oratio Clinic. Precision Care Infrastructure.</span>
			</div>
			<div class="flex gap-6">
				<span class="text-xs text-slate-500 font-medium hover:text-primary transition-colors cursor-pointer">Privacy Protocol</span>
				<span class="text-xs text-slate-500 font-medium hover:text-primary transition-colors cursor-pointer">Clinical Guidelines</span>
			</div>
		</div>
	</footer>
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
	.animate-fade-in-up {
		animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
	}
	.animate-scale-in {
		animation: scaleIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
	}
	.delay-100 { animation-delay: 100ms; }
	.delay-200 { animation-delay: 200ms; }
	.opacity-0 { opacity: 0; }
</style>
