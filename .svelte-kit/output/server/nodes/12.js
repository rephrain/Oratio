

export const index = 12;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/dokter/patient/_patientId_/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/12.cbad1f67.js","_app/immutable/chunks/scheduler.58399093.js","_app/immutable/chunks/index.53af2136.js","_app/immutable/chunks/stores.7134b4ea.js","_app/immutable/chunks/singletons.6a4a1e45.js","_app/immutable/chunks/index.87639c41.js","_app/immutable/chunks/paths.a9ab9f33.js","_app/immutable/chunks/each.6186f7ce.js","_app/immutable/chunks/formatters.80495444.js"];
export const stylesheets = ["_app/immutable/assets/DataTable.70755a72.css"];
export const fonts = [];
