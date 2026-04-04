

export const index = 10;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/dokter/patient/_patientId_/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/10.0b17cc43.js","_app/immutable/chunks/scheduler.f04c06a7.js","_app/immutable/chunks/index.e1be8bf6.js","_app/immutable/chunks/stores.8ec5d781.js","_app/immutable/chunks/singletons.0009ad37.js","_app/immutable/chunks/index.2d48bea8.js","_app/immutable/chunks/DataTable.e45826b1.js","_app/immutable/chunks/each.24015208.js","_app/immutable/chunks/formatters.f8eca75b.js"];
export const stylesheets = ["_app/immutable/assets/DataTable.70755a72.css"];
export const fonts = [];
