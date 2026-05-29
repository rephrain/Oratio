import * as universal from '../entries/pages/admin/_layout.js';

export const index = 2;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/admin/_layout.svelte.js')).default;
export { universal };
export const universal_id = "src/routes/admin/+layout.js";
export const imports = ["_app/immutable/nodes/2.a16f507e.js","_app/immutable/chunks/scheduler.034cee57.js","_app/immutable/chunks/index.98d8086f.js","_app/immutable/chunks/NotificationPanel.f818985e.js","_app/immutable/chunks/each.37e91fe0.js","_app/immutable/chunks/toast.c09e6c6b.js","_app/immutable/chunks/index.8449654f.js","_app/immutable/chunks/layout.a14078e9.js","_app/immutable/chunks/stores.0e29f326.js","_app/immutable/chunks/singletons.3cb44420.js","_app/immutable/chunks/paths.c67aefbd.js"];
export const stylesheets = ["_app/immutable/assets/2.2e2ef6c2.css","_app/immutable/assets/NotificationPanel.27608108.css"];
export const fonts = [];
