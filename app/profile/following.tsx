import { Ionicons } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import { Href, router } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Image, Pressable, RefreshControl, TextInput, View } from 'react-native';

import AppText from '@/components/ui/AppText';
import Screen from '@/components/ui/Screen';
import { useColors } from '@/config/colors';
import { useToast } from '@/context/ToastContext';
import { FollowingListItem, followingService } from '@/lib/services/followingService';

const compact = (value: number) =>
    new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(value);

const formatFollowedSince = (isoDate: string) =>
    new Date(isoDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

export default function FollowingScreen() {
    const colors = useColors();
    const { showToast } = useToast();
    const [query, setQuery] = React.useState('');
    const [debouncedQuery, setDebouncedQuery] = React.useState('');
    const [loading, setLoading] = React.useState(true);
    const [loadingMore, setLoadingMore] = React.useState(false);
    const [refreshing, setRefreshing] = React.useState(false);
    const [following, setFollowing] = React.useState<FollowingListItem[]>([]);
    const [nextCursor, setNextCursor] = React.useState<string | null>(null);
    const [hasMore, setHasMore] = React.useState(false);
    const [totalCount, setTotalCount] = React.useState(0);

    React.useEffect(() => {
        const timeoutId = setTimeout(() => {
            setDebouncedQuery(query.trim());
        }, 180);
        return () => clearTimeout(timeoutId);
    }, [query]);

    const loadFirstPage = React.useCallback(async () => {
        setLoading(true);
        try {
            const page = await followingService.getMyFollowingPage({
                cursor: null,
                limit: 24,
                query: debouncedQuery,
            });
            setFollowing(page.items);
            setNextCursor(page.nextCursor);
            setHasMore(page.hasMore);
            setTotalCount(page.totalCount);
        } catch (error: any) {
            setFollowing([]);
            setNextCursor(null);
            setHasMore(false);
            setTotalCount(0);
            showToast(error?.message || 'Could not load following list.', { variant: 'error' });
        } finally {
            setLoading(false);
        }
    }, [debouncedQuery, showToast]);

    React.useEffect(() => {
        void loadFirstPage();
    }, [loadFirstPage]);

    const loadMore = React.useCallback(async () => {
        if (loading || loadingMore || !hasMore || !nextCursor) return;
        setLoadingMore(true);
        try {
            const page = await followingService.getMyFollowingPage({
                cursor: nextCursor,
                limit: 24,
                query: debouncedQuery,
            });
            setFollowing((current) => [...current, ...page.items]);
            setNextCursor(page.nextCursor);
            setHasMore(page.hasMore);
        } catch (error: any) {
            showToast(error?.message || 'Could not load more following.', { variant: 'error' });
        } finally {
            setLoadingMore(false);
        }
    }, [debouncedQuery, hasMore, loading, loadingMore, nextCursor, showToast]);

    const onRefresh = React.useCallback(async () => {
        setRefreshing(true);
        await loadFirstPage();
        setRefreshing(false);
    }, [loadFirstPage]);

    const openCreator = React.useCallback((username: string) => {
        const cleaned = username.replace(/^@/, '').trim();
        router.push(`/video/creator/${encodeURIComponent(cleaned)}` as Href);
    }, []);

    const FollowingItem = React.useMemo(
        () =>
            React.memo(function FollowingItemRow({ item }: { item: FollowingListItem }) {
                return (
                    <Pressable
                        onPress={() => openCreator(item.username)}
                        className="mb-2 flex-row items-center rounded-2xl border px-3 py-3"
                        style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}
                        accessibilityRole="button"
                        accessibilityLabel={`Open ${item.username} profile`}
                        accessibilityHint={`Followed since ${formatFollowedSince(item.followedSince)}`}
                    >
                        <Image
                            source={{ uri: item.avatarUrl }}
                            style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: colors.border }}
                            resizeMode="cover"
                        />

                        <View className="ml-3 flex-1">
                            <View className="flex-row items-center">
                                <AppText className="text-sm font-bold" color={colors.textPrimary}>
                                    {item.username}
                                </AppText>
                                {item.isVerified ? (
                                    <Ionicons name="checkmark-circle" size={14} color={colors.info} style={{ marginLeft: 5 }} />
                                ) : null}
                            </View>
                            <AppText className="text-xs" color={colors.textSecondary} numberOfLines={1}>
                                {item.displayName} · {compact(item.followersCount)} followers
                            </AppText>
                            <AppText className="mt-1 text-xs" color={colors.textSecondary} numberOfLines={1}>
                                {item.bio}
                            </AppText>
                        </View>

                        <View className="items-end">
                            <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
                            <AppText className="mt-1 text-[10px]" color={colors.textSecondary}>
                                {formatFollowedSince(item.followedSince)}
                            </AppText>
                        </View>
                    </Pressable>
                );
            }),
        [colors.backgroundAlt, colors.border, colors.info, colors.textPrimary, colors.textSecondary, openCreator]
    );

    return (
        <Screen title="Following" className="pt-2">
            <View
                className="rounded-2xl border px-3 py-2"
                style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}
            >
                <View className="flex-row items-center">
                    <Ionicons name="search" size={16} color={colors.textSecondary} />
                    <TextInput
                        value={query}
                        onChangeText={setQuery}
                        placeholder="Search following"
                        placeholderTextColor={colors.textSecondary}
                        style={{
                            flex: 1,
                            marginLeft: 8,
                            color: colors.textPrimary,
                            fontSize: 15,
                            fontWeight: '600',
                            paddingVertical: 6,
                        }}
                        accessibilityLabel="Search following"
                    />
                </View>
            </View>

            <View className="mt-3 rounded-2xl border p-3" style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}>
                <AppText className="text-sm font-semibold" color={colors.textPrimary}>
                    Total Following
                </AppText>
                <AppText className="mt-1 text-2xl font-extrabold" color={colors.textPrimary}>
                    {compact(totalCount)}
                </AppText>
            </View>

            <FlashList
                data={following}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ paddingTop: 12, paddingBottom: 120 }}
                renderItem={({ item }) => <FollowingItem item={item} />}
                onEndReached={loadMore}
                onEndReachedThreshold={0.65}
                removeClippedSubviews
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={colors.primary}
                        colors={[colors.primary]}
                    />
                }
                ListEmptyComponent={
                    !loading ? (
                        <View className="items-center rounded-2xl border px-4 py-7" style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}>
                            <View
                                className="h-11 w-11 items-center justify-center rounded-full"
                                style={{ backgroundColor: colors.background }}
                            >
                                <Ionicons name="person-add-outline" size={22} color={colors.textSecondary} />
                            </View>
                            <AppText className="mt-3 text-sm font-semibold" color={colors.textPrimary}>
                                Not Following Anyone Yet
                            </AppText>
                            <AppText className="mt-1 text-center text-sm leading-5" color={colors.textSecondary}>
                                Follow creators to see them listed here.
                            </AppText>
                        </View>
                    ) : (
                        <View className="items-center rounded-2xl border p-5" style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}>
                            <ActivityIndicator color={colors.primary} />
                            <AppText className="mt-2 text-sm" color={colors.textSecondary}>
                                Loading following...
                            </AppText>
                        </View>
                    )
                }
                ListFooterComponent={
                    loadingMore ? (
                        <View className="py-2">
                            <ActivityIndicator color={colors.primary} />
                        </View>
                    ) : null
                }
            />
        </Screen>
    );
}
