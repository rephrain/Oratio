

export const index = 1;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/fallbacks/error.svelte.js')).default;
export const imports = ["_app/immutable/nodes/1.07b088f7.js","_app/immutable/chunks/scheduler.58399093.js","_app/immutable/chunks/index.53af2136.js","_app/immutable/chunks/stores.2840d0ca.js","_app/immutable/chunks/singletons.bdc42ff1.js","_app/immutable/chunks/index.87639c41.js","_app/immutable/chunks/paths.d684e74e.js"];
export const stylesheets = [];
export const fonts = [];
