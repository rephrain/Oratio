

export const index = 8;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/dokter/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/8.a0b7caab.js","_app/immutable/chunks/scheduler.f96b2c3a.js","_app/immutable/chunks/each.fc1fbb16.js","_app/immutable/chunks/index.ccebf854.js","_app/immutable/chunks/navigation.afb87a31.js","_app/immutable/chunks/singletons.655657ff.js","_app/immutable/chunks/index.917838c3.js","_app/immutable/chunks/paths.7522f69a.js","_app/immutable/chunks/realtimeStore.b234c8b0.js","_app/immutable/chunks/realtimeConnection.02b7499f.js","_app/immutable/chunks/formatters.80495444.js"];
export const stylesheets = ["_app/immutable/assets/DataTable.70755a72.css"];
export const fonts = [];
