import * as universal from '../entries/pages/kasir/_layout.js';

export const index = 4;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/kasir/_layout.svelte.js')).default;
export { universal };
export const universal_id = "src/routes/kasir/+layout.js";
export const imports = ["_app/immutable/nodes/4.8db481ba.js","_app/immutable/chunks/scheduler.f04c06a7.js","_app/immutable/chunks/index.e1be8bf6.js","_app/immutable/chunks/Toast.0c7cfe12.js","_app/immutable/chunks/each.24015208.js","_app/immutable/chunks/stores.8ec5d781.js","_app/immutable/chunks/singletons.0009ad37.js","_app/immutable/chunks/index.2d48bea8.js","_app/immutable/chunks/formatters.f8eca75b.js","_app/immutable/chunks/toast.7d8b2320.js"];
export const stylesheets = ["_app/immutable/assets/4.fb83c3da.css"];
export const fonts = [];
