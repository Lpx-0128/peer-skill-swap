export function extractSwapMediaPath(url: string): string | null {
    try {
        const marker = '/swap-media/';
        const idx = url.indexOf(marker);
        return idx !== -1 ? url.substring(idx + marker.length) : null;
    } catch {
        return null;
    }
}
