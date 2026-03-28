import * as universal from '../entries/pages/dokter/_layout.js';

export const index = 3;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/dokter/_layout.svelte.js')).default;
export { universal };
export const universal_id = "src/routes/dokter/+layout.js";
export const imports = ["_app/immutable/nodes/3.3306c569.js","_app/immutable/chunks/scheduler.3644534c.js","_app/immutable/chunks/index.89b48b24.js","_app/immutable/chunks/Toast.9949c255.js","_app/immutable/chunks/paths.7a655565.js","_app/immutable/chunks/index.6c73ec2d.js","_app/immutable/chunks/each.a2b7fcf3.js","_app/immutable/chunks/toast.16298a5a.js"];
export const stylesheets = ["_app/immutable/assets/Toast.cd53531d.css"];
export const fonts = [];
