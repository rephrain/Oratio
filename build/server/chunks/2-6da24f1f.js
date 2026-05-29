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
const component = async () => component_cache ??= (await import('./_layout.svelte-84ea7044.js')).default;
const universal_id = "src/routes/admin/+layout.js";
const imports = ["_app/immutable/nodes/2.a16f507e.js","_app/immutable/chunks/scheduler.034cee57.js","_app/immutable/chunks/index.98d8086f.js","_app/immutable/chunks/NotificationPanel.f818985e.js","_app/immutable/chunks/each.37e91fe0.js","_app/immutable/chunks/toast.c09e6c6b.js","_app/immutable/chunks/index.8449654f.js","_app/immutable/chunks/layout.a14078e9.js","_app/immutable/chunks/stores.0e29f326.js","_app/immutable/chunks/singletons.3cb44420.js","_app/immutable/chunks/paths.c67aefbd.js"];
const stylesheets = ["_app/immutable/assets/2.2e2ef6c2.css","_app/immutable/assets/NotificationPanel.27608108.css"];
const fonts = [];

export { component, fonts, imports, index, stylesheets, _layout as universal, universal_id };
//# sourceMappingURL=2-6da24f1f.js.map
