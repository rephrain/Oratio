

export const index = 16;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/login/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/16.81c587c9.js","_app/immutable/chunks/scheduler.f04c06a7.js","_app/immutable/chunks/index.e1be8bf6.js","_app/immutable/chunks/navigation.21d3796c.js","_app/immutable/chunks/singletons.0009ad37.js","_app/immutable/chunks/index.2d48bea8.js"];
export const stylesheets = ["_app/immutable/assets/16.a530ebe6.css"];
export const fonts = [];
