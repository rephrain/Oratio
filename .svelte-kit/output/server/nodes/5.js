

export const index = 5;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/admin/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/5.e6dd85b2.js","_app/immutable/chunks/scheduler.034cee57.js","_app/immutable/chunks/each.37e91fe0.js","_app/immutable/chunks/index.98d8086f.js"];
export const stylesheets = [];
export const fonts = [];
