

export const index = 22;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/suster/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/22.9f9ccb2d.js","_app/immutable/chunks/scheduler.58399093.js","_app/immutable/chunks/index.53af2136.js"];
export const stylesheets = ["_app/immutable/assets/22.86b55c57.css"];
export const fonts = [];
