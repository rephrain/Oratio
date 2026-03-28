

export const index = 16;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/login/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/16.ec1ecfa6.js","_app/immutable/chunks/scheduler.3644534c.js","_app/immutable/chunks/index.89b48b24.js","_app/immutable/chunks/navigation.02d52bb2.js","_app/immutable/chunks/singletons.440318f5.js","_app/immutable/chunks/index.6c73ec2d.js","_app/immutable/chunks/paths.7a655565.js"];
export const stylesheets = ["_app/immutable/assets/16.87a94945.css"];
export const fonts = [];
