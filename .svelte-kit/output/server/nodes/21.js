

export const index = 21;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/login/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/21.13ca67f7.js","_app/immutable/chunks/scheduler.2a238cd3.js","_app/immutable/chunks/index.bf6392ca.js","_app/immutable/chunks/navigation.72616368.js","_app/immutable/chunks/singletons.1f7328cd.js","_app/immutable/chunks/index.67c9fa51.js","_app/immutable/chunks/paths.7e516e97.js"];
export const stylesheets = ["_app/immutable/assets/21.a530ebe6.css"];
export const fonts = [];
