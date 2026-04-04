

export const index = 12;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/kasir/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/12.c8ebadc3.js","_app/immutable/chunks/scheduler.f04c06a7.js","_app/immutable/chunks/each.24015208.js","_app/immutable/chunks/index.e1be8bf6.js","_app/immutable/chunks/constants.344e4b61.js","_app/immutable/chunks/formatters.f8eca75b.js"];
export const stylesheets = ["_app/immutable/assets/DataTable.70755a72.css"];
export const fonts = [];
