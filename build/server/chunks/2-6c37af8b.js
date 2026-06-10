const load = async ({ fetch }) => {
  const res = await fetch("/api/auth/me");
  if (res.ok) {
    const data = await res.json();
    return { user: data.user };
  }
  return { user: null };
};

var _layout = /*#__PURE__*/Object.freeze({
  __proto__: null,
  load: load
});

const index = 2;
let component_cache;
const component = async () => component_cache ??= (await import('./_layout.svelte-2c8d7536.js')).default;
const universal_id = "src/routes/admin/+layout.js";
const imports = ["_app/immutable/nodes/2.24712c1f.js","_app/immutable/chunks/scheduler.f96b2c3a.js","_app/immutable/chunks/index.ccebf854.js","_app/immutable/chunks/ChatPanel.dcfe4645.js","_app/immutable/chunks/each.fc1fbb16.js","_app/immutable/chunks/toast.ecaf5d93.js","_app/immutable/chunks/index.917838c3.js","_app/immutable/chunks/layout.2f517cee.js","_app/immutable/chunks/realtimeConnection.02b7499f.js","_app/immutable/chunks/stores.d423bea4.js","_app/immutable/chunks/singletons.655657ff.js","_app/immutable/chunks/paths.7522f69a.js","_app/immutable/chunks/ConnectionStatus.b0ba2753.js"];
const stylesheets = ["_app/immutable/assets/2.5c5ced20.css","_app/immutable/assets/ChatPanel.fb474781.css","_app/immutable/assets/ConnectionStatus.fafdb7e4.css"];
const fonts = [];

export { component, fonts, imports, index, stylesheets, _layout as universal, universal_id };
//# sourceMappingURL=2-6c37af8b.js.map
