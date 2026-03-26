import { c as create_ssr_component, v as validate_component } from './ssr-631a3160.js';
import { A as AppShell, T as Toast } from './Toast-5a24e78e.js';
import './stores-02bd8c1f.js';
import './index2-ea876b50.js';
import './toast2-22a880f7.js';

const Layout = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let user;
  let { data } = $$props;
  if ($$props.data === void 0 && $$bindings.data && data !== void 0)
    $$bindings.data(data);
  user = data?.user;
  return `${validate_component(AppShell, "AppShell").$$render($$result, { user, role: "dokter", title: "Dokter" }, {}, {
    default: () => {
      return `${slots.default ? slots.default({}) : ``}`;
    }
  })} ${validate_component(Toast, "Toast").$$render($$result, {}, {}, {})}`;
});

export { Layout as default };
//# sourceMappingURL=_layout.svelte-9cdac515.js.map
