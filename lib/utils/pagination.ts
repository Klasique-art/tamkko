export function getNextPageUrl(currentUrl: string, nextCursor?: string | null) {
    if (!nextCursor) return null;
    return `${currentUrl}${currentUrl.includes('?') ? '&' : '?'}cursor=${encodeURIComponent(nextCursor)}`;
}
