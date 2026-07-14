

export const index = 22;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/suster/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/22.2e05ad59.js","_app/immutable/chunks/scheduler.2a238cd3.js","_app/immutable/chunks/index.bf6392ca.js"];
export const stylesheets = ["_app/immutable/assets/22.c710c6be.css"];
export const fonts = [];
