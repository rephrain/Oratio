import { c as create_ssr_component, v as validate_component } from "../../../chunks/ssr.js";
import { A as AppShell } from "../../../chunks/AppShell.js";
import { T as Toast } from "../../../chunks/Toast.js";
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
export {
  Layout as default
};
