import { c as create_ssr_component, v as validate_component, f as add_attribute } from "../../../../chunks/ssr.js";
import { b as getJakartaDateString, c as getJakartaMonthString } from "../../../../chunks/formatters.js";
import { R as RichSelect } from "../../../../chunks/RichSelect.js";
import { E as ENCOUNTER_STATUSES } from "../../../../chunks/constants.js";
let itemsPerPage = 10;
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let statusOptions;
  let doctorOptions;
  let filteredTableEncounters;
  let sortedTableEncounters;
  let { data } = $$props;
  let encounters = [];
  let filterDate = getJakartaDateString();
  let filterMonth = getJakartaMonthString();
  let filterType = "date";
  let tableStatusFilter = "";
  let tableDoctorFilter = "";
  let doctors = [];
  let searchQuery = "";
  const filterTypeOptions = [
    { value: "all", label: "All Records" },
    { value: "date", label: "Daily View" },
    { value: "month", label: "Monthly View" }
  ];
  let currentPage = 1;
  if ($$props.data === void 0 && $$bindings.data && data !== void 0)
    $$bindings.data(data);
  let $$settled;
  let $$rendered;
  let previous_head = $$result.head;
  do {
    $$settled = true;
    $$result.head = previous_head;
    data?.user;
    statusOptions = [
      { value: "", label: "All Status" },
      ...ENCOUNTER_STATUSES.map((s) => ({ value: s, label: s }))
    ];
    doctorOptions = [
      { value: "all", label: "All Doctors" },
      ...doctors.map((d) => ({
        value: d.id,
        label: `Dr. ${d.name}`,
        sublabel: d.doctor_code || "General Dentist",
        meta: {
          profile_image_url: d.profile_image_url,
          is_doctor: true
        }
      }))
    ];
    filteredTableEncounters = encounters.filter((e) => {
      return true;
    });
    {
      {
        if (filteredTableEncounters.length >= 0)
          currentPage = 1;
      }
    }
    sortedTableEncounters = [...filteredTableEncounters].sort((a, b) => {
      return 0;
    });
    Math.ceil(sortedTableEncounters.length / itemsPerPage);
    sortedTableEncounters.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    $$rendered = `${$$result.head += `<!-- HEAD_svelte-a5jv8f_START -->${$$result.title = `<title>Encounter History — Oratio Clinic</title>`, ""}<!-- HEAD_svelte-a5jv8f_END -->`, ""} <div class="-m-6 flex h-[calc(100vh-73px)] bg-slate-50 overflow-hidden font-sans relative"><div class="flex-1 flex flex-col min-h-0 p-6"><div class="flex items-center justify-between mb-6 shrink-0" data-svelte-h="svelte-jtfk6s"><div><h2 class="text-xl font-bold text-rose-900">Encounter History</h2> <p class="text-sm text-slate-500">View and filter previous patient visits</p></div></div>  <div class="bg-white p-4 rounded-t-xl border-x border-t border-slate-200 flex flex-wrap items-center gap-4 shrink-0 shadow-sm"><div class="flex items-center gap-2"><div class="w-40">${validate_component(RichSelect, "RichSelect").$$render(
      $$result,
      {
        options: filterTypeOptions,
        value: filterType
      },
      {
        value: ($$value) => {
          filterType = $$value;
          $$settled = false;
        }
      },
      {}
    )}</div> ${filterType === "date" ? `<input type="date" class="text-sm py-1.5 px-3 border border-slate-200 rounded-md bg-white focus:ring-primary focus:border-primary outline-none"${add_attribute("value", filterDate, 0)}>` : `${filterType === "month" ? `<input type="month" class="text-sm py-1.5 px-3 border border-slate-200 rounded-md bg-white focus:ring-primary focus:border-primary outline-none"${add_attribute("value", filterMonth, 0)}>` : ``}`}</div> <div class="flex items-center gap-2"><input type="text" placeholder="Search by name or ID..." class="text-sm py-1.5 px-3 border border-slate-200 rounded-md bg-white focus:ring-primary focus:border-primary outline-none w-64"${add_attribute("value", searchQuery, 0)}></div> <div class="flex items-center gap-2"><label class="text-xs font-bold text-slate-500 uppercase tracking-wider ml-2" data-svelte-h="svelte-fu3q9y">Doctor:</label> <div class="w-64">${validate_component(RichSelect, "RichSelect").$$render(
      $$result,
      {
        options: doctorOptions,
        placeholder: "Select Doctor",
        value: tableDoctorFilter
      },
      {
        value: ($$value) => {
          tableDoctorFilter = $$value;
          $$settled = false;
        }
      },
      {}
    )}</div></div> <div class="flex items-center gap-2"><label class="text-xs font-bold text-slate-500 uppercase tracking-wider" data-svelte-h="svelte-1nevxfd">Status:</label> <div class="w-44">${validate_component(RichSelect, "RichSelect").$$render(
      $$result,
      {
        options: statusOptions,
        placeholder: "Filter Status",
        value: tableStatusFilter
      },
      {
        value: ($$value) => {
          tableStatusFilter = $$value;
          $$settled = false;
        }
      },
      {}
    )}</div></div> <div class="ml-auto"><button class="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-primary bg-primary/10 hover:bg-primary/20 rounded-md transition-colors disabled:opacity-50" ${encounters.length === 0 ? "disabled" : ""}><span class="material-symbols-outlined text-sm" data-svelte-h="svelte-4msrjl">download</span>
					Export Data</button></div></div>  <div class="bg-white rounded-b-xl border border-slate-200 shadow-sm overflow-hidden flex-1 flex flex-col">${`<div class="flex-1 flex flex-col items-center justify-center text-slate-400" data-svelte-h="svelte-bioo2q"><span class="material-symbols-outlined text-4xl animate-spin mb-2" style="animation: spin 1s linear infinite;">refresh</span> <p>Memuat data...</p></div>`}</div></div></div>`;
  } while (!$$settled);
  return $$rendered;
});
export {
  Page as default
};
