import * as universal from '../entries/pages/dokter/_layout.js';

export const index = 3;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/dokter/_layout.svelte.js')).default;
export { universal };
export const universal_id = "src/routes/dokter/+layout.js";
export const imports = ["_app/immutable/nodes/3.ea1db66a.js","_app/immutable/chunks/scheduler.034cee57.js","_app/immutable/chunks/index.98d8086f.js","_app/immutable/chunks/ChatPanel.12248890.js","_app/immutable/chunks/each.37e91fe0.js","_app/immutable/chunks/stores.773b3f2b.js","_app/immutable/chunks/singletons.e1db24ca.js","_app/immutable/chunks/index.8449654f.js","_app/immutable/chunks/paths.dff09679.js","_app/immutable/chunks/NotificationPanel.f818985e.js","_app/immutable/chunks/toast.c09e6c6b.js","_app/immutable/chunks/layout.a14078e9.js","_app/immutable/chunks/formatters.80495444.js"];
export const stylesheets = ["_app/immutable/assets/3.04069988.css","_app/immutable/assets/ChatPanel.012c0fbd.css","_app/immutable/assets/NotificationPanel.27608108.css"];
export const fonts = [];
