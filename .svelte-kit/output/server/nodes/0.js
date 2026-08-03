

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export const imports = ["_app/immutable/nodes/0.b3e0ed18.js","_app/immutable/chunks/scheduler.58399093.js","_app/immutable/chunks/index.53af2136.js"];
export const stylesheets = ["_app/immutable/assets/0.3260d897.css"];
export const fonts = [];
