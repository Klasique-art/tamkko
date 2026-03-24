import AsyncStorage from '@react-native-async-storage/async-storage';
import { Redirect } from 'expo-router';
import React from 'react';

import { useAuth } from '@/context/AuthContext';
import { ONBOARDING_SEEN_KEY } from '@/data/onboarding';

export default function Index() {
  const { isAuthenticated, isLoading } = useAuth();
  const [hasSeenOnboarding, setHasSeenOnboarding] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    const loadOnboardingState = async () => {
      try {
        const seen = await AsyncStorage.getItem(ONBOARDING_SEEN_KEY);
        setHasSeenOnboarding(seen === 'true');
      } catch {
        setHasSeenOnboarding(false);
      }
    };

    void loadOnboardingState();
  }, []);

  if (isLoading || hasSeenOnboarding === null) return null;

  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  if (!hasSeenOnboarding) {
    return <Redirect href="/onboarding" />;
  }

  return <Redirect href="/(auth)/login" />;
}
