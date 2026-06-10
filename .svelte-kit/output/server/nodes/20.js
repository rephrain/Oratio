

export const index = 20;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/login/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/20.abf9acce.js","_app/immutable/chunks/scheduler.f96b2c3a.js","_app/immutable/chunks/index.ccebf854.js","_app/immutable/chunks/navigation.afb87a31.js","_app/immutable/chunks/singletons.655657ff.js","_app/immutable/chunks/index.917838c3.js","_app/immutable/chunks/paths.7522f69a.js"];
export const stylesheets = ["_app/immutable/assets/20.a530ebe6.css"];
export const fonts = [];
