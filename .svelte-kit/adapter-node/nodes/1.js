

export const index = 1;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/fallbacks/error.svelte.js')).default;
export const imports = ["_app/immutable/nodes/1.907db266.js","_app/immutable/chunks/scheduler.2a238cd3.js","_app/immutable/chunks/index.bf6392ca.js","_app/immutable/chunks/stores.156f02e4.js","_app/immutable/chunks/singletons.3673d942.js","_app/immutable/chunks/index.67c9fa51.js","_app/immutable/chunks/paths.0bf0e0b5.js"];
export const stylesheets = [];
export const fonts = [];
