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
const component = async () => component_cache ??= (await import('./_layout.svelte-21c0f615.js')).default;
const universal_id = "src/routes/kasir/+layout.js";
const imports = ["_app/immutable/nodes/4.e72f9db1.js","_app/immutable/chunks/scheduler.3644534c.js","_app/immutable/chunks/index.89b48b24.js","_app/immutable/chunks/Toast.9949c255.js","_app/immutable/chunks/paths.7a655565.js","_app/immutable/chunks/index.6c73ec2d.js","_app/immutable/chunks/each.a2b7fcf3.js","_app/immutable/chunks/toast.16298a5a.js"];
const stylesheets = ["_app/immutable/assets/Toast.cd53531d.css"];
const fonts = [];

export { component, fonts, imports, index, stylesheets, _layout as universal, universal_id };
//# sourceMappingURL=4-d2e42b50.js.map
