import { c as create_ssr_component, a as subscribe, o as onDestroy, v as validate_component, d as createEventDispatcher, f as escape, g as add_attribute, e as each } from './ssr-4a5a9ccc.js';
import { p as page } from './stores-468b91fe.js';
import { c as isPatientProfileOpen, h as headerTitle, b as isSidebarHidden } from './layout-3873cafe.js';
import { S as SearchableSelect } from './SearchableSelect-4aa6c810.js';
import { K as KEADAAN, P as PROTESA, B as BAHAN_PROTESA, R as RESTORASI, a as BAHAN_RESTORASI } from './constants-7804d9c5.js';
import './index2-bd557b7d.js';

const SingleToothMap = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let isLower;
  let isRightSideOfMouth;
  let isAnterior;
  let points;
  let { number = "" } = $$props;
  let { selectedSurfaces = [] } = $$props;
  createEventDispatcher();
  function flashAll() {
    clickedSurface = "all";
    setTimeout(() => clickedSurface = null, 150);
  }
  let clickedSurface = null;
  function isSelected(pos) {
    return selectedSurfaces.includes(pos);
  }
  function getLabel(pos) {
    if (pos === "center")
      return isAnterior ? "I" : "O";
    if (pos === "top")
      return isLower ? "L" : "B";
    if (pos === "bottom")
      return isLower ? "B" : "P";
    if (pos === "left")
      return isRightSideOfMouth ? "D" : "M";
    if (pos === "right")
      return isRightSideOfMouth ? "M" : "D";
    return "";
  }
  const tPos = isAnterior ? {
    top: { x: 50, y: 15 },
    right: { x: 80, y: 50 },
    bottom: { x: 50, y: 85 },
    left: { x: 20, y: 50 },
    center: { x: 50, y: 50 }
  } : {
    top: { x: 50, y: 15 },
    right: { x: 85, y: 50 },
    bottom: { x: 50, y: 85 },
    left: { x: 15, y: 50 },
    center: { x: 50, y: 50 }
  };
  if ($$props.number === void 0 && $$bindings.number && number !== void 0)
    $$bindings.number(number);
  if ($$props.selectedSurfaces === void 0 && $$bindings.selectedSurfaces && selectedSurfaces !== void 0)
    $$bindings.selectedSurfaces(selectedSurfaces);
  if ($$props.flashAll === void 0 && $$bindings.flashAll && flashAll !== void 0)
    $$bindings.flashAll(flashAll);
  isLower = String(number).startsWith("3") || String(number).startsWith("4") || String(number).startsWith("7") || String(number).startsWith("8");
  isRightSideOfMouth = ["1", "4", "5", "8"].includes(String(number).charAt(0));
  isAnterior = ["1", "2", "3"].includes(String(number).charAt(1));
  points = isAnterior ? {
    top: "0,0 100,0 75,35 25,35",
    right: "100,0 100,100 75,65 75,35",
    bottom: "0,100 100,100 75,65 25,65",
    left: "0,0 0,100 25,65 25,35",
    center: "25,35 75,35 75,65 25,65"
  } : {
    top: "0,0 100,0 75,25 25,25",
    right: "100,0 100,100 75,75 75,25",
    bottom: "0,100 100,100 75,75 25,75",
    left: "0,0 0,100 25,75 25,25",
    center: "25,25 75,25 75,75 25,75"
  };
  return `<div class="relative w-full max-w-[200px] mx-auto aspect-square flex flex-col items-center justify-center"><svg width="100%" height="100%" viewBox="0 0 100 100" class="overflow-visible group filter drop-shadow-sm"><g class="cursor-pointer active:scale-[0.97] transition-transform duration-100 origin-center"><polygon${add_attribute("points", points.top, 0)}${add_attribute(
    "fill",
    clickedSurface === "top" || clickedSurface === "all" ? "var(--primary)" : isSelected("top") ? "var(--primary-light)" : "#f8fafc",
    0
  )} stroke="#cbd5e1" stroke-width="2" stroke-linejoin="round" class="transition-colors duration-150 hover:brightness-95"></polygon><line x1="0" y1="0" x2="100" y2="0" stroke="var(--primary)"${add_attribute(
    "stroke-width",
    isSelected("top") || clickedSurface === "top" || clickedSurface === "all" ? "6" : "0",
    0
  )} class="transition-all duration-200"></line><text${add_attribute("x", tPos.top.x, 0)}${add_attribute("y", tPos.top.y, 0)} font-size="12" font-weight="bold"${add_attribute(
    "fill",
    isSelected("top") || clickedSurface === "top" || clickedSurface === "all" ? "var(--primary)" : "#94a3b8",
    0
  )} text-anchor="middle" dominant-baseline="middle" class="pointer-events-none select-none transition-colors duration-150">${escape(getLabel("top"))}</text></g><g class="cursor-pointer active:scale-[0.97] transition-transform duration-100 origin-center"><polygon${add_attribute("points", points.right, 0)}${add_attribute(
    "fill",
    clickedSurface === "right" || clickedSurface === "all" ? "var(--primary)" : isSelected("right") ? "var(--primary-light)" : "#f8fafc",
    0
  )} stroke="#cbd5e1" stroke-width="2" stroke-linejoin="round" class="transition-colors duration-150 hover:brightness-95"></polygon><line x1="100" y1="0" x2="100" y2="100" stroke="var(--primary)"${add_attribute(
    "stroke-width",
    isSelected("right") || clickedSurface === "right" || clickedSurface === "all" ? "6" : "0",
    0
  )} class="transition-all duration-200"></line><text${add_attribute("x", tPos.right.x, 0)}${add_attribute("y", tPos.right.y, 0)} font-size="12" font-weight="bold"${add_attribute(
    "fill",
    isSelected("right") || clickedSurface === "right" || clickedSurface === "all" ? "var(--primary)" : "#94a3b8",
    0
  )} text-anchor="middle" dominant-baseline="middle" class="pointer-events-none select-none transition-colors duration-150">${escape(getLabel("right"))}</text></g><g class="cursor-pointer active:scale-[0.97] transition-transform duration-100 origin-center"><polygon${add_attribute("points", points.bottom, 0)}${add_attribute(
    "fill",
    clickedSurface === "bottom" || clickedSurface === "all" ? "var(--primary)" : isSelected("bottom") ? "var(--primary-light)" : "#f8fafc",
    0
  )} stroke="#cbd5e1" stroke-width="2" stroke-linejoin="round" class="transition-colors duration-150 hover:brightness-95"></polygon><line x1="0" y1="100" x2="100" y2="100" stroke="var(--primary)"${add_attribute(
    "stroke-width",
    isSelected("bottom") || clickedSurface === "bottom" || clickedSurface === "all" ? "6" : "0",
    0
  )} class="transition-all duration-200"></line><text${add_attribute("x", tPos.bottom.x, 0)}${add_attribute("y", tPos.bottom.y, 0)} font-size="12" font-weight="bold"${add_attribute(
    "fill",
    isSelected("bottom") || clickedSurface === "bottom" || clickedSurface === "all" ? "var(--primary)" : "#94a3b8",
    0
  )} text-anchor="middle" dominant-baseline="middle" class="pointer-events-none select-none transition-colors duration-150">${escape(getLabel("bottom"))}</text></g><g class="cursor-pointer active:scale-[0.97] transition-transform duration-100 origin-center"><polygon${add_attribute("points", points.left, 0)}${add_attribute(
    "fill",
    clickedSurface === "left" || clickedSurface === "all" ? "var(--primary)" : isSelected("left") ? "var(--primary-light)" : "#f8fafc",
    0
  )} stroke="#cbd5e1" stroke-width="2" stroke-linejoin="round" class="transition-colors duration-150 hover:brightness-95"></polygon><line x1="0" y1="0" x2="0" y2="100" stroke="var(--primary)"${add_attribute(
    "stroke-width",
    isSelected("left") || clickedSurface === "left" || clickedSurface === "all" ? "6" : "0",
    0
  )} class="transition-all duration-200"></line><text${add_attribute("x", tPos.left.x, 0)}${add_attribute("y", tPos.left.y, 0)} font-size="12" font-weight="bold"${add_attribute(
    "fill",
    isSelected("left") || clickedSurface === "left" || clickedSurface === "all" ? "var(--primary)" : "#94a3b8",
    0
  )} text-anchor="middle" dominant-baseline="middle" class="pointer-events-none select-none transition-colors duration-150">${escape(getLabel("left"))}</text></g><g class="cursor-pointer active:scale-[0.97] transition-transform duration-100 origin-center"><polygon${add_attribute("points", points.center, 0)}${add_attribute(
    "fill",
    clickedSurface === "center" || clickedSurface === "all" ? "var(--primary)" : isSelected("center") ? "var(--primary-light)" : "#ffffff",
    0
  )}${add_attribute(
    "stroke",
    isSelected("center") || clickedSurface === "center" || clickedSurface === "all" ? "var(--primary)" : "#cbd5e1",
    0
  )}${add_attribute(
    "stroke-width",
    isSelected("center") || clickedSurface === "center" || clickedSurface === "all" ? "3" : "2",
    0
  )} stroke-linejoin="round" class="transition-colors duration-150 hover:brightness-95 z-10"></polygon><text${add_attribute("x", tPos.center.x, 0)}${add_attribute("y", tPos.center.y, 0)} font-size="12" font-weight="bold"${add_attribute(
    "fill",
    isSelected("center") || clickedSurface === "center" || clickedSurface === "all" ? "var(--primary)" : "#94a3b8",
    0
  )} text-anchor="middle" dominant-baseline="middle" class="pointer-events-none select-none transition-colors duration-150">${escape(getLabel("center"))}</text></g></svg></div>`;
});
function getPositionalName(clinical, toothNum) {
  const quad = String(toothNum).charAt(0);
  const isUpper = ["1", "2", "5", "6"].includes(quad);
  const isRightSideOfMouth = ["1", "4", "5", "8"].includes(quad);
  ["1", "2", "3"].includes(String(toothNum).charAt(1));
  const c = clinical.toUpperCase();
  if (c === "O" || c === "I")
    return "center";
  if (c === "M")
    return isRightSideOfMouth ? "right" : "left";
  if (c === "D")
    return isRightSideOfMouth ? "left" : "right";
  if (c === "B" || c === "F" || c === "LA" || c === "V") {
    return isUpper ? "top" : "bottom";
  }
  if (c === "P" || c === "L") {
    return isUpper ? "bottom" : "top";
  }
  return "center";
}
const ToothDetailPanel = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { show = false } = $$props;
  let { initialData = {} } = $$props;
  let { searchIcd10Fn = null } = $$props;
  let { searchIcd9Fn = null } = $$props;
  createEventDispatcher();
  let t = {
    restorations: [],
    diagnoses: [],
    procedures: [],
    protesa: "",
    bahan_protesa: ""
  };
  let initializedFor = null;
  let mapComponents = [];
  let isTerminal = false;
  if ($$props.show === void 0 && $$bindings.show && show !== void 0)
    $$bindings.show(show);
  if ($$props.initialData === void 0 && $$bindings.initialData && initialData !== void 0)
    $$bindings.initialData(initialData);
  if ($$props.searchIcd10Fn === void 0 && $$bindings.searchIcd10Fn && searchIcd10Fn !== void 0)
    $$bindings.searchIcd10Fn(searchIcd10Fn);
  if ($$props.searchIcd9Fn === void 0 && $$bindings.searchIcd9Fn && searchIcd9Fn !== void 0)
    $$bindings.searchIcd9Fn(searchIcd9Fn);
  let $$settled;
  let $$rendered;
  let previous_head = $$result.head;
  do {
    $$settled = true;
    $$result.head = previous_head;
    {
      if (show && initialData && initialData.tooth_number !== initializedFor) {
        const newT = JSON.parse(JSON.stringify(initialData));
        if (!newT.restorations)
          newT.restorations = [];
        if (!newT.diagnoses)
          newT.diagnoses = [];
        if (!newT.procedures)
          newT.procedures = [];
        if (!newT.protesa)
          newT.protesa = "";
        if (!newT.bahan_protesa)
          newT.bahan_protesa = "";
        t = newT;
        isTerminal = ["mis", "rrx"].includes(t.keadaan);
        initializedFor = t.tooth_number;
      }
    }
    {
      if (!show) {
        initializedFor = null;
      }
    }
    $$rendered = `${show ? `   <div class="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm transition-opacity"></div>  <div class="fixed top-0 right-0 z-50 w-full max-w-lg h-full bg-slate-50 shadow-2xl flex flex-col transform transition-transform border-l border-slate-200"><div class="bg-white px-6 py-5 flex items-center justify-between border-b border-slate-200 shadow-sm shrink-0"><h2 class="text-xl font-bold text-slate-800 flex items-center gap-3"><div class="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center border border-primary/20">${escape(t.tooth_number)}</div>
				Detail Gigi</h2> <button class="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors" data-svelte-h="svelte-17vw4w9"><span class="material-symbols-outlined text-[20px]">close</span></button></div>  <div class="flex-1 overflow-y-auto px-6 py-6 space-y-6 custom-scrollbar"> <section class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm"><h3 class="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4" data-svelte-h="svelte-1njeaze">Level 1: Kondisi Global</h3> <div class="space-y-4"><div><label class="text-sm font-bold text-slate-700 block mb-1" data-svelte-h="svelte-pgf17c">Keadaan (Kondisi Utama)</label> <select class="${"w-full rounded-xl border-slate-200 text-sm focus:border-primary shadow-sm " + escape(
      isTerminal ? "bg-red-50 text-red-700 border-red-200 font-bold" : "",
      true
    )}"${add_attribute("value", t.keadaan, 0)}><option value="" data-svelte-h="svelte-7j6zt5">-- Pilih Keadaan --</option>${each(KEADAAN, (k) => {
      return `<option${add_attribute("value", k.key, 0)}>${escape(k.label)}</option>`;
    })}</select></div> <div class="grid grid-cols-2 gap-4"><div><label class="text-sm font-bold text-slate-700 block mb-1">Protesa ${escape(t.protesa ? "✓" : "")}</label> <select class="w-full rounded-xl border-slate-200 text-sm focus:border-primary shadow-sm"${add_attribute("value", t.protesa, 0)}><option value="" data-svelte-h="svelte-pyirq7">-- Tidak Ada --</option>${each(PROTESA, (k) => {
      return `<option${add_attribute("value", k.key, 0)}>${escape(k.label)}</option>`;
    })}</select></div> <div><label class="text-sm font-bold text-slate-700 block mb-1" data-svelte-h="svelte-1qlbjnj">Bahan Protesa</label> <select class="w-full rounded-xl border-slate-200 text-sm focus:border-primary shadow-sm disabled:bg-slate-100 disabled:text-slate-400"${add_attribute("value", t.bahan_protesa, 0)} ${!t.protesa ? "disabled" : ""}><option value="" data-svelte-h="svelte-pyirq7">-- Tidak Ada --</option>${each(BAHAN_PROTESA, (k) => {
      return `<option${add_attribute("value", k.key, 0)}>${escape(k.label)}</option>`;
    })}</select></div></div></div></section> ${!isTerminal ? `<section class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4"><div class="flex items-center justify-between"><h3 class="text-xs font-bold uppercase tracking-widest text-slate-400" data-svelte-h="svelte-2gzeaz">Level 2: Restorasi &amp; Permukaan</h3> <button class="text-xs font-bold text-primary hover:bg-primary/10 px-3 py-1.5 rounded-lg transition-colors border border-primary/20 flex items-center gap-1" data-svelte-h="svelte-1x790tp"><span class="material-symbols-outlined text-[14px]">add</span> Tambah</button></div> <div class="space-y-4">${t.restorations.length === 0 ? `<div class="border border-dashed border-slate-200 bg-slate-50 text-slate-400 text-xs font-bold p-4 text-center rounded-xl h-full flex items-center justify-center" data-svelte-h="svelte-6fhmiz">Belum ada restorasi untuk gigi ini. Klik &quot;Tambah&quot; untuk mencatat.</div>` : `${each(t.restorations, (rest, i) => {
      return `<div class="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 flex flex-col gap-4"><div class="flex justify-between items-center border-b border-indigo-100 pb-2"><div class="text-[11px] font-black uppercase text-indigo-500">Restorasi ${escape(i + 1)}</div> <button class="text-slate-400 hover:text-red-500" data-svelte-h="svelte-evb2id"><span class="material-symbols-outlined text-[18px]">close</span></button></div> <div class="grid grid-cols-1 md:grid-cols-[1fr_120px] gap-6"><div class="space-y-3"><div><label class="text-[10px] font-bold text-slate-500 uppercase block mb-1" data-svelte-h="svelte-1colv9r">Jenis Restorasi</label> <select class="w-full text-sm rounded-lg border-indigo-200 focus:border-primary shadow-sm bg-white"${add_attribute("value", rest.restorasi, 0)}><option value="" data-svelte-h="svelte-ed32n7">-- Pilih Jenis --</option>${each(RESTORASI, (r) => {
        return `<option${add_attribute("value", r.key, 0)}>${escape(r.label)}</option>`;
      })}</select></div> <div><label class="text-[10px] font-bold text-slate-500 uppercase block mb-1" data-svelte-h="svelte-ooraia">Bahan Restorasi</label> <select class="w-full text-sm rounded-lg border-indigo-200 focus:border-primary shadow-sm bg-white disabled:opacity-60"${add_attribute("value", rest.bahan_restorasi, 0)} ${!rest.restorasi ? "disabled" : ""}><option value="" data-svelte-h="svelte-12bwmhg">-- Pilih Bahan --</option>${each(BAHAN_RESTORASI, (r) => {
        return `<option${add_attribute("value", r.key, 0)}>${escape(r.label)}</option>`;
      })}</select> </div></div> <div class="flex flex-col items-center shrink-0 border-l border-indigo-100 pl-4 py-1"><label class="text-[10px] font-bold text-slate-500 uppercase block mb-2 text-center w-full" data-svelte-h="svelte-gw69g9">Permukaan</label> <div class="scale-75 origin-top mb-[-15px]">${validate_component(SingleToothMap, "SingleToothMap").$$render(
        $$result,
        {
          number: t.tooth_number,
          selectedSurfaces: rest.surfaces.map((s) => getPositionalName(s, t.tooth_number)),
          this: mapComponents[i]
        },
        {
          this: ($$value) => {
            mapComponents[i] = $$value;
            $$settled = false;
          }
        },
        {}
      )}</div> <button class="mt-1 text-[9px] font-bold text-primary hover:bg-primary/10 px-2.5 py-1 rounded-md border border-primary/20 w-full text-center" data-svelte-h="svelte-ssww06">PILIH SEMUA</button> ${rest.surfaces.length > 0 ? `<div class="mt-2 flex flex-wrap gap-1 justify-center">${each(rest.surfaces, (surf) => {
        return ` <span role="button" tabindex="0" class="text-[9px] font-bold text-white bg-indigo-500 hover:bg-indigo-600 active:scale-90 active:bg-indigo-700 transition-all cursor-pointer px-1.5 py-0.5 rounded shadow-sm" title="Hapus">${escape(surf)}</span>`;
      })} </div>` : ``} </div></div> </div>`;
    })}`}</div></section>` : ``}   <section class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4"><h3 class="text-xs font-bold uppercase tracking-widest text-slate-400" data-svelte-h="svelte-1d5z4vl">Level 3: Diagnosa (ICD-10)</h3> <div class="[&amp;_input]:w-full [&amp;_input]:py-2 [&amp;_input]:rounded-xl [&amp;_input]:text-sm">${validate_component(SearchableSelect, "SearchableSelect").$$render(
      $$result,
      {
        placeholder: "Cari Diagnosa ICD-10...",
        searchFn: searchIcd10Fn,
        value: "",
        label: ""
      },
      {},
      {}
    )}</div> <div class="space-y-2">${each(t.diagnoses, (diag, i) => {
      return `<div class="${"flex items-start gap-3 p-3 bg-red-50/30 rounded-xl border border-red-100 " + escape(diag.is_primary ? "ring-1 ring-red-300" : "", true)}"><div class="pt-0.5"><input type="radio" name="primary_diag" class="text-red-500 focus:ring-red-500" ${diag.is_primary ? "checked" : ""} title="Set as Primary"></div> <div class="flex-1"><p class="text-xs font-bold text-slate-800 leading-tight">${escape(diag.diagnosis_display)}</p> <div class="flex items-center gap-2 mt-1"><span class="text-[10px] font-mono text-red-600 bg-red-100 px-1.5 py-0.5 rounded uppercase">${escape(diag.diagnosis_code)}</span> ${diag.is_primary ? `<span class="text-[10px] font-black text-red-500 uppercase tracking-widest" data-svelte-h="svelte-15xgo5c">Primary</span>` : ``} </div></div> <button class="text-slate-400 hover:text-red-500" data-svelte-h="svelte-1d5uwfi"><span class="material-symbols-outlined text-[18px]">close</span></button> </div>`;
    })}</div></section>  <section class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4"><h3 class="text-xs font-bold uppercase tracking-widest text-slate-400" data-svelte-h="svelte-dfv2v0">Level 3: Tindakan (ICD-9-CM)</h3> <div class="[&amp;_input]:w-full [&amp;_input]:py-2 [&amp;_input]:rounded-xl [&amp;_input]:text-sm">${validate_component(SearchableSelect, "SearchableSelect").$$render(
      $$result,
      {
        placeholder: "Cari Tindakan ICD-9-CM...",
        searchFn: searchIcd9Fn,
        value: "",
        label: ""
      },
      {},
      {}
    )}</div> <div class="space-y-2">${each(t.procedures, (proc, i) => {
      return `<div class="flex items-center gap-3 p-3 bg-emerald-50/30 rounded-xl border border-emerald-100"><div class="flex-1"><p class="text-xs font-bold text-slate-800 leading-tight">${escape(proc.procedure_display)}</p> <span class="text-[10px] font-mono text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded uppercase mt-1 inline-block">${escape(proc.procedure_code)}</span></div> <button class="text-slate-400 hover:text-red-500" data-svelte-h="svelte-18n0ea9"><span class="material-symbols-outlined text-[18px]">close</span></button> </div>`;
    })}</div></section></div> <div class="p-5 border-t border-slate-200 bg-slate-50 shrink-0 flex justify-end gap-3"><button class="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-200 transition-colors" data-svelte-h="svelte-odmc1">Batal</button> <button class="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-primary shadow-md shadow-primary/20 hover:brightness-110 flex items-center gap-2 transition-all" data-svelte-h="svelte-18p9clc"><span class="material-symbols-outlined text-[18px]">save</span> Simpan Gigi</button></div></div>` : ``}`;
  } while (!$$settled);
  return $$rendered;
});
function parseSurfaces(surfaceStr, toothNum) {
  let s = (surfaceStr || "").toUpperCase().trim();
  if (s === "")
    return ["center"];
  if (["TOP", "BOTTOM", "LEFT", "RIGHT", "CENTER"].includes(s))
    return [s.toLowerCase()];
  const quad = String(toothNum)[0];
  const isUpper = ["1", "2", "5", "6"].includes(quad);
  const isRightSideOfMouth = ["1", "4", "5", "8"].includes(quad);
  let result = [];
  if (s.includes("O") || s.includes("I"))
    result.push("center");
  if (s.includes("M"))
    result.push(isRightSideOfMouth ? "right" : "left");
  if (s.includes("D"))
    result.push(isRightSideOfMouth ? "left" : "right");
  if (s.includes("V") || s.includes("B") || s.includes("F") || s.includes("LA"))
    result.push(isUpper ? "top" : "bottom");
  if (s.includes("P") || s.includes("L") && !s.includes("LA"))
    result.push(isUpper ? "bottom" : "top");
  if (result.length === 0)
    return ["center"];
  return result;
}
async function searchTerminology(term, system) {
  const res = await fetch(`/api/terminologies?term=${encodeURIComponent(term)}&system=${encodeURIComponent(system)}`);
  const data = await res.json();
  return data.results || [];
}
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $page, $$unsubscribe_page;
  let $$unsubscribe_isPatientProfileOpen;
  $$unsubscribe_page = subscribe(page, (value) => $page = value);
  $$unsubscribe_isPatientProfileOpen = subscribe(isPatientProfileOpen, (value) => value);
  let { data } = $$props;
  const encounterId = $page.params.encounterId;
  let encounter = null;
  let odontogram = {
    dentition_type: "Adult",
    occlusi: "",
    torus_palatinus: "Tidak Ada",
    torus_mandibularis: "Tidak Ada",
    palatum: "",
    diastema: "Tidak Ada",
    gigi_anomali: "Tidak Ada",
    details: []
  };
  let availableItems = [];
  let patientHistory = [];
  let doctorsList = [];
  let showToothModal = false;
  let toothDetail = {
    tooth_number: "",
    keadaan: "",
    protesa: "",
    bahan_protesa: "",
    restorations: [],
    diagnoses: [],
    procedures: []
  };
  onDestroy(() => {
    headerTitle.set(null);
    isSidebarHidden.set(false);
  });
  if ($$props.data === void 0 && $$bindings.data && data !== void 0)
    $$bindings.data(data);
  let $$settled;
  let $$rendered;
  let previous_head = $$result.head;
  do {
    $$settled = true;
    $$result.head = previous_head;
    patientHistory.filter((h) => h.encounter?.id !== encounterId);
    [
      { value: "", label: "Select Doctor" },
      ...doctorsList.filter((doc) => doc.doctor_code !== encounter?.doctor_code).map((doc) => ({
        value: doc.doctor_code,
        label: doc.name,
        sublabel: doc.doctor_code,
        meta: {
          profile_image_url: doc.profile_image_url,
          is_doctor: true
        }
      }))
    ];
    [
      { value: "", label: "Pilih Item" },
      ...availableItems.map((ai) => ({
        value: ai.id,
        label: ai.name,
        sublabel: ai.item_group || "Umum",
        meta: {
          icon: "medical_services",
          iconColor: "text-primary"
        }
      }))
    ];
    (odontogram.details || []).reduce(
      (acc, d) => {
        const tn = String(d.tooth_number);
        if (!acc[tn])
          acc[tn] = {};
        let color = "#10B981";
        if (d.keadaan === "car" || d.keadaan === "cav")
          color = "#ffffff";
        else if (d.keadaan === "mis")
          color = "#9CA3AF";
        else if (d.keadaan === "sou")
          color = "#ffffff";
        if (d.keadaan === "mis")
          acc[tn].global = "Missing";
        else if (d.protesa === "prd" || d.protesa === "fld" || d.protesa === "fud")
          acc[tn].global = "Missing";
        else if (d.keadaan === "nvt")
          acc[tn].global = "Non-Vital";
        else if (d.keadaan === "non")
          acc[tn].global = "NON";
        else if (d.keadaan === "une")
          acc[tn].global = "UNE";
        else if (d.keadaan === "pre")
          acc[tn].global = "PRE";
        else if (d.keadaan === "ano")
          acc[tn].global = "ANO";
        else if (d.keadaan === "cfr" || d.keadaan === "frx")
          acc[tn].global = "Fracture";
        else if (d.keadaan === "rrx")
          acc[tn].global = "Sisa Akar";
        if (d.restorations && d.restorations.length > 0) {
          d.restorations.forEach((r) => {
            const mappedData = {
              condition: d.keadaan,
              color,
              restoration: r.restorasi,
              bahan_restorasi: r.bahan_restorasi,
              protesa: d.protesa
            };
            if (r.surfaces && r.surfaces.length > 0) {
              r.surfaces.forEach((s) => {
                const keys = parseSurfaces(s, tn);
                keys.forEach((k) => {
                  if (!acc[tn][k])
                    acc[tn][k] = mappedData;
                });
              });
            } else {
              if (!acc[tn]["center"])
                acc[tn]["center"] = mappedData;
            }
            if (r.restorasi === "rct") {
              acc[tn].global = "RCT";
            } else if (r.restorasi === "pon") {
              acc[tn].global = "Missing";
            }
          });
        } else {
          const mappedData = {
            condition: d.keadaan,
            color,
            restoration: null,
            bahan_restorasi: null,
            protesa: d.protesa
          };
          if (!acc[tn]["center"])
            acc[tn]["center"] = mappedData;
        }
        return acc;
      },
      {}
    );
    $$rendered = `<div>${`<div style="text-align: center; padding: var(--space-16);" data-svelte-h="svelte-2ll8s8"><div class="spinner spinner-lg" style="margin: 0 auto;"></div> <p class="text-muted mt-4">Memuat encounter...</p></div>`}</div>  ${``}  ${validate_component(ToothDetailPanel, "ToothDetailPanel").$$render(
      $$result,
      {
        initialData: toothDetail,
        searchIcd10Fn: (term) => searchTerminology(term, "ICD-10"),
        searchIcd9Fn: (term) => searchTerminology(term, "ICD-9-CM"),
        show: showToothModal
      },
      {
        show: ($$value) => {
          showToothModal = $$value;
          $$settled = false;
        }
      },
      {}
    )}`;
  } while (!$$settled);
  $$unsubscribe_page();
  $$unsubscribe_isPatientProfileOpen();
  return $$rendered;
});

export { Page as default };
//# sourceMappingURL=_page.svelte-76037131.js.map
