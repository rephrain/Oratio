

export const index = 1;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/fallbacks/error.svelte.js')).default;
export const imports = ["_app/immutable/nodes/1.cad36d3a.js","_app/immutable/chunks/scheduler.58399093.js","_app/immutable/chunks/index.53af2136.js","_app/immutable/chunks/stores.e32ead25.js","_app/immutable/chunks/singletons.0288d15a.js","_app/immutable/chunks/index.87639c41.js","_app/immutable/chunks/paths.3ee9e420.js"];
export const stylesheets = [];
export const fonts = [];
