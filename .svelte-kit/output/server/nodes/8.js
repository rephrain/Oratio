

export const index = 8;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/dokter/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/8.46ed7088.js","_app/immutable/chunks/scheduler.3644534c.js","_app/immutable/chunks/index.89b48b24.js","_app/immutable/chunks/navigation.02d52bb2.js","_app/immutable/chunks/singletons.440318f5.js","_app/immutable/chunks/index.6c73ec2d.js","_app/immutable/chunks/paths.7a655565.js","_app/immutable/chunks/DataTable.7aa748dd.js","_app/immutable/chunks/each.a2b7fcf3.js","_app/immutable/chunks/formatters.1c252712.js"];
export const stylesheets = ["_app/immutable/assets/DataTable.70755a72.css"];
export const fonts = [];
