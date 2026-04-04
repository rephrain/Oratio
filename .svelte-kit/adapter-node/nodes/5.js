

export const index = 5;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/admin/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/5.02ad2e83.js","_app/immutable/chunks/scheduler.f04c06a7.js","_app/immutable/chunks/each.24015208.js","_app/immutable/chunks/index.e1be8bf6.js","_app/immutable/chunks/constants.344e4b61.js"];
export const stylesheets = ["_app/immutable/assets/5.d8cfaf1c.css"];
export const fonts = [];
