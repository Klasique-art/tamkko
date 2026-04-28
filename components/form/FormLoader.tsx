import React from 'react';
import { View } from 'react-native';
import Animated, {
    Easing,
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
} from 'react-native-reanimated';

import { useColors } from '@/config/colors';
import AppText from '@/components/ui/AppText';

interface FormLoaderProps {
    visible: boolean;
    message?: string;
}

const FormLoader = ({ visible, message = 'Processing...' }: FormLoaderProps) => {
    const colors = useColors();

    const ringA = useSharedValue(0);
    const ringB = useSharedValue(0);
    const corePulse = useSharedValue(0);
    const glowPulse = useSharedValue(0);
    const textPulse = useSharedValue(0);

    React.useEffect(() => {
        if (!visible) return;

        ringA.value = 0;
        ringB.value = 0;
        corePulse.value = 0;
        glowPulse.value = 0;
        textPulse.value = 0;

        ringA.value = withRepeat(withTiming(360, { duration: 1600, easing: Easing.linear }), -1, false);
        ringB.value = withRepeat(withTiming(-360, { duration: 2400, easing: Easing.linear }), -1, false);
        corePulse.value = withRepeat(withTiming(1, { duration: 900, easing: Easing.inOut(Easing.quad) }), -1, true);
        glowPulse.value = withRepeat(withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.quad) }), -1, true);
        textPulse.value = withRepeat(withTiming(1, { duration: 1100, easing: Easing.inOut(Easing.quad) }), -1, true);
    }, [visible, corePulse, glowPulse, ringA, ringB, textPulse]);

    const ringAStyle = useAnimatedStyle(() => ({
        transform: [{ rotate: `${ringA.value}deg` }],
    }));

    const ringBStyle = useAnimatedStyle(() => ({
        transform: [{ rotate: `${ringB.value}deg` }],
    }));

    const coreStyle = useAnimatedStyle(() => ({
        transform: [{ scale: interpolate(corePulse.value, [0, 1], [0.88, 1.08]) }],
    }));

    const glowStyle = useAnimatedStyle(() => ({
        opacity: interpolate(glowPulse.value, [0, 1], [0.24, 0.58]),
        transform: [{ scale: interpolate(glowPulse.value, [0, 1], [0.9, 1.12]) }],
    }));

    const textStyle = useAnimatedStyle(() => ({
        opacity: interpolate(textPulse.value, [0, 1], [0.62, 1]),
    }));

    if (!visible) return null;

    return (
        <View
            className="absolute inset-0 items-center justify-center"
            style={{ backgroundColor: 'rgba(3, 7, 18, 0.66)', zIndex: 30 }}
            pointerEvents="auto"
            onStartShouldSetResponder={() => true}
            accessible
            accessibilityRole="progressbar"
            accessibilityLabel={`${message}. Please wait.`}
            accessibilityLiveRegion="polite"
            accessibilityViewIsModal
        >
            <View
                className="mx-4 w-full max-w-[340px] items-center rounded-3xl border p-8"
                style={{
                    backgroundColor: `${colors.background}EE`,
                    borderColor: `${colors.accent}55`,
                }}
            >
                <View className="mb-5 h-24 w-24 items-center justify-center" accessible={false} importantForAccessibility="no">
                    <Animated.View
                        className="absolute h-24 w-24 rounded-full"
                        style={[glowStyle, { backgroundColor: `${colors.accent}33` }]}
                    />

                    <Animated.View
                        className="absolute h-24 w-24 rounded-full"
                        style={[
                            ringAStyle,
                            {
                                borderWidth: 3,
                                borderColor: `${colors.accent}22`,
                                borderTopColor: colors.accent,
                                borderLeftColor: `${colors.accent}AA`,
                            },
                        ]}
                    />

                    <Animated.View
                        className="absolute h-16 w-16 rounded-full"
                        style={[
                            ringBStyle,
                            {
                                borderWidth: 3,
                                borderColor: `${colors.accent}2A`,
                                borderBottomColor: colors.accent,
                                borderRightColor: `${colors.accent}AA`,
                            },
                        ]}
                    />

                    <Animated.View
                        className="h-6 w-6 rounded-full"
                        style={[coreStyle, { backgroundColor: colors.accent }]}
                    />
                </View>

                <Animated.View style={textStyle} className="items-center">
                    <AppText className="text-center text-xl font-nunbold" style={{ color: colors.textPrimary }}>
                        {message}
                    </AppText>
                    <AppText className="mt-1 text-center text-xs font-nunmedium" style={{ color: colors.textSecondary }}>
                        Syncing your account securely...
                    </AppText>
                </Animated.View>
            </View>
        </View>
    );
};

export default FormLoader;

