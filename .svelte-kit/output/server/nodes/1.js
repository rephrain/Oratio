

export const index = 1;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/fallbacks/error.svelte.js')).default;
export const imports = ["_app/immutable/nodes/1.54a29260.js","_app/immutable/chunks/scheduler.f04c06a7.js","_app/immutable/chunks/index.e1be8bf6.js","_app/immutable/chunks/stores.8ec5d781.js","_app/immutable/chunks/singletons.0009ad37.js","_app/immutable/chunks/index.2d48bea8.js"];
export const stylesheets = [];
export const fonts = [];
