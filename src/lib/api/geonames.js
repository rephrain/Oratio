export async function searchPlaces(query) {
    if (!query || query.length < 2) return [];
    try {
        const res = await fetch(`/api/geonames?q=${encodeURIComponent(query)}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        return json.geonames ?? [];
    } catch (e) {
        console.error('searchPlaces failed:', e);
        return [];
    }
}