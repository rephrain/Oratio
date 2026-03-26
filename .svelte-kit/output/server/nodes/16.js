

export const index = 16;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/login/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/16.03a0aac3.js","_app/immutable/chunks/scheduler.d0219a17.js","_app/immutable/chunks/index.b4a1576b.js","_app/immutable/chunks/navigation.da749f47.js","_app/immutable/chunks/singletons.b78c0928.js","_app/immutable/chunks/index.367da6d0.js"];
export const stylesheets = ["_app/immutable/assets/16.87a94945.css"];
export const fonts = [];
