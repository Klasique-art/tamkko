import { Ionicons } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import { Href, router } from 'expo-router';
import React from 'react';
import { Pressable, View, useWindowDimensions } from 'react-native';

import VideoGridTile from '@/components/video/VideoGridTile';
import AppText from '@/components/ui/AppText';
import Screen from '@/components/ui/Screen';
import { useColors } from '@/config/colors';
import { useAuth } from '@/context/AuthContext';
import { buildProfileVideoCollections, ProfileVideoCollectionTab } from '@/lib/services/profileVideoCollections';
import { myVideosService } from '@/lib/services/myVideosService';
import { useVideoFeedStore } from '@/lib/stores/videoFeedStore';
import { VideoItem } from '@/types/video.types';

type TabConfig = {
    key: ProfileVideoCollectionTab;
    icon: keyof typeof Ionicons.glyphMap;
    shortLabel: string;
    accessibilityLabel: string;
};

const TABS: TabConfig[] = [
    { key: 'free', icon: 'grid-outline', shortLabel: 'Free', accessibilityLabel: 'Free videos tab' },
    { key: 'paid', icon: 'lock-closed-outline', shortLabel: 'Paid', accessibilityLabel: 'Paid videos tab' },
    { key: 'bookmarked', icon: 'bookmark-outline', shortLabel: 'Saved', accessibilityLabel: 'Bookmarked videos tab' },
    { key: 'liked', icon: 'heart-outline', shortLabel: 'Liked', accessibilityLabel: 'Liked videos tab' },
];

export default function ProfileContentManagerScreen() {
    const colors = useColors();
    const { width } = useWindowDimensions();
    const { user } = useAuth();
    const videos = useVideoFeedStore((state) => state.videos);
    const [activeTab, setActiveTab] = React.useState<ProfileVideoCollectionTab>('free');
    const [myVideos, setMyVideos] = React.useState<VideoItem[]>([]);
    const [myVideosCursor, setMyVideosCursor] = React.useState<string | null>(null);
    const [loadingMyVideos, setLoadingMyVideos] = React.useState(false);
    const [loadingMoreMyVideos, setLoadingMoreMyVideos] = React.useState(false);

    const collections = React.useMemo(() => buildProfileVideoCollections(videos, user), [user, videos]);
    const activeVideos = React.useMemo(() => {
        if (activeTab === 'free' || activeTab === 'paid') return myVideos;
        return collections[activeTab];
    }, [activeTab, collections, myVideos]);

    const loadMyVideos = React.useCallback(async (options?: { append?: boolean }) => {
        const append = Boolean(options?.append);
        const filter = activeTab === 'paid' ? 'paid' : 'free';
        if (append) {
            if (!myVideosCursor || loadingMoreMyVideos) return;
            setLoadingMoreMyVideos(true);
        } else {
            setLoadingMyVideos(true);
        }

        try {
            const response = await myVideosService.listMine({
                filter,
                cursor: append ? myVideosCursor : null,
                limit: 20,
            });
            setMyVideos((current) => (append ? [...current, ...response.items.filter((item) => !current.some((c) => c.id === item.id))] : response.items));
            setMyVideosCursor(response.nextCursor);
        } catch {
            if (!append) setMyVideos([]);
        } finally {
            if (append) setLoadingMoreMyVideos(false);
            else setLoadingMyVideos(false);
        }
    }, [activeTab, loadingMoreMyVideos, myVideosCursor]);

    React.useEffect(() => {
        if (activeTab === 'free' || activeTab === 'paid') {
            void loadMyVideos({ append: false });
        }
    }, [activeTab, loadMyVideos]);

    const horizontalPadding = 16;
    const gap = 10;
    const tileWidth = Math.floor((width - horizontalPadding * 2 - gap) / 2);
    const tileHeight = Math.floor(tileWidth * 1.36);

    const openManagedFeed = React.useCallback(
        (item: VideoItem) => {
            router.push(
                `/profile/content-feed?tab=${encodeURIComponent(activeTab)}&videoId=${encodeURIComponent(item.id)}` as Href
            );
        },
        [activeTab]
    );

    const renderTabButton = (tab: TabConfig) => {
        const isActive = activeTab === tab.key;
        return (
            <Pressable
                key={tab.key}
                onPress={() => setActiveTab(tab.key)}
                className="mr-2 rounded-full border px-3 py-2"
                style={{
                    borderColor: isActive ? colors.primary : colors.border,
                    backgroundColor: isActive ? colors.primary : colors.background,
                }}
                accessibilityRole="tab"
                accessibilityLabel={tab.accessibilityLabel}
                accessibilityState={{ selected: isActive }}
            >
                <View className="flex-row items-center">
                    <Ionicons name={tab.icon} size={15} color={isActive ? colors.white : colors.textPrimary} />
                    <AppText className="ml-1 text-xs font-bold" color={isActive ? colors.white : colors.textPrimary}>
                        {tab.shortLabel}
                    </AppText>
                </View>
            </Pressable>
        );
    };

    return (
        <Screen title="My Videos" className="pt-2">
            <FlashList
                data={activeVideos}
                keyExtractor={(item) => `${activeTab}_${item.id}`}
                numColumns={2}
                showsVerticalScrollIndicator={false}
                removeClippedSubviews
                contentContainerStyle={{ paddingBottom: 120 }}
                onEndReachedThreshold={0.5}
                onEndReached={() => {
                    if (activeTab === 'free' || activeTab === 'paid') {
                        void loadMyVideos({ append: true });
                    }
                }}
                renderItem={({ item, index }) => (
                    <View style={{ marginBottom: 12, marginRight: index % 2 === 0 ? gap : 0 }}>
                        <VideoGridTile
                            item={item}
                            width={tileWidth}
                            height={tileHeight}
                            onPress={() => openManagedFeed(item)}
                            accessibilityLabel={`Open ${item.title} in manage mode`}
                        />
                        <AppText className="mt-2 text-xs font-semibold" color={colors.textPrimary} numberOfLines={1}>
                            {item.caption || item.title}
                        </AppText>
                    </View>
                )}
                ListHeaderComponent={
                    <View>
                        <View className="rounded-3xl border p-4" style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}>
                            <AppText className="text-lg font-black" color={colors.textPrimary}>Content Manager</AppText>
                            <AppText className="mt-1 text-sm" color={colors.textSecondary}>
                                Manage your uploads, paid content, likes, and saved videos in one place.
                            </AppText>
                            <Pressable
                                onPress={() => router.push('/video/upload' as Href)}
                                className="mt-3 rounded-xl border py-3"
                                style={{ borderColor: colors.border, backgroundColor: colors.background }}
                                accessibilityRole="button"
                                accessibilityLabel="Upload a new video"
                            >
                                <AppText className="text-center text-sm font-semibold" color={colors.textPrimary}>Upload New Post</AppText>
                            </Pressable>
                        </View>

                        <View className="mt-4 flex-row" accessibilityRole="tablist">
                            {TABS.map(renderTabButton)}
                        </View>

                        <View className="mb-3 mt-3 flex-row items-center justify-between">
                            <AppText className="text-sm font-bold" color={colors.textPrimary}>
                                {TABS.find((tab) => tab.key === activeTab)?.shortLabel} ({activeVideos.length})
                            </AppText>
                        </View>
                    </View>
                }
                ListEmptyComponent={
                    <View
                        className="rounded-2xl border p-5"
                        style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}
                    >
                        <View className="h-11 w-11 items-center justify-center rounded-full" style={{ backgroundColor: colors.background }}>
                            <Ionicons
                                name={TABS.find((tab) => tab.key === activeTab)?.icon ?? 'videocam-outline'}
                                size={20}
                                color={colors.textSecondary}
                            />
                        </View>
                        <AppText className="mt-3 text-base font-bold" color={colors.textPrimary}>
                            Nothing here yet
                        </AppText>
                        <AppText className="mt-1 text-sm" color={colors.textSecondary}>
                            {activeTab === 'free' || activeTab === 'paid'
                                ? 'No uploaded posts found for this filter yet.'
                                : 'This tab will populate as you engage with videos.'}
                        </AppText>
                    </View>
                }
                ListFooterComponent={
                    activeTab === 'free' || activeTab === 'paid' ? (
                        loadingMyVideos || loadingMoreMyVideos ? (
                            <View className="py-4">
                                <AppText className="text-center text-xs" color={colors.textSecondary}>
                                    Loading posts...
                                </AppText>
                            </View>
                        ) : null
                    ) : null
                }
            />
        </Screen>
    );
}
