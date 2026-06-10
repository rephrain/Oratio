import * as universal from '../entries/pages/admin/_layout.js';

export const index = 2;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/admin/_layout.svelte.js')).default;
export { universal };
export const universal_id = "src/routes/admin/+layout.js";
export const imports = ["_app/immutable/nodes/2.24712c1f.js","_app/immutable/chunks/scheduler.f96b2c3a.js","_app/immutable/chunks/index.ccebf854.js","_app/immutable/chunks/ChatPanel.dcfe4645.js","_app/immutable/chunks/each.fc1fbb16.js","_app/immutable/chunks/toast.ecaf5d93.js","_app/immutable/chunks/index.917838c3.js","_app/immutable/chunks/layout.2f517cee.js","_app/immutable/chunks/realtimeConnection.02b7499f.js","_app/immutable/chunks/stores.d423bea4.js","_app/immutable/chunks/singletons.655657ff.js","_app/immutable/chunks/paths.7522f69a.js","_app/immutable/chunks/ConnectionStatus.b0ba2753.js"];
export const stylesheets = ["_app/immutable/assets/2.5c5ced20.css","_app/immutable/assets/ChatPanel.fb474781.css","_app/immutable/assets/ConnectionStatus.fafdb7e4.css"];
export const fonts = [];
