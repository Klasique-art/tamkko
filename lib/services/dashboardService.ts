import client from '@/lib/client';
import { DashboardOverviewData, DashboardOverviewResponse } from '@/types/dashboard.types';

export const dashboardService = {
    async getOverview(): Promise<DashboardOverviewData> {
        const response = await client.get<DashboardOverviewResponse | DashboardOverviewData>('/dashboard/overview/');
        const payload = response.data as DashboardOverviewResponse;
        return payload?.data ?? (response.data as DashboardOverviewData);
    },
};
