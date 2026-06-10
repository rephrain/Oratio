

export const index = 1;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/fallbacks/error.svelte.js')).default;
export const imports = ["_app/immutable/nodes/1.ef68a2fe.js","_app/immutable/chunks/scheduler.f96b2c3a.js","_app/immutable/chunks/index.ccebf854.js","_app/immutable/chunks/stores.d423bea4.js","_app/immutable/chunks/singletons.655657ff.js","_app/immutable/chunks/index.917838c3.js","_app/immutable/chunks/paths.7522f69a.js"];
export const stylesheets = [];
export const fonts = [];
