

export const index = 6;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/admin/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/6.1ff804da.js","_app/immutable/chunks/scheduler.2a238cd3.js","_app/immutable/chunks/each.44dcaf76.js","_app/immutable/chunks/index.bf6392ca.js","_app/immutable/chunks/realtimeStore.07644e58.js","_app/immutable/chunks/index.67c9fa51.js","_app/immutable/chunks/realtimeConnection.94db45ea.js"];
export const stylesheets = [];
export const fonts = [];
