import * as universal from '../entries/pages/kasir/_layout.js';

export const index = 4;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/kasir/_layout.svelte.js')).default;
export { universal };
export const universal_id = "src/routes/kasir/+layout.js";
export const imports = ["_app/immutable/nodes/4.2aca60c1.js","_app/immutable/chunks/scheduler.2a238cd3.js","_app/immutable/chunks/index.bf6392ca.js","_app/immutable/chunks/ChatPanel.b937c3b8.js","_app/immutable/chunks/each.44dcaf76.js","_app/immutable/chunks/toast.d7d7982b.js","_app/immutable/chunks/index.67c9fa51.js","_app/immutable/chunks/layout.3be533b8.js","_app/immutable/chunks/realtimeConnection.94db45ea.js","_app/immutable/chunks/Sidebar.64ba8e29.js","_app/immutable/chunks/stores.156f02e4.js","_app/immutable/chunks/singletons.3673d942.js","_app/immutable/chunks/paths.0bf0e0b5.js","_app/immutable/chunks/formatters.80495444.js"];
export const stylesheets = ["_app/immutable/assets/4.250f402a.css","_app/immutable/assets/ChatPanel.e1cf91b9.css"];
export const fonts = [];
