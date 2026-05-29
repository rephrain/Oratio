import { w as writable } from "./index2.js";
const isSidebarOpen = writable(true);
const isSidebarHidden = writable(false);
const headerTitle = writable(null);
const isPatientProfileOpen = writable(false);
const isProfileModalOpen = writable(false);
export {
  isSidebarHidden as a,
  isSidebarOpen as b,
  isPatientProfileOpen as c,
  headerTitle as h,
  isProfileModalOpen as i
};
