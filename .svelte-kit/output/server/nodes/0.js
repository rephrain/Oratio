

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export const imports = ["_app/immutable/nodes/0.fde18fc2.js","_app/immutable/chunks/scheduler.f04c06a7.js","_app/immutable/chunks/index.e1be8bf6.js"];
export const stylesheets = ["_app/immutable/assets/0.0bdb8d27.css"];
export const fonts = [];
