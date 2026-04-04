

export const index = 6;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/admin/import/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/6.889e8dff.js","_app/immutable/chunks/scheduler.f04c06a7.js","_app/immutable/chunks/index.e1be8bf6.js","_app/immutable/chunks/each.24015208.js","_app/immutable/chunks/constants.344e4b61.js","_app/immutable/chunks/toast.7d8b2320.js","_app/immutable/chunks/index.2d48bea8.js"];
export const stylesheets = [];
export const fonts = [];
