

export const index = 9;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/dokter/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/9.ed9ac9d0.js","_app/immutable/chunks/scheduler.58399093.js","_app/immutable/chunks/each.daf10c35.js","_app/immutable/chunks/index.53af2136.js","_app/immutable/chunks/navigation.18f75ec3.js","_app/immutable/chunks/singletons.e888a464.js","_app/immutable/chunks/index.87639c41.js","_app/immutable/chunks/paths.96392b08.js","_app/immutable/chunks/realtimeStore.86029615.js","_app/immutable/chunks/realtimeConnection.2c212399.js","_app/immutable/chunks/formatters.80495444.js"];
export const stylesheets = ["_app/immutable/assets/DataTable.70755a72.css"];
export const fonts = [];
