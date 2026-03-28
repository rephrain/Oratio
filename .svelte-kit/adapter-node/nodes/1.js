

export const index = 1;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/fallbacks/error.svelte.js')).default;
export const imports = ["_app/immutable/nodes/1.6b0611a8.js","_app/immutable/chunks/scheduler.3644534c.js","_app/immutable/chunks/index.89b48b24.js","_app/immutable/chunks/stores.0f288b4b.js","_app/immutable/chunks/singletons.440318f5.js","_app/immutable/chunks/index.6c73ec2d.js","_app/immutable/chunks/paths.7a655565.js"];
export const stylesheets = [];
export const fonts = [];
