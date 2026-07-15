

export const index = 1;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/fallbacks/error.svelte.js')).default;
export const imports = ["_app/immutable/nodes/1.ec125186.js","_app/immutable/chunks/scheduler.58399093.js","_app/immutable/chunks/index.53af2136.js","_app/immutable/chunks/stores.7134b4ea.js","_app/immutable/chunks/singletons.6a4a1e45.js","_app/immutable/chunks/index.87639c41.js","_app/immutable/chunks/paths.a9ab9f33.js"];
export const stylesheets = [];
export const fonts = [];
