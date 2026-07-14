

export const index = 10;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/dokter/analytics/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/10.93353b41.js","_app/immutable/chunks/preload-helper.a4192956.js","_app/immutable/chunks/scheduler.2a238cd3.js","_app/immutable/chunks/each.44dcaf76.js","_app/immutable/chunks/index.bf6392ca.js","_app/immutable/chunks/formatters.80495444.js","_app/immutable/chunks/constants.3e9850a4.js","_app/immutable/chunks/layout.3be533b8.js","_app/immutable/chunks/index.67c9fa51.js"];
export const stylesheets = ["_app/immutable/assets/10.7954c098.css"];
export const fonts = [];
