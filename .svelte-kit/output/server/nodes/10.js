

export const index = 10;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/dokter/history/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/10.95345e9d.js","_app/immutable/chunks/scheduler.034cee57.js","_app/immutable/chunks/index.98d8086f.js","_app/immutable/chunks/globals.7f7f1b26.js","_app/immutable/chunks/each.37e91fe0.js","_app/immutable/chunks/formatters.80495444.js","_app/immutable/chunks/RichSelect.bee8af1e.js","_app/immutable/chunks/constants.be2c6c30.js"];
export const stylesheets = ["_app/immutable/assets/RichSelect.e94105dc.css"];
export const fonts = [];
