

export const index = 21;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/login/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/21.e303c667.js","_app/immutable/chunks/scheduler.58399093.js","_app/immutable/chunks/index.53af2136.js","_app/immutable/chunks/navigation.b7f571d3.js","_app/immutable/chunks/singletons.4976d61c.js","_app/immutable/chunks/index.87639c41.js","_app/immutable/chunks/paths.facdd6e2.js"];
export const stylesheets = ["_app/immutable/assets/21.a530ebe6.css"];
export const fonts = [];
