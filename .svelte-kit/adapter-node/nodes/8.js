

export const index = 8;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/dokter/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/8.f29071b3.js","_app/immutable/chunks/scheduler.d0219a17.js","_app/immutable/chunks/index.b4a1576b.js","_app/immutable/chunks/navigation.da749f47.js","_app/immutable/chunks/singletons.b78c0928.js","_app/immutable/chunks/index.367da6d0.js","_app/immutable/chunks/DataTable.e8a0c159.js","_app/immutable/chunks/each.7096ff1d.js","_app/immutable/chunks/formatters.1c252712.js"];
export const stylesheets = ["_app/immutable/assets/DataTable.70755a72.css"];
export const fonts = [];
