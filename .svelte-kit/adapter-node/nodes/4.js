import * as universal from '../entries/pages/kasir/_layout.js';

export const index = 4;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/kasir/_layout.svelte.js')).default;
export { universal };
export const universal_id = "src/routes/kasir/+layout.js";
export const imports = ["_app/immutable/nodes/4.0bace723.js","_app/immutable/chunks/scheduler.58399093.js","_app/immutable/chunks/index.53af2136.js","_app/immutable/chunks/ChatPanel.cf5c728b.js","_app/immutable/chunks/each.6186f7ce.js","_app/immutable/chunks/toast.9573ca74.js","_app/immutable/chunks/index.87639c41.js","_app/immutable/chunks/layout.2e1f5827.js","_app/immutable/chunks/realtimeConnection.2c212399.js","_app/immutable/chunks/Sidebar.7ac15efd.js","_app/immutable/chunks/stores.7134b4ea.js","_app/immutable/chunks/singletons.6a4a1e45.js","_app/immutable/chunks/paths.a9ab9f33.js","_app/immutable/chunks/formatters.80495444.js"];
export const stylesheets = ["_app/immutable/assets/4.250f402a.css","_app/immutable/assets/ChatPanel.e1cf91b9.css"];
export const fonts = [];
