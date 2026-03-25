export function toApiErrorMessage(error: any, fallback = 'Something went wrong.') {
    return (
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        error?.message ||
        fallback
    );
}
