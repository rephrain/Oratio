

export const index = 5;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/admin/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/5.f775f27b.js","_app/immutable/chunks/scheduler.3644534c.js","_app/immutable/chunks/each.a2b7fcf3.js","_app/immutable/chunks/index.89b48b24.js","_app/immutable/chunks/constants.8d54be7d.js"];
export const stylesheets = ["_app/immutable/assets/5.d8cfaf1c.css"];
export const fonts = [];
