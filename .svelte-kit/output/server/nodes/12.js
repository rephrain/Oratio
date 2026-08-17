

export const index = 12;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/dokter/patient/_patientId_/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/12.65feb1ee.js","_app/immutable/chunks/scheduler.58399093.js","_app/immutable/chunks/index.53af2136.js","_app/immutable/chunks/stores.04988707.js","_app/immutable/chunks/singletons.e888a464.js","_app/immutable/chunks/index.87639c41.js","_app/immutable/chunks/paths.96392b08.js","_app/immutable/chunks/each.daf10c35.js","_app/immutable/chunks/formatters.80495444.js"];
export const stylesheets = ["_app/immutable/assets/DataTable.70755a72.css"];
export const fonts = [];
