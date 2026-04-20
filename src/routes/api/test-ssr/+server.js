import OdontogramChart from '$lib/components/Odontogram/OdontogramChart.svelte';
import { json } from '@sveltejs/kit';

export function GET() {
    try {
        const { html, css } = OdontogramChart.render({ odontogramData: {} });
        return json({ html, css: css.code });
    } catch (e) {
        return json({ error: e.message, stack: e.stack }, { status: 500 });
    }
}
