

export const index = 1;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/fallbacks/error.svelte.js')).default;
export const imports = ["_app/immutable/nodes/1.387851bd.js","_app/immutable/chunks/scheduler.58399093.js","_app/immutable/chunks/index.53af2136.js","_app/immutable/chunks/stores.f6618fb1.js","_app/immutable/chunks/singletons.46f4611c.js","_app/immutable/chunks/index.87639c41.js","_app/immutable/chunks/paths.1f0655d5.js"];
export const stylesheets = [];
export const fonts = [];
