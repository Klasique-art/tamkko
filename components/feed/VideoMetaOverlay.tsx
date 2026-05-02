import React from 'react';
import { Pressable, View } from 'react-native';

import AppText from '@/components/ui/AppText';

type VideoMetaOverlayProps = {
    creatorHandle: string;
    caption?: string;
    isFollowing?: boolean;
    showCreatorInfo?: boolean;
    showFollowButton?: boolean;
    showTipButton?: boolean;
    onCreatorPress?: () => void;
    onFollowPress?: () => void;
    onTipPress?: () => void;
};

export default function VideoMetaOverlay({
    creatorHandle,
    caption,
    isFollowing = false,
    showCreatorInfo = true,
    showFollowButton = true,
    showTipButton = true,
    onCreatorPress,
    onFollowPress,
    onTipPress,
}: VideoMetaOverlayProps) {
    return (
        <View className="absolute bottom-6 left-4 right-20">
            {showCreatorInfo || showFollowButton ? (
                <View className="flex-row items-center">
                    {showCreatorInfo ? (
                        <Pressable
                            onPress={onCreatorPress}
                            accessibilityRole="button"
                            accessibilityLabel={`Open ${creatorHandle} profile`}
                            accessibilityHint="Double tap to view creator page"
                            accessibilityState={{ disabled: !onCreatorPress }}
                            disabled={!onCreatorPress}
                        >
                            <AppText className="text-base font-bold" color="#FFFFFF">{creatorHandle}</AppText>
                        </Pressable>
                    ) : null}

                    {showFollowButton ? (
                        <Pressable
                            onPress={onFollowPress}
                            className="ml-3 rounded-full px-3 py-1.5"
                            style={{ backgroundColor: isFollowing ? 'rgba(16,185,129,0.92)' : 'rgba(255,255,255,0.95)' }}
                            accessibilityRole="button"
                            accessibilityLabel={isFollowing ? `Following ${creatorHandle}` : `Follow ${creatorHandle}`}
                            accessibilityHint={isFollowing ? 'Double tap to unfollow creator' : 'Double tap to follow creator'}
                            accessibilityState={{ selected: isFollowing, disabled: !onFollowPress }}
                            disabled={!onFollowPress}
                        >
                            <AppText className="text-[11px] font-bold" color={isFollowing ? '#FFFFFF' : '#111111'}>
                                {isFollowing ? 'Following' : 'Follow'}
                            </AppText>
                        </Pressable>
                    ) : null}
                </View>
            ) : null}

            <AppText className="mt-2 text-sm" color="#FFFFFF" numberOfLines={2}>
                {caption || 'No caption provided yet.'}
            </AppText>

            {showTipButton ? (
                <Pressable
                    onPress={onTipPress}
                    className="mt-4 self-start rounded-full px-4 py-2"
                    style={{ backgroundColor: 'rgba(255,255,255,0.92)' }}
                    accessibilityRole="button"
                    accessibilityLabel={`Tip ${creatorHandle}`}
                    accessibilityHint="Double tap to send a tip to this creator"
                    accessibilityState={{ disabled: !onTipPress }}
                    disabled={!onTipPress}
                >
                    <AppText className="text-xs font-bold" color="#000000">Tip Creator</AppText>
                </Pressable>
            ) : null}
        </View>
    );
}
