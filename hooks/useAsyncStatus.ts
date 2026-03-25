import React from 'react';

export function useAsyncStatus() {
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    const run = React.useCallback(async <T,>(task: () => Promise<T>): Promise<T | null> => {
        setIsLoading(true);
        setError(null);
        try {
            return await task();
        } catch (err: any) {
            setError(err?.message ?? 'Something went wrong.');
            return null;
        } finally {
            setIsLoading(false);
        }
    }, []);

    return { isLoading, error, setError, run };
}
