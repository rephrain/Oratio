

export const index = 1;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/fallbacks/error.svelte.js')).default;
export const imports = ["_app/immutable/nodes/1.4a0aa4e9.js","_app/immutable/chunks/scheduler.58399093.js","_app/immutable/chunks/index.53af2136.js","_app/immutable/chunks/stores.82af6094.js","_app/immutable/chunks/singletons.e8d03d2e.js","_app/immutable/chunks/index.87639c41.js","_app/immutable/chunks/paths.ad298e6d.js"];
export const stylesheets = [];
export const fonts = [];
