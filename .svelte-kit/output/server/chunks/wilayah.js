import { w as writable } from "./index2.js";
const provinces = writable([]);
const regencies = writable([]);
const districts = writable([]);
const villages = writable([]);
const loadingProvince = writable(false);
const loadingRegency = writable(false);
const loadingDistrict = writable(false);
const loadingVillage = writable(false);
export {
  loadingRegency as a,
  loadingDistrict as b,
  loadingVillage as c,
  districts as d,
  loadingProvince as l,
  provinces as p,
  regencies as r,
  villages as v
};
