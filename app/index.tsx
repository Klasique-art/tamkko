import AsyncStorage from '@react-native-async-storage/async-storage';
import { Redirect } from 'expo-router';
import React from 'react';

import { ONBOARDING_SEEN_KEY } from '@/data/onboarding';

export default function Index() {
    const [hasSeenOnboarding, setHasSeenOnboarding] = React.useState<boolean | null>(null);

    React.useEffect(() => {
        const load = async () => {
            try {
                const seen = await AsyncStorage.getItem(ONBOARDING_SEEN_KEY);
                setHasSeenOnboarding(seen === 'true');
            } catch {
                setHasSeenOnboarding(false);
            }
        };

        void load();
    }, []);

    if (hasSeenOnboarding === null) return null;

    if (!hasSeenOnboarding) {
        return <Redirect href="/onboarding" />;
    }

    return <Redirect href="/(tabs)" />;
}
