

export const index = 8;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/dokter/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/8.f2e1e9dc.js","_app/immutable/chunks/scheduler.034cee57.js","_app/immutable/chunks/each.37e91fe0.js","_app/immutable/chunks/index.98d8086f.js","_app/immutable/chunks/navigation.cdfea0d6.js","_app/immutable/chunks/singletons.e1db24ca.js","_app/immutable/chunks/index.8449654f.js","_app/immutable/chunks/paths.dff09679.js","_app/immutable/chunks/formatters.80495444.js"];
export const stylesheets = ["_app/immutable/assets/DataTable.70755a72.css"];
export const fonts = [];
