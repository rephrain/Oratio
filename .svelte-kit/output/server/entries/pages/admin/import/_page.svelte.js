import { c as create_ssr_component, d as createEventDispatcher, f as add_attribute, e as escape, b as each, v as validate_component } from "../../../../chunks/ssr.js";
import { A as ADMIN_TABLES } from "../../../../chunks/constants.js";
const FileUpload = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { accept = "" } = $$props;
  let { label = "Upload file" } = $$props;
  let { maxSize = 5 * 1024 * 1024 } = $$props;
  createEventDispatcher();
  if ($$props.accept === void 0 && $$bindings.accept && accept !== void 0)
    $$bindings.accept(accept);
  if ($$props.label === void 0 && $$bindings.label && label !== void 0)
    $$bindings.label(label);
  if ($$props.maxSize === void 0 && $$bindings.maxSize && maxSize !== void 0)
    $$bindings.maxSize(maxSize);
  return `<div class="${["file-upload", ""].join(" ").trim()}"><input type="file"${add_attribute("accept", accept, 0)} style="display: none;"> <div class="empty-state-icon" data-svelte-h="svelte-dxo1qp">📎</div> <p class="font-medium">${escape(label)}</p> <p class="text-sm text-muted" data-svelte-h="svelte-9x3tdn">Drag &amp; drop atau klik untuk memilih</p></div>`;
});
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `${$$result.head += `<!-- HEAD_svelte-1prru_START -->${$$result.title = `<title>CSV Import — Admin — Oratio Clinic</title>`, ""}<!-- HEAD_svelte-1prru_END -->`, ""} <div><div class="flex items-center justify-between mb-6" data-svelte-h="svelte-1v3eawi"><h1 class="page-title" style="margin: 0;">📤 CSV Import</h1> <a href="/admin" class="btn btn-secondary">← Dashboard</a></div> ${`<div class="card mb-6"><h3 class="card-title mb-4" data-svelte-h="svelte-10zdvf0">1. Pilih Tabel &amp; Upload File</h3> <div class="form-group mb-4"><label class="form-label" data-svelte-h="svelte-1v7lwnb">Tabel Tujuan</label> <select class="form-select"><option value="" data-svelte-h="svelte-18zgnia">-- Pilih Tabel --</option>${each(Object.entries(ADMIN_TABLES), ([slug, config]) => {
    return `<option${add_attribute("value", slug, 0)}>${escape(config.label)}</option>`;
  })}</select></div> ${validate_component(FileUpload, "FileUpload").$$render($$result, { accept: ".csv", label: "Upload file CSV" }, {}, {})}</div>`}</div>`;
});
export {
  Page as default
};
