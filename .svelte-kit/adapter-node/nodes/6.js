

export const index = 6;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/admin/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/6.df6294b3.js","_app/immutable/chunks/scheduler.58399093.js","_app/immutable/chunks/each.6186f7ce.js","_app/immutable/chunks/index.53af2136.js","_app/immutable/chunks/realtimeStore.86029615.js","_app/immutable/chunks/index.87639c41.js","_app/immutable/chunks/realtimeConnection.2c212399.js"];
export const stylesheets = [];
export const fonts = [];
