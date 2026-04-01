async function wilayahFetch(path) {
    try {
        const res = await fetch(`/api/wilayah?path=${path}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        return json.data ?? [];
    } catch (e) {
        console.error(`wilayahFetch(${path}) failed:`, e);
        return [];
    }
}

export const fetchProvinces = () => wilayahFetch('provinces.json');
export const fetchRegencies = (provinceCode) => wilayahFetch(`regencies/${provinceCode}.json`);
export const fetchDistricts = (regencyCode) => wilayahFetch(`districts/${regencyCode}.json`);
export const fetchVillages = (districtCode) => wilayahFetch(`villages/${districtCode}.json`);