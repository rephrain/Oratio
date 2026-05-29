

export const index = 8;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/dokter/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/8.02f2be3a.js","_app/immutable/chunks/scheduler.034cee57.js","_app/immutable/chunks/each.37e91fe0.js","_app/immutable/chunks/index.98d8086f.js","_app/immutable/chunks/navigation.1eb023fe.js","_app/immutable/chunks/singletons.3cb44420.js","_app/immutable/chunks/index.8449654f.js","_app/immutable/chunks/paths.c67aefbd.js","_app/immutable/chunks/formatters.80495444.js"];
export const stylesheets = ["_app/immutable/assets/DataTable.70755a72.css"];
export const fonts = [];
