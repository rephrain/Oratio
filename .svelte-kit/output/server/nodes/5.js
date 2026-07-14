import * as universal from '../entries/pages/suster/_layout.js';

export const index = 5;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/suster/_layout.svelte.js')).default;
export { universal };
export const universal_id = "src/routes/suster/+layout.js";
export const imports = ["_app/immutable/nodes/5.f7a1b6fb.js","_app/immutable/chunks/scheduler.2a238cd3.js","_app/immutable/chunks/index.bf6392ca.js","_app/immutable/chunks/AppShell.7bf53706.js","_app/immutable/chunks/Sidebar.64ba8e29.js","_app/immutable/chunks/each.44dcaf76.js","_app/immutable/chunks/stores.156f02e4.js","_app/immutable/chunks/singletons.3673d942.js","_app/immutable/chunks/index.67c9fa51.js","_app/immutable/chunks/paths.0bf0e0b5.js","_app/immutable/chunks/ChatPanel.b937c3b8.js","_app/immutable/chunks/toast.d7d7982b.js","_app/immutable/chunks/layout.3be533b8.js","_app/immutable/chunks/realtimeConnection.94db45ea.js","_app/immutable/chunks/formatters.80495444.js","_app/immutable/chunks/ConnectionStatus.18c4e9c9.js"];
export const stylesheets = ["_app/immutable/assets/AppShell.04069988.css","_app/immutable/assets/ChatPanel.e1cf91b9.css","_app/immutable/assets/ConnectionStatus.fafdb7e4.css"];
export const fonts = [];
