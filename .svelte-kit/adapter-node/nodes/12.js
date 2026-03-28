

export const index = 12;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/kasir/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/12.fe0c0b55.js","_app/immutable/chunks/scheduler.3644534c.js","_app/immutable/chunks/index.89b48b24.js","_app/immutable/chunks/each.a2b7fcf3.js","_app/immutable/chunks/DataTable.7aa748dd.js","_app/immutable/chunks/constants.8d54be7d.js","_app/immutable/chunks/formatters.1c252712.js"];
export const stylesheets = ["_app/immutable/assets/DataTable.70755a72.css"];
export const fonts = [];
