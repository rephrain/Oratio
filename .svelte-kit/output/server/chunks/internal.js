import { c as create_ssr_component, s as setContext, v as validate_component, m as missing_component } from "./ssr.js";
import "./shared-server.js";
let base = "";
let assets = base;
const initial = { base, assets };
function reset() {
  base = initial.base;
  assets = initial.assets;
}
function set_assets(path) {
  assets = initial.assets = path;
}
function afterUpdate() {
}
function set_building() {
}
const Root = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { stores } = $$props;
  let { page } = $$props;
  let { constructors } = $$props;
  let { components = [] } = $$props;
  let { form } = $$props;
  let { data_0 = null } = $$props;
  let { data_1 = null } = $$props;
  let { data_2 = null } = $$props;
  {
    setContext("__svelte__", stores);
  }
  afterUpdate(stores.page.notify);
  if ($$props.stores === void 0 && $$bindings.stores && stores !== void 0)
    $$bindings.stores(stores);
  if ($$props.page === void 0 && $$bindings.page && page !== void 0)
    $$bindings.page(page);
  if ($$props.constructors === void 0 && $$bindings.constructors && constructors !== void 0)
    $$bindings.constructors(constructors);
  if ($$props.components === void 0 && $$bindings.components && components !== void 0)
    $$bindings.components(components);
  if ($$props.form === void 0 && $$bindings.form && form !== void 0)
    $$bindings.form(form);
  if ($$props.data_0 === void 0 && $$bindings.data_0 && data_0 !== void 0)
    $$bindings.data_0(data_0);
  if ($$props.data_1 === void 0 && $$bindings.data_1 && data_1 !== void 0)
    $$bindings.data_1(data_1);
  if ($$props.data_2 === void 0 && $$bindings.data_2 && data_2 !== void 0)
    $$bindings.data_2(data_2);
  let $$settled;
  let $$rendered;
  let previous_head = $$result.head;
  do {
    $$settled = true;
    $$result.head = previous_head;
    {
      stores.page.set(page);
    }
    $$rendered = `  ${constructors[1] ? `${validate_component(constructors[0] || missing_component, "svelte:component").$$render(
      $$result,
      { data: data_0, this: components[0] },
      {
        this: ($$value) => {
          components[0] = $$value;
          $$settled = false;
        }
      },
      {
        default: () => {
          return `${constructors[2] ? `${validate_component(constructors[1] || missing_component, "svelte:component").$$render(
            $$result,
            { data: data_1, this: components[1] },
            {
              this: ($$value) => {
                components[1] = $$value;
                $$settled = false;
              }
            },
            {
              default: () => {
                return `${validate_component(constructors[2] || missing_component, "svelte:component").$$render(
                  $$result,
                  { data: data_2, form, this: components[2] },
                  {
                    this: ($$value) => {
                      components[2] = $$value;
                      $$settled = false;
                    }
                  },
                  {}
                )}`;
              }
            }
          )}` : `${validate_component(constructors[1] || missing_component, "svelte:component").$$render(
            $$result,
            { data: data_1, form, this: components[1] },
            {
              this: ($$value) => {
                components[1] = $$value;
                $$settled = false;
              }
            },
            {}
          )}`}`;
        }
      }
    )}` : `${validate_component(constructors[0] || missing_component, "svelte:component").$$render(
      $$result,
      { data: data_0, form, this: components[0] },
      {
        this: ($$value) => {
          components[0] = $$value;
          $$settled = false;
        }
      },
      {}
    )}`} ${``}`;
  } while (!$$settled);
  return $$rendered;
});
const options = {
  app_template_contains_nonce: false,
  csp: { "mode": "auto", "directives": { "upgrade-insecure-requests": false, "block-all-mixed-content": false }, "reportOnly": { "upgrade-insecure-requests": false, "block-all-mixed-content": false } },
  csrf_check_origin: true,
  track_server_fetches: false,
  embedded: false,
  env_public_prefix: "PUBLIC_",
  env_private_prefix: "",
  hooks: null,
  // added lazily, via `get_hooks`
  preload_strategy: "modulepreload",
  root: Root,
  service_worker: false,
  templates: {
    app: ({ head, body, assets: assets2, nonce, env }) => `<!doctype html>\r
<html lang="id">\r
\r
<head>\r
	<meta charset="utf-8" />\r
	<meta name="viewport" content="width=device-width, initial-scale=1" />\r
	<meta name="description" content="Oratio Clinic – Sistem Rekam Medis Kedokteran Gigi" />\r
	<link rel="preconnect" href="https://fonts.googleapis.com" />\r
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />\r
	<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"\r
		rel="stylesheet" />\r
	<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"\r
		rel="stylesheet" />\r
	<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"><\/script>\r
	<script>\r
		tailwind.config = {\r
			darkMode: "class",\r
			theme: {\r
				extend: {\r
					colors: {\r
						"primary": "var(--tw-primary)",\r
						"secondary": "var(--tw-secondary)",\r
						"accent": "var(--tw-accent)",\r
						"forest": "var(--tw-forest)",\r
						"background-light": "var(--tw-bg-light)",\r
						"background-dark": "var(--tw-bg-dark)",\r
					},\r
					fontFamily: {\r
						"display": ["Inter", "sans-serif"]\r
					},\r
					borderRadius: {\r
						"DEFAULT": "0.5rem",\r
						"lg": "1rem",\r
						"xl": "1.5rem",\r
						"2xl": "2rem",\r
						"full": "9999px"\r
					},\r
					keyframes: {\r
						fadeInUp: {\r
							'0%': { opacity: '0', transform: 'translateY(20px)' },\r
							'100%': { opacity: '1', transform: 'translateY(0)' },\r
						},\r
						float: {\r
							'0%, 100%': { transform: 'translate(0, 0)' },\r
							'50%': { transform: 'translate(-20px, 20px)' },\r
						},\r
						floatReverse: {\r
							'0%, 100%': { transform: 'translate(0, 0)' },\r
							'50%': { transform: 'translate(20px, -20px)' },\r
						}\r
					},\r
					animation: {\r
						fadeInUp: 'fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',\r
						float: 'float 20s ease-in-out infinite',\r
						floatReverse: 'floatReverse 25s ease-in-out infinite',\r
					}\r
				},\r
			},\r
		}\r
	<\/script>\r
	<style>\r
		:root {\r
			--tw-primary: #3b82f6;\r
			--tw-secondary: #E0E0E0;\r
			--tw-accent: #0ea5e9;\r
			--tw-forest: #064E3B;\r
			--tw-bg-light: #f8fafc;\r
			--tw-bg-dark: #0f172a;\r
		}\r
	</style>\r
	<title>Oratio Clinic</title>\r
	` + head + '\r\n</head>\r\n\r\n<body data-sveltekit-preload-data="hover">\r\n	<div style="display: contents">' + body + "</div>\r\n</body>\r\n\r\n</html>",
    error: ({ status, message }) => '<!doctype html>\r\n<html lang="en">\r\n	<head>\r\n		<meta charset="utf-8" />\r\n		<title>' + message + `</title>\r
\r
		<style>\r
			body {\r
				--bg: white;\r
				--fg: #222;\r
				--divider: #ccc;\r
				background: var(--bg);\r
				color: var(--fg);\r
				font-family:\r
					system-ui,\r
					-apple-system,\r
					BlinkMacSystemFont,\r
					'Segoe UI',\r
					Roboto,\r
					Oxygen,\r
					Ubuntu,\r
					Cantarell,\r
					'Open Sans',\r
					'Helvetica Neue',\r
					sans-serif;\r
				display: flex;\r
				align-items: center;\r
				justify-content: center;\r
				height: 100vh;\r
				margin: 0;\r
			}\r
\r
			.error {\r
				display: flex;\r
				align-items: center;\r
				max-width: 32rem;\r
				margin: 0 1rem;\r
			}\r
\r
			.status {\r
				font-weight: 200;\r
				font-size: 3rem;\r
				line-height: 1;\r
				position: relative;\r
				top: -0.05rem;\r
			}\r
\r
			.message {\r
				border-left: 1px solid var(--divider);\r
				padding: 0 0 0 1rem;\r
				margin: 0 0 0 1rem;\r
				min-height: 2.5rem;\r
				display: flex;\r
				align-items: center;\r
			}\r
\r
			.message h1 {\r
				font-weight: 400;\r
				font-size: 1em;\r
				margin: 0;\r
			}\r
\r
			@media (prefers-color-scheme: dark) {\r
				body {\r
					--bg: #222;\r
					--fg: #ddd;\r
					--divider: #666;\r
				}\r
			}\r
		</style>\r
	</head>\r
	<body>\r
		<div class="error">\r
			<span class="status">` + status + '</span>\r\n			<div class="message">\r\n				<h1>' + message + "</h1>\r\n			</div>\r\n		</div>\r\n	</body>\r\n</html>\r\n"
  },
  version_hash: "1qwdxi6"
};
function get_hooks() {
  return import("./hooks.server.js");
}
export {
  assets as a,
  base as b,
  set_building as c,
  get_hooks as g,
  options as o,
  reset as r,
  set_assets as s
};
