import { Ionicons } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import { Href, router } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Image, Pressable, TextInput, View } from 'react-native';

import AppText from '@/components/ui/AppText';
import Screen from '@/components/ui/Screen';
import { useColors } from '@/config/colors';
import { MockSubscriber } from '@/data/mock/subscribers';
import { subscribersService } from '@/lib/services/subscribersService';

const compact = (value: number) =>
    new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(value);

const formatDate = (isoDate: string) =>
    new Date(isoDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const statusMeta: Record<MockSubscriber['status'], { label: string; bg: string }> = {
    active: { label: 'Active', bg: 'rgba(26,118,13,0.18)' },
    cancelled: { label: 'Cancelled', bg: 'rgba(248,183,53,0.24)' },
    expired: { label: 'Expired', bg: 'rgba(120,120,120,0.24)' },
};

export default function SubscribersScreen() {
    const colors = useColors();
    const [query, setQuery] = React.useState('');
    const [debouncedQuery, setDebouncedQuery] = React.useState('');
    const [loading, setLoading] = React.useState(true);
    const [loadingMore, setLoadingMore] = React.useState(false);
    const [subscribers, setSubscribers] = React.useState<MockSubscriber[]>([]);
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
        const page = await subscribersService.getMySubscribersPage({
            cursor: null,
            limit: 24,
            query: debouncedQuery,
        });
        setSubscribers(page.items);
        setNextCursor(page.nextCursor);
        setHasMore(page.hasMore);
        setTotalCount(page.totalCount);
        setLoading(false);
    }, [debouncedQuery]);

    React.useEffect(() => {
        void loadFirstPage();
    }, [loadFirstPage]);

    const loadMore = React.useCallback(async () => {
        if (loading || loadingMore || !hasMore || !nextCursor) return;
        setLoadingMore(true);
        const page = await subscribersService.getMySubscribersPage({
            cursor: nextCursor,
            limit: 24,
            query: debouncedQuery,
        });
        setSubscribers((current) => [...current, ...page.items]);
        setNextCursor(page.nextCursor);
        setHasMore(page.hasMore);
        setLoadingMore(false);
    }, [debouncedQuery, hasMore, loading, loadingMore, nextCursor]);

    const openCreator = React.useCallback((username: string) => {
        const cleaned = username.replace(/^@/, '').trim();
        router.push(`/video/creator/${encodeURIComponent(cleaned)}` as Href);
    }, []);

    const SubscriberItem = React.useMemo(
        () =>
            React.memo(function SubscriberItemRow({ item }: { item: MockSubscriber }) {
                const meta = statusMeta[item.status];
                return (
                    <Pressable
                        onPress={() => openCreator(item.username)}
                        className="mb-2 flex-row items-center rounded-2xl border px-3 py-3"
                        style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}
                        accessibilityRole="button"
                        accessibilityLabel={`Open ${item.username} profile`}
                        accessibilityHint={`Subscribed since ${formatDate(item.subscribedSince)}`}
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
                            <View className="mt-1 flex-row items-center">
                                <View className="rounded-full px-2 py-0.5" style={{ backgroundColor: meta.bg }}>
                                    <AppText className="text-[10px] font-semibold" color={colors.textPrimary}>
                                        {meta.label}
                                    </AppText>
                                </View>
                                <AppText className="ml-2 text-[10px]" color={colors.textSecondary}>
                                    Since {formatDate(item.subscribedSince)}
                                </AppText>
                            </View>
                        </View>

                        <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
                    </Pressable>
                );
            }),
        [colors.backgroundAlt, colors.border, colors.info, colors.textPrimary, colors.textSecondary, openCreator]
    );

    return (
        <Screen title="Subscribers" className="pt-2">
            <View
                className="rounded-2xl border px-3 py-2"
                style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}
            >
                <View className="flex-row items-center">
                    <Ionicons name="search" size={16} color={colors.textSecondary} />
                    <TextInput
                        value={query}
                        onChangeText={setQuery}
                        placeholder="Search subscribers"
                        placeholderTextColor={colors.textSecondary}
                        style={{
                            flex: 1,
                            marginLeft: 8,
                            color: colors.textPrimary,
                            fontSize: 15,
                            fontWeight: '600',
                            paddingVertical: 6,
                        }}
                        accessibilityLabel="Search subscribers"
                    />
                </View>
            </View>

            <View className="mt-3 rounded-2xl border p-3" style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}>
                <AppText className="text-sm font-semibold" color={colors.textPrimary}>
                    Subscribers (All Time)
                </AppText>
                <AppText className="mt-1 text-2xl font-extrabold" color={colors.textPrimary}>
                    {compact(totalCount)}
                </AppText>
            </View>

            <FlashList
                data={subscribers}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ paddingTop: 12, paddingBottom: 120 }}
                renderItem={({ item }) => <SubscriberItem item={item} />}
                onEndReached={loadMore}
                onEndReachedThreshold={0.65}
                removeClippedSubviews
                ListEmptyComponent={
                    !loading ? (
                        <View className="items-center rounded-2xl border px-4 py-7" style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}>
                            <View
                                className="h-11 w-11 items-center justify-center rounded-full"
                                style={{ backgroundColor: colors.background }}
                            >
                                <Ionicons name="diamond-outline" size={22} color={colors.textSecondary} />
                            </View>
                            <AppText className="mt-3 text-sm font-semibold" color={colors.textPrimary}>
                                No Subscribers Yet
                            </AppText>
                            <AppText className="mt-1 text-center text-sm leading-5" color={colors.textSecondary}>
                                Subscribers who join your premium access will appear here.
                            </AppText>
                        </View>
                    ) : (
                        <View className="items-center rounded-2xl border p-5" style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}>
                            <ActivityIndicator color={colors.primary} />
                            <AppText className="mt-2 text-sm" color={colors.textSecondary}>
                                Loading subscribers...
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
