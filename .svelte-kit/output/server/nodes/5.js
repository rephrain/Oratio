

export const index = 5;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/admin/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/5.21658c53.js","_app/immutable/chunks/scheduler.d0219a17.js","_app/immutable/chunks/each.7096ff1d.js","_app/immutable/chunks/index.b4a1576b.js","_app/immutable/chunks/constants.bce2795c.js"];
export const stylesheets = ["_app/immutable/assets/5.d8cfaf1c.css"];
export const fonts = [];
