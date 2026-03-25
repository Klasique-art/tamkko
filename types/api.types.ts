export type ApiErrorResponse = {
    status?: number;
    code?: string;
    message: string;
    details?: unknown;
};

export type PaginatedResponse<T> = {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
};

export type ApiSuccessResponse<T> = {
    success: boolean;
    data: T;
    message?: string;
};
