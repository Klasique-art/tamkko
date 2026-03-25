import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Dimensions, FlatList, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Screen from '@/components/ui/Screen';
import AppText from '@/components/ui/AppText';
import { onboardingSlides, ONBOARDING_SEEN_KEY } from '@/data/onboarding';

const { width } = Dimensions.get('window');

export default function OnboardingScreen() {
    const [currentIndex, setCurrentIndex] = React.useState(0);
    const listRef = React.useRef<FlatList<(typeof onboardingSlides)[number]>>(null);
    const insets = useSafeAreaInsets();

    const finishOnboarding = async () => {
        await AsyncStorage.setItem(ONBOARDING_SEEN_KEY, 'true');
        router.replace('/(tabs)');
    };

    const handleNext = async () => {
        const isLast = currentIndex === onboardingSlides.length - 1;
        if (isLast) {
            await finishOnboarding();
            return;
        }

        listRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
    };

    return (
        <Screen className="pt-6">
            <View className="flex-1">
                <View className="mb-6 flex-row items-center justify-between">
                    <AppText className="text-xs font-semibold uppercase tracking-[0.2em]" color="#000000">
                        Starter App
                    </AppText>
                    <Pressable onPress={finishOnboarding} className="rounded-full border border-black px-4 py-2">
                        <AppText className="text-sm font-semibold" color="#000000">Skip</AppText>
                    </Pressable>
                </View>

                <FlatList
                    ref={listRef}
                    data={onboardingSlides}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(item) => String(item.id)}
                    onMomentumScrollEnd={(event) => {
                        const nextIndex = Math.round(event.nativeEvent.contentOffset.x / width);
                        setCurrentIndex(nextIndex);
                    }}
                    renderItem={({ item }) => (
                        <View style={{ width: width - 32 }} className="justify-center pr-4">
                            <View className="rounded-3xl border border-black bg-white p-6">
                                <View className="mb-4 h-12 w-12 items-center justify-center rounded-full bg-black">
                                    <Ionicons name={item.icon as never} size={22} color="#FFFFFF" />
                                </View>
                                <AppText className="mb-2 text-3xl font-bold" color="#000000">{item.title}</AppText>
                                <AppText className="mb-4 text-base" color="#000000">{item.description}</AppText>
                                <View className="gap-2">
                                    {item.details.map((detail, idx) => (
                                        <AppText key={`${item.id}-${idx}`} className="text-sm" color="#000000">
                                            {`• ${detail}`}
                                        </AppText>
                                    ))}
                                </View>
                            </View>
                        </View>
                    )}
                />

                <View className="mt-8" style={{ paddingBottom: insets.bottom + 16 }}>
                    <View className="mb-6 flex-row justify-center">
                        {onboardingSlides.map((slide, index) => (
                            <View
                                key={slide.id}
                                className={`mx-1 h-2 rounded-full ${index === currentIndex ? 'w-8 bg-black' : 'w-2 bg-black/30'}`}
                            />
                        ))}
                    </View>

                    <Pressable onPress={handleNext} className="items-center rounded-2xl bg-black px-6 py-4">
                        <AppText className="text-base font-semibold" color="#FFFFFF" disableTranslation>
                            {currentIndex === onboardingSlides.length - 1 ? 'Get Started' : 'Next'}
                        </AppText>
                    </Pressable>
                </View>
            </View>
        </Screen>
    );
}
