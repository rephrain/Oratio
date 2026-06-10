

export const index = 6;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/admin/import/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/6.8658102b.js","_app/immutable/chunks/scheduler.f96b2c3a.js","_app/immutable/chunks/index.ccebf854.js","_app/immutable/chunks/each.fc1fbb16.js","_app/immutable/chunks/constants.67db754b.js","_app/immutable/chunks/toast.ecaf5d93.js","_app/immutable/chunks/index.917838c3.js"];
export const stylesheets = [];
export const fonts = [];
