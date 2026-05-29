

export const index = 1;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/fallbacks/error.svelte.js')).default;
export const imports = ["_app/immutable/nodes/1.74a739a4.js","_app/immutable/chunks/scheduler.034cee57.js","_app/immutable/chunks/index.98d8086f.js","_app/immutable/chunks/stores.0e29f326.js","_app/immutable/chunks/singletons.3cb44420.js","_app/immutable/chunks/index.8449654f.js","_app/immutable/chunks/paths.c67aefbd.js"];
export const stylesheets = [];
export const fonts = [];
