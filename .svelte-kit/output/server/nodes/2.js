import * as universal from '../entries/pages/admin/_layout.js';

export const index = 2;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/admin/_layout.svelte.js')).default;
export { universal };
export const universal_id = "src/routes/admin/+layout.js";
export const imports = ["_app/immutable/nodes/2.fe6bf417.js","_app/immutable/chunks/scheduler.f04c06a7.js","_app/immutable/chunks/index.e1be8bf6.js","_app/immutable/chunks/AppShell.be1c2637.js","_app/immutable/chunks/Toast.0c7cfe12.js","_app/immutable/chunks/each.24015208.js","_app/immutable/chunks/stores.8ec5d781.js","_app/immutable/chunks/singletons.0009ad37.js","_app/immutable/chunks/index.2d48bea8.js","_app/immutable/chunks/formatters.f8eca75b.js","_app/immutable/chunks/toast.7d8b2320.js"];
export const stylesheets = [];
export const fonts = [];
