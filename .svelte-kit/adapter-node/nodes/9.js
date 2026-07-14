

export const index = 9;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/dokter/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/9.45bd17d4.js","_app/immutable/chunks/scheduler.2a238cd3.js","_app/immutable/chunks/each.44dcaf76.js","_app/immutable/chunks/index.bf6392ca.js","_app/immutable/chunks/navigation.72616368.js","_app/immutable/chunks/singletons.1f7328cd.js","_app/immutable/chunks/index.67c9fa51.js","_app/immutable/chunks/paths.7e516e97.js","_app/immutable/chunks/realtimeStore.07644e58.js","_app/immutable/chunks/realtimeConnection.94db45ea.js","_app/immutable/chunks/formatters.80495444.js"];
export const stylesheets = ["_app/immutable/assets/DataTable.70755a72.css"];
export const fonts = [];
