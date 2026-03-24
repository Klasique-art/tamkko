import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useMemo, useRef, useState } from 'react';
import { Dimensions, Pressable, StatusBar, View } from 'react-native';
import Animated, {
    Extrapolation,
    interpolate,
    interpolateColor,
    SharedValue,
    useAnimatedScrollHandler,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming
} from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import AppText from '@/components/ui/AppText';
import { onboardingSlides, ONBOARDING_SEEN_KEY } from '@/data/onboarding';

const { width } = Dimensions.get('window');

const BackgroundLayer = ({
    index,
    colors,
    scrollX,
}: {
    index: number;
    colors: [string, string];
    scrollX: SharedValue<number>;
}) => {
    const style = useAnimatedStyle(() => {
        const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
        return {
            opacity: interpolate(scrollX.value, inputRange, [0, 1, 0], Extrapolation.CLAMP),
        };
    });

    return (
        <Animated.View style={[{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }, style]}>
            <LinearGradient
                colors={colors}
                start={{ x: 0.1, y: 0 }}
                end={{ x: 0.9, y: 1 }}
                style={{ flex: 1 }}
            />
        </Animated.View>
    );
};

const ProgressDot = ({ index, scrollX }: { index: number; scrollX: SharedValue<number> }) => {
    const dotStyle = useAnimatedStyle(() => {
        const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
        return {
            width: interpolate(scrollX.value, inputRange, [8, 22, 8], Extrapolation.CLAMP),
            opacity: interpolate(scrollX.value, inputRange, [0.35, 1, 0.35], Extrapolation.CLAMP),
        };
    });

    return <Animated.View style={dotStyle} className="mx-1 h-2 rounded-full bg-white" />;
};

const OnboardingScreen = () => {
    const insets = useSafeAreaInsets();
    const [currentIndex, setCurrentIndex] = useState(0);
    const flatListRef = useRef<Animated.FlatList<any>>(null);
    const scrollX = useSharedValue(0);
    const floatY = useSharedValue(0);

    React.useEffect(() => {
        floatY.value = withRepeat(withTiming(1, { duration: 4200 }), -1, true);
    }, [floatY]);

    const onScroll = useAnimatedScrollHandler({
        onScroll: (event) => {
            scrollX.value = event.contentOffset.x;
        },
    });

    const backgroundLayers = useMemo(() => onboardingSlides, []);

    const handleNext = async () => {
        const isLast = currentIndex === onboardingSlides.length - 1;
        if (isLast) {
            await AsyncStorage.setItem(ONBOARDING_SEEN_KEY, 'true');
            router.replace('/(auth)/login');
            return;
        }

        flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
    };

    const handleSkip = async () => {
        await AsyncStorage.setItem(ONBOARDING_SEEN_KEY, 'true');
        router.replace('/(auth)/login');
    };

    const nextButtonStyle = useAnimatedStyle(() => {
        const inputRange = onboardingSlides.map((_, index) => index * width);
        const startColors = ['#6E1A1D', '#F38218', '#1F3D8F', '#1A760D'];
        const endColors = ['#3D0C10', '#C96800', '#040F40', '#0F4F08'];

        const bgStart = interpolateColor(scrollX.value, inputRange, startColors);
        const bgEnd = interpolateColor(scrollX.value, inputRange, endColors);

        return {
            // Use two layered tones to mimic a live-shifting gradient feel.
            backgroundColor: bgStart,
            shadowColor: bgEnd,
        };
    });

    const FloatingGlow = () => {
        const style = useAnimatedStyle(() => ({
            transform: [{ translateY: interpolate(floatY.value, [0, 1], [0, -14]) }],
            opacity: interpolate(floatY.value, [0, 1], [0.22, 0.35]),
        }));

        return (
            <Animated.View
                style={style}
                className="absolute left-1/2 top-14 h-56 w-56 -translate-x-1/2 rounded-full bg-white/20"
            />
        );
    };

    const SlideCard = ({ item, index }: { item: any; index: number }) => {
        const iconStyle = useAnimatedStyle(() => {
            const position = scrollX.value / width;
            const distance = Math.abs(position - index);

            return {
                transform: [
                    { scale: interpolate(distance, [0, 1], [1, 0.9], Extrapolation.CLAMP) },
                    { translateY: interpolate(distance, [0, 1], [0, 16], Extrapolation.CLAMP) },
                ],
                opacity: interpolate(distance, [0, 1], [1, 0.35], Extrapolation.CLAMP),
            };
        });

        const textStyle = useAnimatedStyle(() => {
            const position = scrollX.value / width;
            const distance = Math.abs(position - index);
            return {
                transform: [{ translateY: interpolate(distance, [0, 1], [0, 20], Extrapolation.CLAMP) }],
                opacity: interpolate(distance, [0, 1], [1, 0.15], Extrapolation.CLAMP),
            };
        });

        return (
            <View style={{ width }} className="flex-1 justify-center px-7 pb-2">
                <View
                    className="mt-8 rounded-[28px] bg-black/20 px-8 py-8"
                    style={{
                        borderWidth: 1,
                        borderColor: 'rgba(255,255,255,0.12)',
                        shadowColor: '#000000',
                        shadowOpacity: 0.16,
                        shadowRadius: 16,
                        shadowOffset: { width: 0, height: 10 },
                        elevation: 6,
                    }}
                >
                    <Animated.View style={iconStyle} className="mb-6 self-center">
                        <View className="h-24 w-24 items-center justify-center rounded-full bg-white/18">
                            <Ionicons name={item.icon} size={40} color="#FFFFFF" />
                        </View>
                    </Animated.View>

                    <Animated.View style={textStyle}>
                        <AppText color="#FFFFFF" className="mb-2 text-center text-[30px] font-bold leading-10">
                            {item.title}
                        </AppText>
                        <AppText color="rgba(255,255,255,0.92)" className="mb-5 text-center text-[16px] leading-7">
                            {item.description}
                        </AppText>

                        <View className="gap-2 p-2">
                            {item.details?.map((detail: string, idx: number) => (
                                <View key={`${item.id}-detail-${idx}`} className="flex-row items-start">
                                    <Ionicons
                                        name="checkmark-circle"
                                        size={14}
                                        color="rgba(255,255,255,0.9)"
                                        style={{ marginTop: 3, marginRight: 8 }}
                                    />
                                    <AppText color="rgba(255,255,255,0.9)" className="flex-1 text-[14px] leading-6">
                                        {detail}
                                    </AppText>
                                </View>
                            ))}
                        </View>
                    </Animated.View>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView edges={['left', 'right', 'bottom']} style={{ flex: 1, backgroundColor: '#180C0D' }}>
            <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

            <View className="flex-1">
                {backgroundLayers.map((layer, index) => (
                    <BackgroundLayer key={layer.id} index={index} colors={layer.colors} scrollX={scrollX} />
                ))}
                <View className="absolute inset-0 bg-black/22" pointerEvents="none" />

                <FloatingGlow />

                <View className="px-6" style={{ paddingTop: insets.top + 8 }}>
                    <View className="flex-row items-center justify-between">
                        <AppText color="rgba(255,255,255,0.85)" className="text-xs font-bold tracking-[0.2em]">THE FOURTH BOOK</AppText>
                        <Pressable
                            onPress={handleSkip}
                            className="rounded-full bg-white/22 px-4 py-2"
                            style={{
                                shadowColor: '#000000',
                                shadowOpacity: 0.18,
                                shadowRadius: 7,
                                shadowOffset: { width: 0, height: 3 },
                                elevation: 5,
                            }}
                        >
                            <AppText color="#FFFFFF" className="text-xs font-semibold">Skip</AppText>
                        </Pressable>
                    </View>
                </View>

                <Animated.FlatList
                    ref={flatListRef}
                    data={onboardingSlides}
                    keyExtractor={(item) => String(item.id)}
                    horizontal
                    pagingEnabled
                    style={{ flex: 1 }}
                    showsHorizontalScrollIndicator={false}
                    onScroll={onScroll}
                    scrollEventThrottle={16}
                    onMomentumScrollEnd={(event) => {
                        const nextIndex = Math.round(event.nativeEvent.contentOffset.x / width);
                        setCurrentIndex(nextIndex);
                    }}
                    renderItem={({ item, index }) => <SlideCard item={item} index={index} />}
                />

                <View className="px-7 pb-7">
                    <View className="mb-6 flex-row items-center justify-center">
                        {onboardingSlides.map((_, index) => (
                            <ProgressDot key={index} index={index} scrollX={scrollX} />
                        ))}
                    </View>

                    <Pressable
                        onPress={handleNext}
                        className="overflow-hidden rounded-full"
                        style={{
                            shadowColor: '#000000',
                            shadowOpacity: 0.30,
                            shadowRadius: 14,
                            shadowOffset: { width: 0, height: 9 },
                            elevation: 12,
                        }}
                    >
                        <Animated.View
                            style={nextButtonStyle}
                            className="rounded-full px-6 py-4"
                        >
                            <LinearGradient
                                colors={['rgba(255,255,255,0.16)', 'rgba(255,255,255,0.00)']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                className="absolute inset-0 rounded-full"
                            />
                            <View className="flex-row items-center justify-center">
                                <AppText color="#FFFFFF" className="mr-2 text-base font-bold">
                                    {currentIndex === onboardingSlides.length - 1 ? 'Get Started' : 'Next'}
                                </AppText>
                                <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
                            </View>
                        </Animated.View>
                    </Pressable>
                </View>
            </View>
        </SafeAreaView>
    );
};

export default OnboardingScreen;
