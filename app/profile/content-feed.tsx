import * as Haptics from 'expo-haptics';
import { Href, router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Pressable, View } from 'react-native';

import VideoSnapFeed from '@/components/feed/VideoSnapFeed';
import VideoManageActionSheet from '@/components/video/VideoManageActionSheet';
import { AppBottomSheetRef } from '@/components/ui/AppBottomSheet';
import AppText from '@/components/ui/AppText';
import Screen from '@/components/ui/Screen';
import { useColors } from '@/config/colors';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { mockVideoManagementService } from '@/lib/services/mockVideoManagementService';
import { buildProfileVideoCollections, ProfileVideoCollectionTab } from '@/lib/services/profileVideoCollections';
import { useVideoFeedStore } from '@/lib/stores/videoFeedStore';
import { VideoItem } from '@/types/video.types';

const normalizeTab = (value?: string): ProfileVideoCollectionTab => {
    if (value === 'paid') return 'paid';
    if (value === 'bookmarked') return 'bookmarked';
    if (value === 'liked') return 'liked';
    return 'free';
};

export default function ProfileContentFeedScreen() {
    const colors = useColors();
    const { showToast } = useToast();
    const { user } = useAuth();
    const videos = useVideoFeedStore((state) => state.videos);
    const { tab, videoId } = useLocalSearchParams<{ tab?: string; videoId?: string }>();
    const currentTab = normalizeTab(tab);
    const actionSheetRef = React.useRef<AppBottomSheetRef>(null);
    const [selectedVideo, setSelectedVideo] = React.useState<VideoItem | null>(null);

    const collections = React.useMemo(() => buildProfileVideoCollections(videos, user), [user, videos]);
    const activeVideos = collections[currentTab];

    const openManager = React.useCallback(() => {
        router.replace('/profile/content' as Href);
    }, []);

    const handleMorePress = React.useCallback(
        (video: VideoItem) => {
            void Haptics.selectionAsync();
            setSelectedVideo(video);
            requestAnimationFrame(() => actionSheetRef.current?.open());
        },
        []
    );

    const handleEditVideo = React.useCallback((video: VideoItem) => {
        router.push(`/video/edit/${encodeURIComponent(video.id)}` as Href);
    }, []);

    const handleDeleteVideo = React.useCallback(
        async (video: VideoItem) => {
            const deleted = await mockVideoManagementService.deleteVideo(video.id);
            if (deleted) {
                showToast('Video deleted.', { variant: 'success', duration: 1400 });
                if (activeVideos.length <= 1) openManager();
            } else {
                showToast('Could not delete this video.', { variant: 'error' });
            }
            setSelectedVideo(null);
        },
        [activeVideos.length, openManager, showToast]
    );

    if (activeVideos.length === 0) {
        return (
            <Screen title="Manage Feed" className="pt-2">
                <View className="rounded-2xl border p-4" style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}>
                    <AppText className="text-lg font-bold" color={colors.textPrimary}>Nothing to play yet</AppText>
                    <AppText className="mt-2 text-sm" color={colors.textSecondary}>
                        This tab has no videos right now. Go back to switch tabs or upload.
                    </AppText>
                    <Pressable
                        onPress={openManager}
                        className="mt-4 rounded-xl border py-3"
                        style={{ borderColor: colors.border, backgroundColor: colors.background }}
                        accessibilityRole="button"
                        accessibilityLabel="Back to content manager"
                    >
                        <AppText className="text-center text-sm font-semibold" color={colors.textPrimary}>
                            Back To Manager
                        </AppText>
                    </Pressable>
                </View>
            </Screen>
        );
    }

    return (
        <>
            <VideoSnapFeed
                videos={activeVideos}
                showTopNav
                navTitle="Manage Videos"
                initialVideoId={videoId}
                showMoreButton
                onMorePress={handleMorePress}
            />
            <VideoManageActionSheet
                ref={actionSheetRef}
                video={selectedVideo}
                onEdit={handleEditVideo}
                onDelete={handleDeleteVideo}
            />
        </>
    );
}
