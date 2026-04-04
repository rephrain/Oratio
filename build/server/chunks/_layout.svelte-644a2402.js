import { c as create_ssr_component, v as validate_component } from './ssr-631a3160.js';
import { A as AppShell } from './AppShell-06a085ce.js';
import { T as Toast } from './Toast-bc86e39e.js';
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
//# sourceMappingURL=_layout.svelte-644a2402.js.map
