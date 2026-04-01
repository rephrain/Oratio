import { json } from '@sveltejs/kit';

export function GET() {
    const now = new Date();
    return json({
        serverTime: now.toISOString(),
        localTime: now.toString(),
        offset: now.getTimezoneOffset(),
        tzEnv: process.env.TZ
    });
}
