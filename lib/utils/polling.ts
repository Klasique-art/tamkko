export async function pollUntil<T>(
    task: () => Promise<T>,
    condition: (result: T) => boolean,
    intervalMs = 3000,
    timeoutMs = 120000
): Promise<T> {
    const start = Date.now();

    while (true) {
        const result = await task();
        if (condition(result)) return result;

        if (Date.now() - start >= timeoutMs) {
            throw new Error('Polling timed out.');
        }

        await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }
}
