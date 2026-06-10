

export const index = 5;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/admin/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/5.c4e07ac5.js","_app/immutable/chunks/scheduler.f96b2c3a.js","_app/immutable/chunks/each.fc1fbb16.js","_app/immutable/chunks/index.ccebf854.js","_app/immutable/chunks/realtimeStore.b234c8b0.js","_app/immutable/chunks/index.917838c3.js","_app/immutable/chunks/realtimeConnection.02b7499f.js"];
export const stylesheets = [];
export const fonts = [];
