

export const index = 7;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/admin/_table_/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/7.bdb5230f.js","_app/immutable/chunks/scheduler.3644534c.js","_app/immutable/chunks/index.89b48b24.js","_app/immutable/chunks/each.a2b7fcf3.js","_app/immutable/chunks/stores.0f288b4b.js","_app/immutable/chunks/singletons.440318f5.js","_app/immutable/chunks/index.6c73ec2d.js","_app/immutable/chunks/paths.7a655565.js","_app/immutable/chunks/DataTable.7aa748dd.js","_app/immutable/chunks/Modal.d29c9c4e.js","_app/immutable/chunks/constants.8d54be7d.js","_app/immutable/chunks/toast.16298a5a.js"];
export const stylesheets = ["_app/immutable/assets/DataTable.70755a72.css"];
export const fonts = [];
