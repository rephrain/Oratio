import { c as create_ssr_component, v as validate_component } from './ssr-4a5a9ccc.js';
import { A as AppShell } from './AppShell-1233c29f.js';
import { T as Toast } from './ChatPanel-94d905bd.js';
import './Sidebar-ec15dc52.js';
import './stores-468b91fe.js';
import './layout-3873cafe.js';
import './index2-bd557b7d.js';
import './ConnectionStatus-cec34f96.js';
import './toast-4413a763.js';

const Layout = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let user;
  let { data } = $$props;
  if ($$props.data === void 0 && $$bindings.data && data !== void 0)
    $$bindings.data(data);
  user = data?.user;
  return `${validate_component(AppShell, "AppShell").$$render($$result, { user, role: "suster", title: "Suster" }, {}, {
    default: () => {
      return `${slots.default ? slots.default({}) : ``}`;
    }
  })} ${validate_component(Toast, "Toast").$$render($$result, {}, {}, {})}`;
});

export { Layout as default };
//# sourceMappingURL=_layout.svelte-08d630e7.js.map
