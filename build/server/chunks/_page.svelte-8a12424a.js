import { c as create_ssr_component, f as add_attribute } from './ssr-631a3160.js';

const css = {
  code: ".alert-error.svelte-s0oevp{display:flex;align-items:center;gap:8px;padding:12px 16px;background:var(--danger-light);color:#991B1B;border-radius:var(--radius-md);font-size:var(--font-size-sm);margin-bottom:var(--space-4);animation:slideUp 200ms ease}.footer-text.svelte-s0oevp{text-align:center;color:var(--text-secondary);font-size:var(--font-size-xs);margin-top:var(--space-6)}",
  map: null
};
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let username = "";
  let password = "";
  $$result.css.add(css);
  return `${$$result.head += `<!-- HEAD_svelte-cv65pv_START -->${$$result.title = `<title>Login — Oratio Dental</title>`, ""}<!-- HEAD_svelte-cv65pv_END -->`, ""} <div class="login-page"><div class="login-card"><div class="logo" data-svelte-h="svelte-1oycpdt">O</div> <h1 data-svelte-h="svelte-afm17a">Oratio Dental</h1> <p class="subtitle" data-svelte-h="svelte-1ijttg4">Sistem Rekam Medis Kedokteran Gigi</p> ${``} <form><div class="form-group" style="margin-bottom: var(--space-4)"><label class="form-label" for="username" data-svelte-h="svelte-38xnua">Username</label> <input id="username" type="text" class="form-input" placeholder="Masukkan username" required autocomplete="username"${add_attribute("value", username, 0)}></div> <div class="form-group" style="margin-bottom: var(--space-6)"><label class="form-label" for="password" data-svelte-h="svelte-catjaa">Password</label> <input id="password" type="password" class="form-input" placeholder="Masukkan password" required autocomplete="current-password"${add_attribute("value", password, 0)}></div> <button type="submit" class="btn btn-primary btn-lg w-full" ${""}>${`Masuk`}</button></form> <p class="footer-text svelte-s0oevp" data-svelte-h="svelte-b0xrd5">© 2024 Oratio Dental Clinic</p></div> </div>`;
});

export { Page as default };
//# sourceMappingURL=_page.svelte-8a12424a.js.map
