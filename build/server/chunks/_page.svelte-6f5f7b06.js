import { c as create_ssr_component, a as subscribe, e as escape, v as validate_component, d as each, f as add_attribute, h as createEventDispatcher } from './ssr-631a3160.js';
import { p as page } from './stores-02bd8c1f.js';
import { M as Modal } from './Modal-3c934d63.js';
import { A as ADMIN_TABLES } from './constants-6b2e336d.js';
import { a as addToast } from './toast2-22a880f7.js';
import './index2-ea876b50.js';

const css = {
  code: "th.sortable.svelte-1331hqa{cursor:pointer;user-select:none}th.sortable.svelte-1331hqa:hover{color:var(--primary)}",
  map: null
};
function getCellValue(row, col) {
  const val = row[col.key];
  if (col.format)
    return col.format(val, row);
  if (val === null || val === void 0)
    return "-";
  return val;
}
const DataTable = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let totalPages;
  let { data = [] } = $$props;
  let { columns = [] } = $$props;
  let { loading = false } = $$props;
  let { page: page2 = 1 } = $$props;
  let { total = 0 } = $$props;
  let { limit = 20 } = $$props;
  let { searchable = true } = $$props;
  let { searchPlaceholder = "Cari..." } = $$props;
  createEventDispatcher();
  let searchTerm = "";
  let sortKey = "";
  if ($$props.data === void 0 && $$bindings.data && data !== void 0)
    $$bindings.data(data);
  if ($$props.columns === void 0 && $$bindings.columns && columns !== void 0)
    $$bindings.columns(columns);
  if ($$props.loading === void 0 && $$bindings.loading && loading !== void 0)
    $$bindings.loading(loading);
  if ($$props.page === void 0 && $$bindings.page && page2 !== void 0)
    $$bindings.page(page2);
  if ($$props.total === void 0 && $$bindings.total && total !== void 0)
    $$bindings.total(total);
  if ($$props.limit === void 0 && $$bindings.limit && limit !== void 0)
    $$bindings.limit(limit);
  if ($$props.searchable === void 0 && $$bindings.searchable && searchable !== void 0)
    $$bindings.searchable(searchable);
  if ($$props.searchPlaceholder === void 0 && $$bindings.searchPlaceholder && searchPlaceholder !== void 0)
    $$bindings.searchPlaceholder(searchPlaceholder);
  $$result.css.add(css);
  totalPages = Math.ceil(total / limit) || 1;
  return `<div class="card" style="padding: 0;">${searchable ? `<div style="padding: var(--space-4); border-bottom: 1px solid var(--border-color);"><div class="search-wrapper"><span class="search-icon" data-svelte-h="svelte-k77c2d">🔍</span> <input type="text" class="form-input search-input"${add_attribute("placeholder", searchPlaceholder, 0)}${add_attribute("value", searchTerm, 0)}></div></div>` : ``} <div class="table-container" style="border: none; border-radius: 0;">${loading ? `<div style="padding: var(--space-8); text-align: center;" data-svelte-h="svelte-1xwir19"><div class="spinner spinner-lg" style="margin: 0 auto;"></div> <p class="text-sm text-muted mt-4">Memuat data...</p></div>` : `${data.length === 0 ? `<div class="empty-state" data-svelte-h="svelte-mplx2t"><div class="empty-state-icon">📭</div> <div class="empty-state-title">Tidak ada data</div> <p class="text-sm text-muted">Data yang Anda cari tidak ditemukan</p></div>` : `<table><thead><tr>${each(columns, (col) => {
    return `<th class="${["svelte-1331hqa", col.sortable ? "sortable" : ""].join(" ").trim()}">${escape(col.label)} ${sortKey === col.key ? `<span>${escape("↑")}</span>` : ``} </th>`;
  })} ${slots["header-extra"] ? slots["header-extra"]({}) : ``}</tr></thead> <tbody>${each(data, (row, i) => {
    return `<tr style="cursor: pointer;">${each(columns, (col) => {
      return `<td>${escape(getCellValue(row, col))}</td>`;
    })} ${slots["row-extra"] ? slots["row-extra"]({ row, i }) : ``} </tr>`;
  })}</tbody></table>`}`}</div> ${total > limit ? `<div class="pagination" style="padding: var(--space-4); border-top: 1px solid var(--border-color);"><button class="pagination-btn" ${page2 <= 1 ? "disabled" : ""}>←</button> ${each(Array(Math.min(totalPages, 7)), (_, i) => {
    return `<button class="${["pagination-btn", page2 === i + 1 ? "active" : ""].join(" ").trim()}">${escape(i + 1)}</button>`;
  })} ${totalPages > 7 ? `<span class="text-muted" data-svelte-h="svelte-1b3e3n0">…</span> <button class="${["pagination-btn", page2 === totalPages ? "active" : ""].join(" ").trim()}">${escape(totalPages)}</button>` : ``} <button class="pagination-btn" ${page2 >= totalPages ? "disabled" : ""}>→</button></div>` : ``} </div>`;
});
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let tableName;
  let tableConfig;
  let $page, $$unsubscribe_page;
  $$unsubscribe_page = subscribe(page, (value) => $page = value);
  let data = [];
  let total = 0;
  let currentPage = 1;
  let loading = true;
  let columns = [];
  let showModal = false;
  let modalMode = "create";
  let editRecord = {};
  let showDeleteConfirm = false;
  async function loadData() {
    loading = true;
    try {
      const res = await fetch(`/api/admin/${tableName}?page=${currentPage}&limit=20`);
      const resp = await res.json();
      data = resp.data || [];
      total = resp.total || 0;
      if (data.length > 0) {
        columns = Object.keys(data[0]).filter((k) => !["password_hash"].includes(k)).map((k) => ({
          key: k,
          label: k.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
          sortable: true,
          format: (val) => {
            if (val === null || val === void 0)
              return "-";
            if (typeof val === "boolean")
              return val ? "✅" : "❌";
            if (typeof val === "string" && val.length > 50)
              return val.substring(0, 50) + "...";
            return String(val);
          }
        }));
      }
    } catch (err) {
      console.error(err);
      addToast("Gagal memuat data", "error");
    } finally {
      loading = false;
    }
  }
  let $$settled;
  let $$rendered;
  let previous_head = $$result.head;
  do {
    $$settled = true;
    $$result.head = previous_head;
    tableName = $page.params.table;
    tableConfig = ADMIN_TABLES[tableName];
    {
      if (tableName) {
        currentPage = 1;
        loadData();
      }
    }
    $$rendered = `${$$result.head += `<!-- HEAD_svelte-3mjat5_START -->${$$result.title = `<title>${escape(tableConfig?.label || tableName)} — Admin — Oratio Dental</title>`, ""}<!-- HEAD_svelte-3mjat5_END -->`, ""} <div><div class="flex items-center justify-between mb-6"><div><h1 class="page-title" style="margin: 0;">${escape(tableConfig?.label || tableName)}</h1> <p class="text-sm text-muted">${escape(total)} total records</p></div> <div class="flex gap-3"><a href="/admin" class="btn btn-secondary" data-svelte-h="svelte-yxrebi">← Dashboard</a> <button class="btn btn-primary" data-svelte-h="svelte-17kkdq">+ Tambah</button></div></div> ${validate_component(DataTable, "DataTable").$$render(
      $$result,
      {
        data,
        columns,
        total,
        page: currentPage,
        limit: 20,
        loading
      },
      {},
      {
        "row-extra": ({ row }) => {
          return `<tr slot="row-extra"><td><div class="flex gap-1"><button class="btn btn-ghost btn-sm" data-svelte-h="svelte-10ij8xr">✏️</button> <button class="btn btn-ghost btn-sm" data-svelte-h="svelte-qp74na">🗑️</button></div></td></tr>`;
        }
      }
    )}</div>  ${validate_component(Modal, "Modal").$$render(
      $$result,
      {
        title: "Tambah " + (tableConfig?.label || ""),
        size: "lg",
        show: showModal
      },
      {
        show: ($$value) => {
          showModal = $$value;
          $$settled = false;
        }
      },
      {
        footer: () => {
          return `<div slot="footer"><button class="btn btn-secondary" data-svelte-h="svelte-1yu06z8">Batal</button> <button class="btn btn-primary" ${""}>${``} ${escape("Tambah")}</button></div>`;
        },
        default: () => {
          return `<div style="display: flex; flex-direction: column; gap: var(--space-4);">${each(columns, (col) => {
            return `${col.key !== "id" || modalMode === "edit" ? `<div class="form-group"><label class="form-label">${escape(col.label)}</label> ${col.key === "id" ? `<input class="form-input"${add_attribute("value", editRecord[col.key] || "", 0)} disabled>` : `${col.key === "password" ? `<input type="password" class="form-input" placeholder="Enter password"${add_attribute("value", editRecord[col.key], 0)}>` : `${typeof editRecord[col.key] === "boolean" ? `<select class="form-select"><option${add_attribute("value", true, 0)} data-svelte-h="svelte-yhf7er">Yes</option><option${add_attribute("value", false, 0)} data-svelte-h="svelte-13pb1fa">No</option></select>` : `<input class="form-input"${add_attribute("value", editRecord[col.key], 0)}>`}`}`} </div>` : ``}`;
          })} ${tableName === "users" && modalMode === "create" ? `<div class="form-group"><label class="form-label" data-svelte-h="svelte-jau4bd">Password</label> <input type="password" class="form-input" placeholder="Set password"${add_attribute("value", editRecord.password, 0)}></div>` : ``}</div>`;
        }
      }
    )}  ${validate_component(Modal, "Modal").$$render(
      $$result,
      {
        title: "Konfirmasi Hapus",
        show: showDeleteConfirm
      },
      {
        show: ($$value) => {
          showDeleteConfirm = $$value;
          $$settled = false;
        }
      },
      {
        footer: () => {
          return `<div slot="footer"><button class="btn btn-secondary" data-svelte-h="svelte-1awoh2w">Batal</button> <button class="btn btn-danger" data-svelte-h="svelte-1n97oam">🗑️ Hapus</button></div>`;
        },
        default: () => {
          return `<p data-svelte-h="svelte-143432o">Apakah Anda yakin ingin menghapus data ini? Tindakan ini tidak dapat dibatalkan.</p>`;
        }
      }
    )}`;
  } while (!$$settled);
  $$unsubscribe_page();
  return $$rendered;
});

export { Page as default };
//# sourceMappingURL=_page.svelte-6f5f7b06.js.map
