import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Animated, GestureResponderEvent, Pressable, View } from 'react-native';

import AppText from '@/components/ui/AppText';

type VideoActionRailProps = {
    likesCount: number;
    commentsCount: number;
    sharesCount: number;
    allowComments?: boolean;
    isLiked?: boolean;
    showMoreButton?: boolean;
    onLike?: () => void;
    onComment?: () => void;
    onShare?: () => void;
    onMore?: () => void;
};

const compact = (value: number) =>
    new Intl.NumberFormat('en', {
        notation: 'compact',
        maximumFractionDigits: 1,
    }).format(value);

const ActionButton = ({
    icon,
    label,
    accessibilityLabel,
    accessibilityHint,
    onPress,
    active = false,
}: {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    accessibilityLabel: string;
    accessibilityHint?: string;
    onPress?: () => void;
    active?: boolean;
}) => {
    const scale = React.useRef(new Animated.Value(1)).current;

    React.useEffect(() => {
        Animated.sequence([
            Animated.spring(scale, {
                toValue: active ? 1.18 : 0.92,
                useNativeDriver: true,
                speed: 24,
                bounciness: 8,
            }),
            Animated.spring(scale, {
                toValue: 1,
                useNativeDriver: true,
                speed: 20,
                bounciness: 7,
            }),
        ]).start();
    }, [active, scale]);

    const handlePress = (event: GestureResponderEvent) => {
        event.stopPropagation();
        Animated.sequence([
            Animated.spring(scale, {
                toValue: 1.15,
                useNativeDriver: true,
                speed: 28,
                bounciness: 10,
            }),
            Animated.spring(scale, {
                toValue: 1,
                useNativeDriver: true,
                speed: 22,
                bounciness: 8,
            }),
        ]).start();
        onPress?.();
    };

    return (
        <View className="mb-4 items-center">
            <Animated.View style={{ transform: [{ scale }] }}>
                <Pressable
                    onPress={handlePress}
                    className="h-12 w-12 items-center justify-center rounded-full"
                    style={{ backgroundColor: active ? 'rgba(239,68,68,0.9)' : 'rgba(0,0,0,0.55)' }}
                    accessibilityRole="button"
                    accessibilityLabel={accessibilityLabel}
                    accessibilityHint={accessibilityHint}
                    accessibilityState={{ selected: active, disabled: !onPress }}
                    disabled={!onPress}
                >
                    <Ionicons name={icon} size={24} color="#FFFFFF" />
                </Pressable>
            </Animated.View>
            <AppText className="mt-1 text-[11px] font-semibold" color="#FFFFFF">
                {label}
            </AppText>
        </View>
    );
};

export default function VideoActionRail({
    likesCount,
    commentsCount,
    sharesCount,
    allowComments = true,
    isLiked,
    showMoreButton = false,
    onLike,
    onComment,
    onShare,
    onMore,
}: VideoActionRailProps) {
    return (
        <View className="absolute bottom-28 right-3 items-center">
            <ActionButton
                icon={isLiked ? 'heart' : 'heart-outline'}
                label={compact(likesCount)}
                accessibilityLabel={`${likesCount} likes. ${isLiked ? 'Unlike' : 'Like'} video`}
                accessibilityHint="Double tap to toggle like"
                onPress={onLike}
                active={Boolean(isLiked)}
            />
            <ActionButton
                icon="chatbubble-outline"
                label={allowComments ? compact(commentsCount) : 'Off'}
                accessibilityLabel={
                    allowComments
                        ? `${commentsCount} comments. Open comments`
                        : 'Comments are turned off for this post. Open details'
                }
                accessibilityHint="Double tap to open comments"
                onPress={onComment}
            />
            <ActionButton
                icon="arrow-redo-outline"
                label={compact(sharesCount)}
                accessibilityLabel={`${sharesCount} shares. Share video`}
                accessibilityHint="Double tap to share this video"
                onPress={onShare}
            />
            {showMoreButton ? (
                <ActionButton
                    icon="ellipsis-horizontal"
                    label="More"
                    accessibilityLabel="Open video management options"
                    accessibilityHint="Double tap to open edit and delete actions"
                    onPress={onMore}
                />
            ) : null}
        </View>
    );
}
