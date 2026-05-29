

export const index = 1;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/fallbacks/error.svelte.js')).default;
export const imports = ["_app/immutable/nodes/1.18d62f27.js","_app/immutable/chunks/scheduler.034cee57.js","_app/immutable/chunks/index.98d8086f.js","_app/immutable/chunks/stores.773b3f2b.js","_app/immutable/chunks/singletons.e1db24ca.js","_app/immutable/chunks/index.8449654f.js","_app/immutable/chunks/paths.dff09679.js"];
export const stylesheets = [];
export const fonts = [];
