

export const index = 6;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/admin/import/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/6.ab54bdac.js","_app/immutable/chunks/scheduler.3644534c.js","_app/immutable/chunks/index.89b48b24.js","_app/immutable/chunks/each.a2b7fcf3.js","_app/immutable/chunks/constants.8d54be7d.js","_app/immutable/chunks/toast.16298a5a.js","_app/immutable/chunks/index.6c73ec2d.js"];
export const stylesheets = [];
export const fonts = [];
