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
const component = async () => component_cache ??= (await import('./_layout.svelte-e9df6846.js')).default;
const universal_id = "src/routes/dokter/+layout.js";
const imports = ["_app/immutable/nodes/3.aa0f8390.js","_app/immutable/chunks/scheduler.034cee57.js","_app/immutable/chunks/index.98d8086f.js","_app/immutable/chunks/ChatPanel.f31fa851.js","_app/immutable/chunks/each.37e91fe0.js","_app/immutable/chunks/stores.0e29f326.js","_app/immutable/chunks/singletons.3cb44420.js","_app/immutable/chunks/index.8449654f.js","_app/immutable/chunks/paths.c67aefbd.js","_app/immutable/chunks/NotificationPanel.f818985e.js","_app/immutable/chunks/toast.c09e6c6b.js","_app/immutable/chunks/layout.a14078e9.js","_app/immutable/chunks/formatters.80495444.js"];
const stylesheets = ["_app/immutable/assets/3.04069988.css","_app/immutable/assets/ChatPanel.012c0fbd.css","_app/immutable/assets/NotificationPanel.27608108.css"];
const fonts = [];

export { component, fonts, imports, index, stylesheets, _layout as universal, universal_id };
//# sourceMappingURL=3-2770113e.js.map
