

export const index = 6;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/admin/import/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/6.9c2d6356.js","_app/immutable/chunks/scheduler.034cee57.js","_app/immutable/chunks/index.98d8086f.js","_app/immutable/chunks/each.37e91fe0.js","_app/immutable/chunks/constants.67db754b.js","_app/immutable/chunks/toast.c09e6c6b.js","_app/immutable/chunks/index.8449654f.js"];
export const stylesheets = [];
export const fonts = [];
