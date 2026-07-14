import { c as create_ssr_component, o as onDestroy, f as escape, v as validate_component, g as add_attribute } from './ssr-4a5a9ccc.js';
import { R as RichSelect } from './RichSelect-b89df93a.js';
import { Q as QUEUE_COLUMNS } from './constants-7804d9c5.js';
import { b as getJakartaDateString } from './formatters-ab7a5011.js';

const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let filteredTableEncounters;
  let waitingCount;
  let inProgressCount;
  let completedCount;
  let encounters = [];
  let filterDate = getJakartaDateString();
  let filterDoctor = "";
  let doctorOptions = [];
  onDestroy(() => {
  });
  let $$settled;
  let $$rendered;
  let previous_head = $$result.head;
  do {
    $$settled = true;
    $$result.head = previous_head;
    filteredTableEncounters = encounters.filter((e) => {
      return true;
    });
    [...filteredTableEncounters].sort((a, b) => {
      return 0;
    });
    waitingCount = encounters.filter((e) => ["Planned", "Arrived"].includes(e.encounter?.status)).length;
    inProgressCount = encounters.filter((e) => ["In Progress", "On Hold"].includes(e.encounter?.status)).length;
    encounters.filter((e) => e.encounter?.status === "Discharged").length;
    completedCount = encounters.filter((e) => e.encounter?.status === "Completed").length;
    QUEUE_COLUMNS.map((col) => ({
      ...col,
      items: encounters.filter((e) => col.statuses.includes(e.encounter?.status))
    }));
    $$rendered = `<div class="h-full flex flex-col"> <div class="flex gap-4 mb-8 shrink-0"><div class="flex-1 min-w-[200px] bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4"><div class="size-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center" data-svelte-h="svelte-vze8fv"><span class="material-symbols-outlined">hourglass_empty</span></div> <div><p class="text-2xl font-bold text-slate-900">${escape(waitingCount)}</p> <p class="text-xs font-medium text-slate-500 uppercase tracking-wide" data-svelte-h="svelte-tiyhxc">Waiting</p></div></div> <div class="flex-1 min-w-[200px] bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4"><div class="size-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center" data-svelte-h="svelte-hbuq94"><span class="material-symbols-outlined">vital_signs</span></div> <div><p class="text-2xl font-bold text-slate-900">${escape(inProgressCount)}</p> <p class="text-xs font-medium text-slate-500 uppercase tracking-wide" data-svelte-h="svelte-16fpaq3">In Progress</p></div></div> <div class="flex-1 min-w-[200px] bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4"><div class="size-12 rounded-full bg-primary/10 text-primary flex items-center justify-center" data-svelte-h="svelte-196f3h"><span class="material-symbols-outlined">task_alt</span></div> <div><p class="text-2xl font-bold text-slate-900">${escape(completedCount)}</p> <p class="text-xs font-medium text-slate-500 uppercase tracking-wide" data-svelte-h="svelte-1f5un39">Completed Today</p></div></div> <div class="flex-1 min-w-[200px] bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4"><div class="size-12 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center" data-svelte-h="svelte-17y1dwr"><span class="material-symbols-outlined">event</span></div> <div><p class="text-2xl font-bold text-slate-900">${escape(encounters.length)}</p> <p class="text-xs font-medium text-slate-500 uppercase tracking-wide" data-svelte-h="svelte-1r1d0bd">Total Appointments</p></div></div></div>  <div class="flex items-center justify-between mb-6 shrink-0"><div data-svelte-h="svelte-b3js33"><h2 class="text-xl font-bold text-slate-900">Queue Management</h2> <p class="text-sm text-slate-500">Manage real-time patient status and flow</p></div> <div class="flex items-center gap-4"><div class="w-64">${validate_component(RichSelect, "RichSelect").$$render(
      $$result,
      {
        placeholder: "All Doctors",
        options: doctorOptions,
        value: filterDoctor
      },
      {
        value: ($$value) => {
          filterDoctor = $$value;
          $$settled = false;
        }
      },
      {}
    )}</div> <input type="date" class="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary/20 outline-none h-[42px]"${add_attribute("value", filterDate, 0)}> <div class="bg-white p-1 rounded-lg border border-slate-200 flex"><button class="${"px-4 py-2 " + escape(
      "bg-primary text-white shadow-sm",
      true
    ) + " rounded-lg text-sm font-medium flex items-center gap-2 transition-all"}"><span class="material-symbols-outlined text-sm" data-svelte-h="svelte-5pmu2p">view_kanban</span>
					Queue Board</button> <button class="${"px-4 py-2 " + escape(
      "text-slate-500 hover:text-slate-700",
      true
    ) + " rounded-lg text-sm font-medium flex items-center gap-2 transition-all"}"><span class="material-symbols-outlined text-sm" data-svelte-h="svelte-e839aa">format_list_bulleted</span>
					Appointment List</button></div></div></div> ${`<div class="flex-1 flex flex-col items-center justify-center text-slate-400" data-svelte-h="svelte-19tk92h"><span class="material-symbols-outlined text-4xl animate-spin mb-2" style="animation: spin 1s linear infinite;">refresh</span> <p>Memuat antrian...</p></div>`} </div>`;
  } while (!$$settled);
  return $$rendered;
});

export { Page as default };
//# sourceMappingURL=_page.svelte-03659f82.js.map
