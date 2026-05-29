import * as universal from '../entries/pages/kasir/_layout.js';

export const index = 4;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/kasir/_layout.svelte.js')).default;
export { universal };
export const universal_id = "src/routes/kasir/+layout.js";
export const imports = ["_app/immutable/nodes/4.2090ca1f.js","_app/immutable/chunks/scheduler.034cee57.js","_app/immutable/chunks/index.98d8086f.js","_app/immutable/chunks/NotificationPanel.f818985e.js","_app/immutable/chunks/each.37e91fe0.js","_app/immutable/chunks/toast.c09e6c6b.js","_app/immutable/chunks/index.8449654f.js","_app/immutable/chunks/layout.a14078e9.js","_app/immutable/chunks/ChatPanel.f31fa851.js","_app/immutable/chunks/stores.0e29f326.js","_app/immutable/chunks/singletons.3cb44420.js","_app/immutable/chunks/paths.c67aefbd.js","_app/immutable/chunks/formatters.80495444.js"];
export const stylesheets = ["_app/immutable/assets/4.250f402a.css","_app/immutable/assets/NotificationPanel.27608108.css","_app/immutable/assets/ChatPanel.012c0fbd.css"];
export const fonts = [];
