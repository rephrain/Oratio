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

const index = 3;
let component_cache;
const component = async () => component_cache ??= (await import('./_layout.svelte-e1a5fc1e.js')).default;
const universal_id = "src/routes/dokter/+layout.js";
const imports = ["_app/immutable/nodes/3.d56c366d.js","_app/immutable/chunks/scheduler.58399093.js","_app/immutable/chunks/index.53af2136.js","_app/immutable/chunks/AppShell.355a5963.js","_app/immutable/chunks/Sidebar.eceeb1a6.js","_app/immutable/chunks/each.daf10c35.js","_app/immutable/chunks/stores.82af6094.js","_app/immutable/chunks/singletons.e8d03d2e.js","_app/immutable/chunks/index.87639c41.js","_app/immutable/chunks/paths.ad298e6d.js","_app/immutable/chunks/ChatPanel.3203f883.js","_app/immutable/chunks/toast.9573ca74.js","_app/immutable/chunks/layout.2e1f5827.js","_app/immutable/chunks/realtimeConnection.2c212399.js","_app/immutable/chunks/formatters.80495444.js","_app/immutable/chunks/ConnectionStatus.772eb7df.js"];
const stylesheets = ["_app/immutable/assets/AppShell.04069988.css","_app/immutable/assets/ChatPanel.e1cf91b9.css","_app/immutable/assets/ConnectionStatus.fafdb7e4.css"];
const fonts = [];

export { component, fonts, imports, index, stylesheets, _layout as universal, universal_id };
//# sourceMappingURL=3-701f4caf.js.map
