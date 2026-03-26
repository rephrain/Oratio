import * as universal from '../entries/pages/dokter/_layout.js';

export const index = 3;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/dokter/_layout.svelte.js')).default;
export { universal };
export const universal_id = "src/routes/dokter/+layout.js";
export const imports = ["_app/immutable/nodes/3.797c08bf.js","_app/immutable/chunks/scheduler.d0219a17.js","_app/immutable/chunks/index.b4a1576b.js","_app/immutable/chunks/Toast.dcf5f8d9.js","_app/immutable/chunks/each.7096ff1d.js","_app/immutable/chunks/stores.be7b7c50.js","_app/immutable/chunks/singletons.b78c0928.js","_app/immutable/chunks/index.367da6d0.js","_app/immutable/chunks/toast.d55168c0.js"];
export const stylesheets = [];
export const fonts = [];
