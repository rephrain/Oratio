

export const index = 1;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/fallbacks/error.svelte.js')).default;
export const imports = ["_app/immutable/nodes/1.df8ed501.js","_app/immutable/chunks/scheduler.58399093.js","_app/immutable/chunks/index.53af2136.js","_app/immutable/chunks/stores.1994abc9.js","_app/immutable/chunks/singletons.7afe083a.js","_app/immutable/chunks/index.87639c41.js","_app/immutable/chunks/paths.8b61cc7c.js"];
export const stylesheets = [];
export const fonts = [];
