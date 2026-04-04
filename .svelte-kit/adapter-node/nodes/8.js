

export const index = 8;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/dokter/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/8.9bd483fe.js","_app/immutable/chunks/scheduler.f04c06a7.js","_app/immutable/chunks/each.24015208.js","_app/immutable/chunks/index.e1be8bf6.js","_app/immutable/chunks/navigation.21d3796c.js","_app/immutable/chunks/singletons.0009ad37.js","_app/immutable/chunks/index.2d48bea8.js","_app/immutable/chunks/formatters.f8eca75b.js"];
export const stylesheets = ["_app/immutable/assets/DataTable.70755a72.css"];
export const fonts = [];
