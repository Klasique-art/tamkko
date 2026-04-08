import { useFocusEffect } from '@react-navigation/native';
import { Href, router } from 'expo-router';
import React, { useMemo } from 'react';
import { Pressable, StatusBar, View } from 'react-native';

import VideoSnapFeed from '@/components/feed/VideoSnapFeed';
import AppText from '@/components/ui/AppText';
import Screen from '@/components/ui/Screen';
import { useColors } from '@/config/colors';
import { getFollowedCreators } from '@/data/mock/following';
import { useVideoFeedStore } from '@/lib/stores/videoFeedStore';

const sanitizeHandle = (handle: string) => handle.replace(/^@/, '').trim();

export default function FollowingFeedScreen() {
    const colors = useColors();
    const followingCreators = useMemo(() => getFollowedCreators(), []);
    const videos = useVideoFeedStore((state) => state.videos);

    const followingFeedItems = useMemo(
        () => videos.filter((video) => followingCreators.has(video.creatorUsername)),
        [followingCreators, videos]
    );

    useFocusEffect(
        React.useCallback(() => {
            StatusBar.setBarStyle('light-content', true);
            StatusBar.setBackgroundColor('#000000', true);
        }, [])
    );

    const openCreator = (creatorHandle: string) => {
        const username = sanitizeHandle(creatorHandle);
        router.push(`/video/creator/${encodeURIComponent(username)}` as Href);
    };

    if (followingFeedItems.length === 0) {
        return (
            <Screen title="Following" className="pt-2">
                <View
                    className="rounded-2xl border p-4"
                    style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}
                >
                    <AppText className="text-lg font-bold" color={colors.textPrimary}>
                        No Subscribed Posts Yet
                    </AppText>
                    <AppText className="mt-2 text-sm leading-5" color={colors.textSecondary}>
                        Your Following feed will show one post at a time from creators you follow or subscribe to.
                    </AppText>
                    <Pressable
                        onPress={() => router.push('/video/explore' as Href)}
                        className="mt-4 rounded-xl border py-3"
                        style={{ borderColor: colors.border, backgroundColor: colors.background }}
                        accessibilityRole="button"
                        accessibilityLabel="Open explore feed"
                    >
                        <AppText className="text-center text-sm font-semibold" color={colors.textPrimary}>
                            Discover Creators
                        </AppText>
                    </Pressable>
                </View>
            </Screen>
        );
    }

    return (
        <VideoSnapFeed
            videos={followingFeedItems}
            onCreatorPress={openCreator}
            showTopNav
            navTitle="Following"
        />
    );
}
