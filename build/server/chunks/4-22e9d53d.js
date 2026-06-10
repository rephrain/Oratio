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

const index = 4;
let component_cache;
const component = async () => component_cache ??= (await import('./_layout.svelte-1170ea68.js')).default;
const universal_id = "src/routes/kasir/+layout.js";
const imports = ["_app/immutable/nodes/4.6fca19b4.js","_app/immutable/chunks/scheduler.f96b2c3a.js","_app/immutable/chunks/index.ccebf854.js","_app/immutable/chunks/ChatPanel.dcfe4645.js","_app/immutable/chunks/each.fc1fbb16.js","_app/immutable/chunks/toast.ecaf5d93.js","_app/immutable/chunks/index.917838c3.js","_app/immutable/chunks/layout.2f517cee.js","_app/immutable/chunks/realtimeConnection.02b7499f.js","_app/immutable/chunks/Sidebar.37e18151.js","_app/immutable/chunks/stores.d423bea4.js","_app/immutable/chunks/singletons.655657ff.js","_app/immutable/chunks/paths.7522f69a.js","_app/immutable/chunks/formatters.80495444.js"];
const stylesheets = ["_app/immutable/assets/4.250f402a.css","_app/immutable/assets/ChatPanel.fb474781.css"];
const fonts = [];

export { component, fonts, imports, index, stylesheets, _layout as universal, universal_id };
//# sourceMappingURL=4-22e9d53d.js.map
