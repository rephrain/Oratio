import { c as create_ssr_component, d as createEventDispatcher, f as add_attribute, g as each, e as escape, l as compute_slots, a as subscribe, o as onDestroy, v as validate_component } from "../../../../chunks/ssr.js";
import { p as page } from "../../../../chunks/stores.js";
/* empty css                                                           */import { A as ADMIN_TABLES } from "../../../../chunks/constants.js";
import { a as addToast } from "../../../../chunks/toast.js";
import "papaparse";
function getCellValue(row, col) {
  const val = row[col.key];
  if (col.format)
    return col.format(val, row);
  if (val === null || val === void 0)
    return "-";
  if (Array.isArray(val)) {
    if (val.length === 0)
      return "-";
    return val.join(", ");
  }
  return val;
}
const AdminDataTable = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let totalPages;
  let { data = [] } = $$props;
  let { columns = [] } = $$props;
  let { loading = false } = $$props;
  let { page: page2 = 1 } = $$props;
  let { total = 0 } = $$props;
  let { limit = 20 } = $$props;
  let { searchable = true } = $$props;
  let { searchPlaceholder = "Search..." } = $$props;
  createEventDispatcher();
  let searchTerm = "";
  let sortKey = "";
  let sortDir = "asc";
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
  totalPages = Math.ceil(total / limit) || 1;
  return `<div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm flex flex-col">${searchable ? `<div class="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30"><div class="relative max-w-md"><span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]" data-svelte-h="svelte-gv1cf5">search</span> <input type="text" class="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-primary/50 dark:focus:border-primary/50 rounded-lg text-sm transition-all focus:ring-0 text-slate-900 dark:text-white placeholder:text-slate-500 shadow-sm"${add_attribute("placeholder", searchPlaceholder, 0)}${add_attribute("value", searchTerm, 0)}></div></div>` : ``} <div class="overflow-x-auto w-full">${loading ? `<div class="p-8 text-center flex flex-col items-center justify-center" data-svelte-h="svelte-joo46k"><span class="material-symbols-outlined animate-spin text-primary text-4xl mb-4">progress_activity</span> <p class="text-sm font-medium text-slate-500 dark:text-slate-400">Loading data...</p></div>` : `${data.length === 0 ? `<div class="p-12 pl-12 text-center flex flex-col items-center justify-center border-t border-slate-200 dark:border-slate-800" data-svelte-h="svelte-i11b4e"><div class="size-16 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-full flex items-center justify-center mb-4 text-2xl"><span class="material-symbols-outlined text-3xl">inbox</span></div> <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-1">No Records Found</h3> <p class="text-sm text-slate-500 dark:text-slate-400">There are no entries to display right now.</p></div>` : `<table class="w-full text-left text-sm border-collapse whitespace-nowrap min-w-max"><thead><tr class="bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-200 dark:border-slate-800">${each(columns, (col) => {
    return `<th class="${"px-6 py-4 font-bold text-slate-700 dark:text-slate-300 " + escape(
      col.sortable ? "cursor-pointer hover:text-primary transition-colors group select-none" : "",
      true
    )}"><div class="flex items-center gap-2">${escape(col.label)} ${col.sortable ? `<div class="${"flex flex-col opacity-30 group-hover:opacity-100 transition-opacity " + escape(sortKey === col.key ? "!opacity-100" : "", true)}"><span class="${"material-symbols-outlined text-[12px] leading-none " + escape(
      sortKey === col.key && sortDir === "asc" ? "text-primary font-black" : "",
      true
    )}">arrow_drop_up</span> <span class="${"material-symbols-outlined text-[12px] leading-none -mt-1 " + escape(
      sortKey === col.key && sortDir === "desc" ? "text-primary font-black" : "",
      true
    )}">arrow_drop_down</span> </div>` : ``}</div> </th>`;
  })} ${slots["header-extra"] ? slots["header-extra"]({}) : ``}</tr></thead> <tbody class="divide-y divide-slate-100 dark:divide-slate-800">${each(data, (row, i) => {
    return `<tr class="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer group">${each(columns, (col) => {
      return `<td class="px-6 py-4 text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">${escape(getCellValue(row, col))} </td>`;
    })} ${slots["row-extra"] ? slots["row-extra"]({ row, i }) : ``} </tr>`;
  })}</tbody></table>`}`}</div> ${total > limit ? `<div class="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between"><div class="text-sm font-medium text-slate-500 dark:text-slate-400">Showing <span class="font-bold text-slate-900 dark:text-white">${escape((page2 - 1) * limit + 1)}</span> to <span class="font-bold text-slate-900 dark:text-white">${escape(Math.min(page2 * limit, total))}</span> of <span class="font-bold text-slate-900 dark:text-white">${escape(total)}</span></div> <div class="flex gap-1"><button class="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 hover:bg-slate-50 hover:border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium text-sm flex items-center justify-center" ${page2 <= 1 ? "disabled" : ""}><span class="material-symbols-outlined text-[18px]" data-svelte-h="svelte-7gpapz">chevron_left</span></button> ${each(Array(Math.min(totalPages, 5)), (_, i) => {
    let displayPage = page2 > 3 && totalPages > 5 ? page2 + i - 2 > totalPages - 5 ? totalPages - 4 + i : page2 + i - 2 : i + 1;
    return ` <button class="${"px-3 min-w-[36px] py-1.5 rounded-lg border text-sm font-bold transition-all " + escape(
      page2 === displayPage ? "border-primary bg-primary text-white shadow-md shadow-primary/20" : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900",
      true
    )}">${escape(displayPage)} </button>`;
  })} ${totalPages > 5 && page2 < totalPages - 2 ? `<span class="px-2 py-1.5 text-slate-400" data-svelte-h="svelte-7p4g6s">...</span> <button class="px-3 min-w-[36px] py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 text-sm font-bold transition-all">${escape(totalPages)}</button>` : ``} <button class="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 hover:bg-slate-50 hover:border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium text-sm flex items-center justify-center" ${page2 >= totalPages ? "disabled" : ""}><span class="material-symbols-outlined text-[18px]" data-svelte-h="svelte-1o7dmgs">chevron_right</span></button></div></div>` : ``}</div>`;
});
const AdminModal = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$slots = compute_slots(slots);
  let { show = false } = $$props;
  let { title = "" } = $$props;
  let { size = "md" } = $$props;
  createEventDispatcher();
  if ($$props.show === void 0 && $$bindings.show && show !== void 0)
    $$bindings.show(show);
  if ($$props.title === void 0 && $$bindings.title && title !== void 0)
    $$bindings.title(title);
  if ($$props.size === void 0 && $$bindings.size && size !== void 0)
    $$bindings.size(size);
  return ` ${show ? `<div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm transition-opacity"><div class="${"bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full flex flex-col max-h-[90vh] overflow-hidden " + escape(
    size === "lg" ? "max-w-3xl" : size === "xl" ? "max-w-5xl" : "max-w-md",
    true
  ) + " animate-fadeInUp"}" style="animation-duration: 0.2s;"><div class="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30"><h2 class="text-xl font-bold text-slate-900 dark:text-white tracking-tight">${escape(title)}</h2> <button class="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors focus:outline-none" data-svelte-h="svelte-ep0ttr"><span class="material-symbols-outlined text-[20px]">close</span></button></div> <div class="p-6 overflow-y-auto custom-scrollbar">${slots.default ? slots.default({}) : ``}</div> ${$$slots.footer ? `<div class="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex justify-end gap-3 rounded-b-2xl">${slots.footer ? slots.footer({}) : ``}</div>` : ``}</div></div>` : ``}`;
});
const css = {
  code: ".file-upload.svelte-4l1hp8.svelte-4l1hp8{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:2rem;border:2px dashed #e2e8f0;border-radius:1rem;background:#f8fafc;cursor:pointer;transition:all 0.3s cubic-bezier(0.4, 0, 0.2, 1);gap:1rem;text-align:center}.file-upload.svelte-4l1hp8.svelte-4l1hp8:hover{border-color:var(--primary);background:var(--primary-light);box-shadow:0 10px 15px -3px rgba(0, 0, 0, 0.05);transform:translateY(-2px)}.file-upload.dragging.svelte-4l1hp8.svelte-4l1hp8{border-color:var(--primary);background:var(--primary-light);transform:scale(1.02)}.upload-icon.svelte-4l1hp8.svelte-4l1hp8{width:3rem;height:3rem;border-radius:50%;background:white;display:flex;align-items:center;justify-content:center;color:#94a3b8;box-shadow:0 4px 6px -1px rgba(0, 0, 0, 0.1);transition:all 0.3s ease}.file-upload.svelte-4l1hp8:hover .upload-icon.svelte-4l1hp8{color:var(--primary);transform:scale(1.1) rotate(5deg)}.upload-icon.svelte-4l1hp8 span.svelte-4l1hp8{font-size:1.5rem}.upload-text.svelte-4l1hp8 p.svelte-4l1hp8{margin:0}",
  map: null
};
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
  $$result.css.add(css);
  return `<div class="${["file-upload svelte-4l1hp8", ""].join(" ").trim()}" role="button" tabindex="0"><input type="file"${add_attribute("accept", accept, 0)} style="display: none;"> <div class="upload-icon svelte-4l1hp8" data-svelte-h="svelte-k07unu"><span class="material-symbols-outlined svelte-4l1hp8">cloud_upload</span></div> <div class="upload-text svelte-4l1hp8"><p class="font-bold text-slate-700 svelte-4l1hp8">${escape(label)}</p> <p class="text-[11px] text-slate-400 uppercase tracking-widest font-black mt-1 svelte-4l1hp8" data-svelte-h="svelte-c6gbi9">Drag &amp; drop or click to browse</p></div> </div>`;
});
function getCacheKey(field) {
  if (!field.fkFilter)
    return field.fkTable;
  return `${field.fkTable}?${new URLSearchParams(field.fkFilter).toString()}`;
}
function getOptionValue(opt) {
  if (typeof opt === "object" && opt !== null)
    return opt.value;
  return opt;
}
function getOptionLabel(opt) {
  if (typeof opt === "object" && opt !== null)
    return opt.label;
  return opt;
}
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let childDefs;
  let tableName;
  let tableConfig;
  let formFields;
  let $page, $$unsubscribe_page;
  $$unsubscribe_page = subscribe(page, (value) => $page = value);
  const CHILD_TABLE_MAP = {
    "users": [
      {
        childTable: "doctor-shifts",
        fkKey: "user_id",
        label: "Shift Dokter"
      }
    ],
    "patients": [
      {
        childTable: "patient-disease-history",
        fkKey: "patient_id",
        label: "Riwayat Penyakit"
      },
      {
        childTable: "patient-allergy",
        fkKey: "patient_id",
        label: "Alergi"
      },
      {
        childTable: "patient-medication",
        fkKey: "patient_id",
        label: "Pengobatan"
      }
    ],
    "encounters": [
      {
        childTable: "status-history",
        fkKey: "encounter_id",
        label: "Status History"
      },
      {
        childTable: "encounter-prescriptions",
        fkKey: "encounter_id",
        label: "Resep"
      },
      {
        childTable: "encounter-items",
        fkKey: "encounter_id",
        label: "Item Tagihan"
      },
      {
        childTable: "encounter-referrals",
        fkKey: "encounter_id",
        label: "Rujukan"
      }
    ]
  };
  let data = [];
  let total = 0;
  let currentPage = 1;
  let loading = true;
  let columns = [];
  let showModal = false;
  let modalMode = "create";
  let editRecord = {};
  let uploadingField = null;
  let fkLookups = {};
  let activeTab = "main";
  let childRecords = {};
  let showDeleteConfirm = false;
  let showDeleteAllConfirm = false;
  function getModalFields(mode) {
    return formFields.filter((f) => {
      if (f.readOnly && mode === "create")
        return false;
      if (f.createOnly && mode === "edit")
        return false;
      return true;
    });
  }
  async function loadData(isBg = false) {
    if (!isBg)
      loading = true;
    try {
      const res = await fetch(`/api/admin/${tableName}?page=${currentPage}&limit=20`);
      const resp = await res.json();
      data = resp.data || [];
      total = resp.total || 0;
      if (formFields.length > 0) {
        columns = formFields.filter((f) => !f.createOnly && f.type !== "password" && f.type !== "textarea" && f.type !== "m2m").map((f) => ({
          key: f.key,
          label: f.label,
          sortable: true,
          format: (val) => {
            if (val === null || val === void 0)
              return "-";
            if (typeof val === "boolean")
              return val ? "✅" : "❌";
            if (f.type === "datetime" && typeof val === "string") {
              try {
                return new Date(val).toLocaleString("id-ID");
              } catch {
                return val;
              }
            }
            return String(val);
          }
        }));
        const m2mFields = formFields.filter((f) => f.type === "m2m");
        for (const f of m2mFields) {
          columns.push({
            key: f.key,
            label: f.label,
            sortable: false,
            format: (val) => {
              if (!val || !Array.isArray(val))
                return "-";
              const lookup = fkLookups[getCacheKey(f)] || [];
              const labels = val.map((id) => {
                const found = lookup.find((l) => l.id === id);
                return found ? found[f.fkLabel] : id;
              });
              return labels.join(", ");
            }
          });
        }
        columns = columns;
      } else if (data.length > 0) {
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
      if (!isBg)
        loading = false;
    }
  }
  function getChildModalFields(childTableSlug, fkKey) {
    return (ADMIN_TABLES[childTableSlug]?.fields || []).filter((f) => f.key !== fkKey && !f.readOnly && !f.autoGenerate && f.key !== "id" && f.key !== "created_at" && f.key !== "updated_at");
  }
  onDestroy(() => {
  });
  let $$settled;
  let $$rendered;
  let previous_head = $$result.head;
  do {
    $$settled = true;
    $$result.head = previous_head;
    tableName = $page.params.table;
    childDefs = CHILD_TABLE_MAP[tableName] || [];
    tableConfig = ADMIN_TABLES[tableName];
    formFields = tableConfig?.fields || [];
    {
      if (tableName) {
        currentPage = 1;
        fkLookups = {};
        loadData();
      }
    }
    $$rendered = `${$$result.head += `<!-- HEAD_svelte-s1eqld_START -->${$$result.title = `<title>${escape(tableConfig?.label || tableName)} — Admin — Oratio Clinic</title>`, ""}<!-- HEAD_svelte-s1eqld_END -->`, ""} <div class="p-8 space-y-8 overflow-y-auto custom-scrollbar"><div class="flex items-end justify-between"><div><h1 class="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-2">${escape(tableConfig?.label || tableName)}</h1> <p class="text-slate-500 font-medium">${escape(total)} total records in database</p></div> <div class="flex gap-3"><a href="/admin" class="px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors" data-svelte-h="svelte-144j7mv"><span class="material-symbols-outlined text-[18px]">arrow_back</span>
				Dashboard</a> ${total > 0 ? `<button class="px-4 py-2 border border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-600 hover:text-white dark:hover:bg-red-600 dark:hover:text-white rounded-lg text-sm font-bold flex items-center gap-2 transition-all" data-svelte-h="svelte-1weosl4"><span class="material-symbols-outlined text-[18px]">delete_sweep</span>
					Hapus Semua</button>` : ``} <button class="px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50" ${total === 0 ? "disabled" : ""}>${`<span class="material-symbols-outlined text-[18px]" data-svelte-h="svelte-1ywpo82">download</span>`}
				Export</button> <button class="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold flex items-center gap-2 shadow-lg shadow-primary/30 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all" data-svelte-h="svelte-1i8fbpi"><span class="material-symbols-outlined text-[18px]">add</span>
				Tambah</button></div></div> ${validate_component(AdminDataTable, "AdminDataTable").$$render(
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
          return `<tr slot="row-extra"><td class="px-6 py-4"><div class="flex items-center gap-2 justify-end"><button class="p-2 text-slate-400 hover:bg-primary/10 hover:text-primary rounded-lg transition-colors flex items-center focus:outline-none" title="Edit" data-svelte-h="svelte-17x9sl1"><span class="material-symbols-outlined text-[20px]">edit</span></button> <button class="p-2 text-slate-400 hover:bg-red-500/10 hover:text-red-500 rounded-lg transition-colors flex items-center focus:outline-none" title="Hapus" data-svelte-h="svelte-7nq7n7"><span class="material-symbols-outlined text-[20px]">delete</span></button></div></td></tr>`;
        }
      }
    )}</div>  ${validate_component(AdminModal, "AdminModal").$$render(
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
          return `<div slot="footer"><button class="px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg font-bold text-sm transition-colors" data-svelte-h="svelte-wund14">Batal</button> <button class="px-4 py-2 bg-primary text-white rounded-lg font-bold text-sm shadow-lg shadow-primary/30 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed" ${""}>${``} ${escape("Tambah")}</button></div>`;
        },
        default: () => {
          return ` ${childDefs.length > 0 ? `<div class="flex gap-1 mb-6 border-b border-slate-200 dark:border-slate-700 overflow-x-auto pb-px"><button class="${"px-4 py-2 text-sm font-bold rounded-t-lg whitespace-nowrap transition-colors " + escape(
            "bg-primary text-white shadow-sm",
            true
          )}"><span class="material-symbols-outlined text-[15px] align-middle mr-1" data-svelte-h="svelte-i7ij4m">edit_note</span>
				Detail Utama</button> ${each(childDefs, (def) => {
            return `<button class="${"px-4 py-2 text-sm font-bold rounded-t-lg whitespace-nowrap transition-colors flex items-center gap-1.5 " + escape(
              activeTab === def.childTable ? "bg-primary text-white shadow-sm" : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white",
              true
            ) + " " + escape(
              "opacity-50 cursor-not-allowed",
              true
            )}" ${"disabled"}${add_attribute(
              "title",
              "Simpan record induk terlebih dahulu",
              0
            )}><span class="material-symbols-outlined text-[15px]" data-svelte-h="svelte-753hrz">table_rows</span> ${escape(def.label)} ${(childRecords[def.childTable] || []).length > 0 ? `<span class="${"text-[10px] font-black px-1.5 py-0.5 rounded-full " + escape(
              activeTab === def.childTable ? "bg-white/20 text-white" : "bg-primary/10 text-primary",
              true
            )}">${escape(childRecords[def.childTable].length)} </span>` : ``} </button>`;
          })}</div>` : ``}  ${`<div class="grid grid-cols-1 sm:grid-cols-2 gap-6">${each(getModalFields(modalMode), (field) => {
            let isDisabled = field.readOnly || field.editReadOnly && modalMode === "edit";
            return ` <div class="${"flex flex-col gap-1.5 " + escape(field.type === "textarea" ? "sm:col-span-2" : "", true)}"><label class="text-sm font-bold text-slate-700 dark:text-slate-300" for="${"inp-" + escape(field.key, true)}">${escape(field.label)} ${field.required && !isDisabled ? `<span class="text-red-500" data-svelte-h="svelte-1n3raya">*</span>` : ``}</label> ${isDisabled ? `<input id="${"inp-" + escape(field.key, true)}" class="px-4 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-500 cursor-not-allowed w-full"${add_attribute("value", editRecord[field.key] ?? "", 0)} disabled>` : `${field.type === "select" ? `<select id="${"inp-" + escape(field.key, true)}" class="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 rounded-lg text-sm transition-all focus:outline-none w-full text-slate-900 dark:text-white"${add_attribute("value", editRecord[field.key] ?? "", 0)}><option value="" data-svelte-h="svelte-1wj0zs">-- Pilih --</option>${each(field.options || [], (opt) => {
              return `<option${add_attribute("value", getOptionValue(opt), 0)}>${escape(getOptionLabel(opt))}</option>`;
            })}</select>` : `${field.type === "boolean" ? `<div class="py-2 flex items-center pr-4"><label class="relative inline-flex items-center cursor-pointer"><input type="checkbox" id="${"inp-" + escape(field.key, true)}" class="sr-only peer"${add_attribute("checked", editRecord[field.key], 1)}> <div class="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 dark:peer-focus:ring-primary/10 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-primary"></div> <span class="ml-3 text-sm font-medium text-slate-600 dark:text-slate-400">${escape(editRecord[field.key] ? "Ya" : "Tidak")}</span></label> </div>` : `${field.type === "textarea" ? `<textarea id="${"inp-" + escape(field.key, true)}" class="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 rounded-lg text-sm transition-all focus:outline-none w-full text-slate-900 dark:text-white resize-none" rows="3"${add_attribute("placeholder", field.placeholder || "", 0)}>${escape(editRecord[field.key] || "")}</textarea>` : `${field.type === "password" ? `<div class="space-y-1.5"><input id="${"inp-" + escape(field.key, true)}" type="password" class="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 rounded-lg text-sm transition-all focus:outline-none w-full text-slate-900 dark:text-white"${add_attribute("placeholder", field.placeholder || "Enter password", 0)}${add_attribute("value", editRecord[field.key], 0)}> ${``} </div>` : `${field.type === "date" ? `<input id="${"inp-" + escape(field.key, true)}" type="date" class="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 rounded-lg text-sm transition-all focus:outline-none w-full text-slate-900 dark:text-white"${add_attribute("value", editRecord[field.key], 0)}>` : `${field.type === "time" ? `<input id="${"inp-" + escape(field.key, true)}" type="time" class="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 rounded-lg text-sm transition-all focus:outline-none w-full text-slate-900 dark:text-white"${add_attribute("value", editRecord[field.key], 0)}>` : `${field.type === "datetime" ? `<input id="${"inp-" + escape(field.key, true)}" type="datetime-local" class="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 rounded-lg text-sm transition-all focus:outline-none w-full text-slate-900 dark:text-white"${add_attribute("value", editRecord[field.key], 0)}>` : `${field.type === "number" ? `<input id="${"inp-" + escape(field.key, true)}" type="number" class="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 rounded-lg text-sm transition-all focus:outline-none w-full text-slate-900 dark:text-white" step="any"${add_attribute("value", editRecord[field.key], 0)}>` : `${field.type === "email" ? `<input id="${"inp-" + escape(field.key, true)}" type="email" class="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 rounded-lg text-sm transition-all focus:outline-none w-full text-slate-900 dark:text-white"${add_attribute("placeholder", field.placeholder || "email@example.com", 0)}${add_attribute("value", editRecord[field.key], 0)}>` : `${field.type === "fk" ? `<select id="${"inp-" + escape(field.key, true)}" class="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 rounded-lg text-sm transition-all focus:outline-none w-full text-slate-900 dark:text-white"${add_attribute("value", editRecord[field.key] ?? "", 0)}><option value="" data-svelte-h="svelte-1wj0zs">-- Pilih --</option>${fkLookups[getCacheKey(field)] ? `${each(fkLookups[getCacheKey(field)], (fkRow) => {
              return `<option${add_attribute("value", fkRow.id, 0)}>${escape(fkRow[field.fkLabel] || fkRow.id)}</option>`;
            })}` : `<option value="" disabled data-svelte-h="svelte-15ro49i">Loading...</option>`}</select>` : `${field.type === "m2m" ? `<div class="flex flex-wrap gap-2 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 min-h-[100px]">${fkLookups[getCacheKey(field)] ? `${each(fkLookups[getCacheKey(field)], (fkRow) => {
              let isSelected = (editRecord[field.key] || []).includes(fkRow.id);
              return ` <button type="button" class="${"px-3 py-1.5 rounded-full text-xs font-bold transition-all border " + escape(
                isSelected ? "bg-primary text-white border-primary shadow-md shadow-primary/20" : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-primary/50",
                true
              )}"><div class="flex items-center gap-1.5">${isSelected ? `<span class="material-symbols-outlined text-[14px]" data-svelte-h="svelte-11qb43z">check_circle</span>` : ``}${escape(fkRow[field.fkLabel] || fkRow.id)}</div> </button>`;
            })} ${fkLookups[getCacheKey(field)].length === 0 ? `<div class="w-full flex flex-col items-center justify-center text-slate-400 py-4" data-svelte-h="svelte-12gl373"><span class="material-symbols-outlined text-4xl mb-2 opacity-20">group_off</span><p class="text-xs font-medium">No results found.</p></div>` : ``}` : `<div class="w-full flex items-center justify-center py-4" data-svelte-h="svelte-1khjfna"><span class="material-symbols-outlined animate-spin text-primary">progress_activity</span></div>`} </div>` : `${field.type === "image" ? `<div class="space-y-3">${editRecord[field.key] ? `<div class="relative w-32 h-32 rounded-xl border border-slate-200 overflow-hidden group bg-slate-50"><img${add_attribute("src", editRecord[field.key], 0)} alt="Preview" class="w-full h-full object-cover"> <button type="button" class="absolute inset-0 bg-red-500/80 text-white opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1" data-svelte-h="svelte-66ykpd"><span class="material-symbols-outlined">delete</span><span class="text-[10px] font-bold uppercase">Hapus</span></button> </div>` : `${uploadingField === field.key ? `<div class="w-full h-32 rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 flex flex-col items-center justify-center gap-2" data-svelte-h="svelte-1yv3yc0"><span class="material-symbols-outlined animate-spin text-primary">progress_activity</span> <span class="text-xs font-bold text-primary uppercase">Mengunggah...</span> </div>` : `${validate_component(FileUpload, "FileUpload").$$render(
              $$result,
              {
                label: "Pilih Foto Profil",
                accept: "image/*"
              },
              {},
              {}
            )}`}`} <p class="text-[10px] text-slate-400 font-medium" data-svelte-h="svelte-v2qlpe">Format: JPG, PNG. Max 5MB.</p> </div>` : `<input id="${"inp-" + escape(field.key, true)}" type="text" class="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 rounded-lg text-sm transition-all focus:outline-none w-full text-slate-900 dark:text-white"${add_attribute("maxlength", field.maxLength || void 0, 0)}${add_attribute("placeholder", field.placeholder || "", 0)}${add_attribute("value", editRecord[field.key], 0)}>`}`}`}`}`}`}`}`}`}`}`}`}`} </div>`;
          })}</div>`}  ${each(childDefs, (def) => {
            return `${activeTab === def.childTable ? (() => {
              let childFields = getChildModalFields(def.childTable, def.fkKey), rows = childRecords[def.childTable] || [];
              return `  <div class="space-y-4"> <div class="flex items-center justify-between"><p class="text-sm font-bold text-slate-700 dark:text-slate-300">${escape(rows.length)} record${escape(rows.length !== 1 ? "s" : "")}</p> <button type="button" class="px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow shadow-primary/30 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all" data-svelte-h="svelte-1cl56mx"><span class="material-symbols-outlined text-[15px]">add</span>
						Tambah Baris
					</button></div> ${rows.length === 0 ? `<div class="flex flex-col items-center justify-center py-12 text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl"><span class="material-symbols-outlined text-4xl mb-2 opacity-30" data-svelte-h="svelte-1b9vksw">table_rows</span> <p class="text-sm font-bold">Belum ada data ${escape(def.label)}</p> <p class="text-xs mt-1" data-svelte-h="svelte-d3grcp">Klik &quot;Tambah Baris&quot; untuk menambahkan record baru</p> </div>` : ` <div class="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700"><table class="w-full text-sm"><thead><tr class="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">${each(childFields, (cf) => {
                return `<th class="px-4 py-3 text-left text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wide whitespace-nowrap">${escape(cf.label)}${cf.required ? `<span class="text-red-500 ml-0.5" data-svelte-h="svelte-1yfuf53">*</span>` : ``} </th>`;
              })} <th class="px-4 py-3 w-12"></th> </tr></thead> <tbody class="divide-y divide-slate-100 dark:divide-slate-800">${each(rows, (row, rowIdx) => {
                return `<tr class="bg-white dark:bg-slate-900 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">${each(childFields, (cf) => {
                  return `<td class="px-3 py-2">${cf.type === "select" ? `<select class="w-full min-w-[120px] px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:border-primary/50 focus:ring-2 focus:ring-primary/10 outline-none"${add_attribute("value", row[cf.key] ?? "", 0)}><option value="" data-svelte-h="svelte-1wj0zs">-- Pilih --</option>${each(cf.options || [], (opt) => {
                    return `<option${add_attribute("value", getOptionValue(opt), 0)}>${escape(getOptionLabel(opt))}</option>`;
                  })}</select>` : `${cf.type === "fk" ? `<select class="w-full min-w-[160px] px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:border-primary/50 focus:ring-2 focus:ring-primary/10 outline-none"${add_attribute("value", row[cf.key] ?? "", 0)}><option value="" data-svelte-h="svelte-1wj0zs">-- Pilih --</option>${fkLookups[getCacheKey(cf)] ? `${each(fkLookups[getCacheKey(cf)], (fkRow) => {
                    return `<option${add_attribute("value", fkRow.id, 0)}>${escape(fkRow[cf.fkLabel] || fkRow.id)}</option>`;
                  })}` : `<option disabled value="Loading…" data-svelte-h="svelte-10sba7o">Loading…</option>`}</select>` : `${cf.type === "boolean" ? `<label class="flex items-center gap-2 cursor-pointer"><input type="checkbox" ${row[cf.key] === true || row[cf.key] === "true" ? "checked" : ""} class="w-4 h-4 accent-primary"> <span class="text-xs text-slate-600 dark:text-slate-400">${escape(row[cf.key] ? "Ya" : "Tidak")}</span> </label>` : `${cf.type === "number" ? `<input type="number" class="w-full min-w-[100px] px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:border-primary/50 focus:ring-2 focus:ring-primary/10 outline-none"${add_attribute("value", row[cf.key] ?? "", 0)} step="any">` : `${cf.type === "date" ? `<input type="date" class="w-full min-w-[140px] px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:border-primary/50 focus:ring-2 focus:ring-primary/10 outline-none"${add_attribute("value", row[cf.key] ?? "", 0)}>` : `${cf.type === "time" ? `<input type="time" class="w-full min-w-[120px] px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:border-primary/50 focus:ring-2 focus:ring-primary/10 outline-none"${add_attribute("value", row[cf.key] ?? "", 0)}>` : `${cf.type === "datetime" ? `<input type="datetime-local" class="w-full min-w-[180px] px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:border-primary/50 focus:ring-2 focus:ring-primary/10 outline-none"${add_attribute("value", row[cf.key] ?? "", 0)}>` : `<input type="text" class="w-full min-w-[120px] px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:border-primary/50 focus:ring-2 focus:ring-primary/10 outline-none"${add_attribute("value", row[cf.key] ?? "", 0)}${add_attribute("maxlength", cf.maxLength || void 0, 0)}>`}`}`}`}`}`}`} </td>`;
                })}  <td class="px-3 py-2 text-center"><button type="button" class="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors" data-svelte-h="svelte-pe9w3d"><span class="material-symbols-outlined text-[18px]">delete</span> </button></td> </tr>`;
              })} </tbody></table> </div>`} </div>`;
            })() : ``}`;
          })}`;
        }
      }
    )}  ${validate_component(AdminModal, "AdminModal").$$render(
      $$result,
      {
        title: "Konfirmasi Hapus Semua",
        show: showDeleteAllConfirm
      },
      {
        show: ($$value) => {
          showDeleteAllConfirm = $$value;
          $$settled = false;
        }
      },
      {
        footer: () => {
          return `<div slot="footer"><button class="px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg font-bold text-sm transition-colors" data-svelte-h="svelte-1mm0q2t">Batal</button> <button class="px-4 py-2 bg-red-600 text-white rounded-lg font-bold text-sm shadow-lg shadow-red-600/30 hover:shadow-red-600/40 hover:-translate-y-0.5 transition-all flex items-center gap-2 disabled:opacity-50" ${""}>${`<span class="material-symbols-outlined text-[18px]" data-svelte-h="svelte-1rfxav1">delete_forever</span>
				Ya, Hapus Semua`}</button></div>`;
        },
        default: () => {
          return `<div class="flex items-start gap-4"><div class="size-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0" data-svelte-h="svelte-bucnpx"><span class="material-symbols-outlined text-red-600 dark:text-red-400">delete_sweep</span></div> <div><h4 class="text-lg font-bold text-slate-900 dark:text-white mb-1" data-svelte-h="svelte-9rppz3">Hapus Semua Data?</h4> <p class="text-slate-500 dark:text-slate-400 text-sm">Anda akan menghapus **seluruh** data pada tabel <span class="font-bold text-slate-900 dark:text-white">${escape(tableConfig?.label || tableName)}</span> (${escape(total)} record).
				Tindakan ini bersifat permanen dan tidak dapat dibatalkan.</p></div></div>`;
        }
      }
    )}  ${validate_component(AdminModal, "AdminModal").$$render(
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
          return `<div slot="footer"><button class="px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg font-bold text-sm transition-colors" data-svelte-h="svelte-jejybu">Batal</button> <button class="px-4 py-2 bg-red-600 text-white rounded-lg font-bold text-sm shadow-lg shadow-red-600/30 hover:shadow-red-600/40 hover:-translate-y-0.5 transition-all flex items-center gap-2" data-svelte-h="svelte-197oo5a"><span class="material-symbols-outlined text-[18px]">delete</span>
			Ya, Hapus</button></div>`;
        },
        default: () => {
          return `<div class="flex items-start gap-4" data-svelte-h="svelte-gs8nny"><div class="size-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0"><span class="material-symbols-outlined text-red-600 dark:text-red-400">warning</span></div> <div><h4 class="text-lg font-bold text-slate-900 dark:text-white mb-1">Hapus Data?</h4> <p class="text-slate-500 dark:text-slate-400 text-sm">Apakah Anda yakin ingin menghapus data ini? Tindakan ini tidak dapat
				dibatalkan dan semua data yang terhubung dapat ikut terhapus atau kehilangan relasi.</p></div></div>`;
        }
      }
    )}`;
  } while (!$$settled);
  $$unsubscribe_page();
  return $$rendered;
});
export {
  Page as default
};
