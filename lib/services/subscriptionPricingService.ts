import AsyncStorage from '@react-native-async-storage/async-storage';

import { mockCreatorProfiles } from '@/data/mock/creators';

const STORAGE_KEY = '@tamkko_subscription_prices_v1';

type PriceMap = Record<string, number>;

let cache: PriceMap | null = null;

const normalizeUsername = (username: string) => username.replace(/^@/, '').trim().toLowerCase();

const seedMap = (): PriceMap =>
    Object.fromEntries(
        mockCreatorProfiles.map((profile) => [normalizeUsername(profile.username), profile.monthlySubscriptionPriceGhs])
    );

const clampPrice = (value: number) => Math.max(5, Math.min(500, Number(value.toFixed(2))));

const readStorage = async (): Promise<PriceMap> => {
    if (cache) return cache;
    try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
            const parsed = JSON.parse(raw) as PriceMap;
            cache = { ...seedMap(), ...parsed };
            return cache;
        }
    } catch {}
    cache = seedMap();
    return cache;
};

const writeStorage = async (value: PriceMap) => {
    cache = value;
    try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    } catch {}
};

export const subscriptionPricingService = {
    async getPrice(username: string): Promise<number> {
        const map = await readStorage();
        return map[normalizeUsername(username)] ?? 20;
    },

    async setPrice(username: string, priceGhs: number): Promise<number> {
        const map = await readStorage();
        const normalized = normalizeUsername(username);
        const next = clampPrice(priceGhs);
        await writeStorage({ ...map, [normalized]: next });
        return next;
    },

    async applyPriceOverrides() {
        const map = await readStorage();
        return map;
    },
};
