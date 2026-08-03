

export const index = 10;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/dokter/analytics/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/10.7b0eb7b7.js","_app/immutable/chunks/preload-helper.a4192956.js","_app/immutable/chunks/scheduler.58399093.js","_app/immutable/chunks/each.daf10c35.js","_app/immutable/chunks/index.53af2136.js","_app/immutable/chunks/formatters.80495444.js","_app/immutable/chunks/constants.3f924bda.js","_app/immutable/chunks/layout.2e1f5827.js","_app/immutable/chunks/index.87639c41.js"];
export const stylesheets = ["_app/immutable/assets/10.7954c098.css"];
export const fonts = [];
