import { isAxiosError } from 'axios';

import client from '@/lib/client';

const clampPrice = (value: number) => Math.max(5, Math.min(500, Number(value.toFixed(2))));

const extractPrice = (responseData: any): number | null => {
    const candidates = [
        responseData?.data?.price_ghs,
        responseData?.data?.subscription_price_ghs,
        responseData?.data?.monthly_subscription_price_ghs,
        responseData?.data?.pricing?.monthly_price_ghs,
        responseData?.price_ghs,
        responseData?.subscription_price_ghs,
        responseData?.monthly_subscription_price_ghs,
        responseData?.user?.subscription_price_ghs,
        responseData?.data?.user?.subscription_price_ghs,
        responseData?.data?.user?.profile?.subscription_price_ghs,
    ];

    for (const candidate of candidates) {
        const asNum = Number(candidate);
        if (Number.isFinite(asNum)) return asNum;
    }
    return null;
};

const tryGet = async (url: string) => {
    try {
        const res = await client.get(url);
        return { ok: true as const, data: res.data };
    } catch (error) {
        if (isAxiosError(error) && error.response?.status === 404) {
            return { ok: false as const, notFound: true as const };
        }
        throw error;
    }
};

const tryPatch = async (url: string, payload: Record<string, unknown>) => {
    try {
        const res = await client.patch(url, payload);
        return { ok: true as const, data: res.data };
    } catch (error) {
        if (isAxiosError(error) && error.response?.status === 404) {
            return { ok: false as const, notFound: true as const };
        }
        throw error;
    }
};

const buildMissingEndpointError = () =>
    new Error(
        'Missing backend endpoint for creator subscription pricing. Please add GET/PATCH endpoint for current creator subscription price.'
    );

export const subscriptionPricingService = {
    async getPrice(): Promise<number> {
        const getAttempts = [
            '/creators/me/subscription-price',
            '/creators/me/subscription-price/',
        ];

        for (const endpoint of getAttempts) {
            const result = await tryGet(endpoint);
            if (!result.ok) continue;
            const price = extractPrice(result.data);
            if (price !== null) {
                const normalized = clampPrice(price);
                return normalized;
            }
        }

        throw buildMissingEndpointError();
    },

    async setPrice(priceGhs: number): Promise<number> {
        const next = clampPrice(priceGhs);

        const patchAttempts = [
            '/creators/me/subscription-price',
            '/creators/me/subscription-price/',
        ];

        const payloadVariants = [
            { price_ghs: next },
            { subscription_price_ghs: next },
            { monthly_subscription_price_ghs: next },
        ];

        for (const endpoint of patchAttempts) {
            for (const payload of payloadVariants) {
                const result = await tryPatch(endpoint, payload);
                if (!result.ok) continue;
                const updated = extractPrice(result.data);
                return clampPrice(updated ?? next);
            }
        }

        throw buildMissingEndpointError();
    },
};
