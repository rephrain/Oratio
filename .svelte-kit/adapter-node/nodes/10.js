

export const index = 10;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/dokter/history/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/10.12578c3b.js","_app/immutable/chunks/scheduler.f96b2c3a.js","_app/immutable/chunks/index.ccebf854.js","_app/immutable/chunks/globals.7f7f1b26.js","_app/immutable/chunks/each.fc1fbb16.js","_app/immutable/chunks/formatters.80495444.js","_app/immutable/chunks/RichSelect.bd6f7e7c.js","_app/immutable/chunks/constants.67db754b.js"];
export const stylesheets = ["_app/immutable/assets/RichSelect.e94105dc.css"];
export const fonts = [];
