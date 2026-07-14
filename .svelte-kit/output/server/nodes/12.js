

export const index = 12;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/dokter/patient/_patientId_/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/12.1439ce07.js","_app/immutable/chunks/scheduler.2a238cd3.js","_app/immutable/chunks/index.bf6392ca.js","_app/immutable/chunks/stores.156f02e4.js","_app/immutable/chunks/singletons.3673d942.js","_app/immutable/chunks/index.67c9fa51.js","_app/immutable/chunks/paths.0bf0e0b5.js","_app/immutable/chunks/each.44dcaf76.js","_app/immutable/chunks/formatters.80495444.js"];
export const stylesheets = ["_app/immutable/assets/DataTable.70755a72.css"];
export const fonts = [];
