import { Ionicons } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import { LinearGradient } from 'expo-linear-gradient';
import { Href, router } from 'expo-router';
import React from 'react';
import {
    AccessibilityInfo,
    ActivityIndicator,
    Pressable,
    TextInput,
    View,
    useWindowDimensions,
} from 'react-native';

import AppText from '@/components/ui/AppText';
import Screen from '@/components/ui/Screen';
import { useColors } from '@/config/colors';
import { getFollowedCreators, normalizeCreatorHandle, toggleFollowedCreator } from '@/data/mock/following';
import { searchService } from '@/lib/services/searchService';
import { SearchResultsBundle, SearchSuggestion } from '@/types/search.types';

const EMPTY_RESULTS: SearchResultsBundle = {
    users: [],
    videos: [],
    hashtags: [],
};

const suggestionTypeLabel: Record<SearchSuggestion['type'], string> = {
    user: 'Creator',
    hashtag: 'Hashtag',
    video: 'Video',
};

export default function SearchScreen() {
    const colors = useColors();
    const { width } = useWindowDimensions();
    const [query, setQuery] = React.useState('');
    const [debouncedQuery, setDebouncedQuery] = React.useState('');
    const [results, setResults] = React.useState<SearchResultsBundle>(EMPTY_RESULTS);
    const [suggestions, setSuggestions] = React.useState<SearchSuggestion[]>([]);
    const [isFocused, setIsFocused] = React.useState(false);
    const [isLoadingResults, setIsLoadingResults] = React.useState(false);
    const [isLoadingSuggestions, setIsLoadingSuggestions] = React.useState(false);
    const [followedCreators, setFollowedCreators] = React.useState<Set<string>>(getFollowedCreators());

    React.useEffect(() => {
        const timer = setTimeout(() => setDebouncedQuery(query.trim()), 180);
        return () => clearTimeout(timer);
    }, [query]);

    React.useEffect(() => {
        let isMounted = true;
        setIsLoadingSuggestions(true);
        searchService
            .getTypeaheadSuggestions(debouncedQuery)
            .then((nextSuggestions) => {
                if (isMounted) setSuggestions(nextSuggestions);
            })
            .finally(() => {
                if (isMounted) setIsLoadingSuggestions(false);
            });

        return () => {
            isMounted = false;
        };
    }, [debouncedQuery]);

    React.useEffect(() => {
        let isMounted = true;
        setIsLoadingResults(true);
        searchService
            .searchAll(debouncedQuery)
            .then((nextResults) => {
                if (isMounted) setResults(nextResults);
            })
            .finally(() => {
                if (isMounted) setIsLoadingResults(false);
            });

        return () => {
            isMounted = false;
        };
    }, [debouncedQuery]);

    const recentQueries = React.useMemo(() => searchService.getRecentQueries(), []);
    const trendingNow = React.useMemo(() => results.hashtags.slice(0, 6), [results.hashtags]);
    const videosGrid = React.useMemo(() => results.videos.slice(0, 8), [results.videos]);
    const creatorsPreview = React.useMemo(() => results.users.slice(0, 6), [results.users]);

    const tileGap = 10;
    const tileWidth = Math.floor((width - 32 - tileGap) / 2);

    const navigateFromSuggestion = React.useCallback((suggestion: SearchSuggestion) => {
        if (suggestion.type === 'user') {
            const username = suggestion.label.replace(/^@/, '');
            router.push(`/video/creator/${encodeURIComponent(username)}` as Href);
            return;
        }
        if (suggestion.type === 'hashtag') {
            const tag = suggestion.label.replace(/^#/, '');
            router.push(`/search/hashtag/${encodeURIComponent(tag)}` as Href);
            return;
        }
        router.push(`/search/videos?q=${encodeURIComponent(suggestion.label)}` as Href);
    }, []);

    const handleSelectSuggestion = React.useCallback((suggestion: SearchSuggestion) => {
        setQuery(suggestion.type === 'hashtag' ? `#${suggestion.label.replace(/^#/, '')}` : suggestion.label);
        setIsFocused(false);
        void AccessibilityInfo.announceForAccessibility(`${suggestionTypeLabel[suggestion.type]} suggestion selected`);
        navigateFromSuggestion(suggestion);
    }, [navigateFromSuggestion]);

    const handleCreatorFollow = React.useCallback((handle: string) => {
        const normalized = normalizeCreatorHandle(handle);
        setFollowedCreators((current) => {
            const next = new Set(current);
            const followed = toggleFollowedCreator(normalized);
            if (followed) next.add(normalized);
            else next.delete(normalized);
            return next;
        });
    }, []);

    const shouldShowSuggestions = isFocused && query.trim().length > 0;

    return (
        <Screen title="Search">
            <View className="pt-2">
                <LinearGradient
                    colors={[colors.primary, colors.primary50, colors.accent]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{ borderRadius: 22, padding: 16 }}
                >
                    <View className="flex-row items-center justify-between">
                        <View>
                            <AppText className="text-xl font-extrabold" color="#FFFFFF">
                                Discover On Tamkko
                            </AppText>
                            <AppText className="mt-1 text-xs" color="rgba(255,255,255,0.9)">
                                Creators, videos, sounds, and fast profile suggestions
                            </AppText>
                        </View>
                        <Pressable
                            onPress={() => router.push('/search/trending' as Href)}
                            className="rounded-full px-3 py-1.5"
                            style={{ backgroundColor: 'rgba(255,255,255,0.16)' }}
                            accessibilityRole="button"
                            accessibilityLabel="Open trending hashtags"
                        >
                            <AppText className="text-xs font-semibold" color="#FFFFFF">
                                Trending
                            </AppText>
                        </Pressable>
                    </View>

                    <View className="mt-4 rounded-2xl border px-3 py-2" style={{ borderColor: 'rgba(255,255,255,0.25)', backgroundColor: 'rgba(255,255,255,0.14)' }}>
                        <View className="flex-row items-center">
                            <Ionicons name="search" size={18} color="#FFFFFF" />
                            <TextInput
                                value={query}
                                onChangeText={setQuery}
                                placeholder="Search creators, videos, hashtags"
                                placeholderTextColor="rgba(255,255,255,0.72)"
                                style={{
                                    flex: 1,
                                    color: '#FFFFFF',
                                    marginLeft: 8,
                                    paddingVertical: 6,
                                    fontSize: 15,
                                    fontWeight: '600',
                                }}
                                onFocus={() => setIsFocused(true)}
                                onBlur={() => setIsFocused(false)}
                                returnKeyType="search"
                                accessibilityLabel="Search input"
                            />
                            {query.length > 0 ? (
                                <Pressable
                                    onPress={() => setQuery('')}
                                    className="rounded-full p-1"
                                    accessibilityRole="button"
                                    accessibilityLabel="Clear search text"
                                >
                                    <Ionicons name="close-circle" size={18} color="#FFFFFF" />
                                </Pressable>
                            ) : null}
                        </View>
                    </View>
                </LinearGradient>

                {shouldShowSuggestions ? (
                    <View
                        className="mt-2 rounded-2xl border py-1"
                        style={{ borderColor: colors.border, backgroundColor: colors.background, elevation: 5 }}
                        accessible
                        accessibilityLabel="Search suggestions"
                    >
                        {isLoadingSuggestions ? (
                            <View className="flex-row items-center px-3 py-3">
                                <ActivityIndicator color={colors.primary} />
                                <AppText className="ml-2 text-sm" color={colors.textSecondary}>
                                    Getting suggestions...
                                </AppText>
                            </View>
                        ) : suggestions.length > 0 ? (
                            suggestions.map((suggestion) => (
                                <Pressable
                                    key={suggestion.id}
                                    onPress={() => handleSelectSuggestion(suggestion)}
                                    className="flex-row items-center justify-between px-3 py-3"
                                    accessibilityRole="button"
                                    accessibilityLabel={`${suggestionTypeLabel[suggestion.type]} suggestion ${suggestion.label}`}
                                >
                                    <View className="flex-row items-center">
                                        <Ionicons
                                            name={
                                                suggestion.type === 'user'
                                                    ? 'person-circle-outline'
                                                    : suggestion.type === 'hashtag'
                                                        ? 'pricetag-outline'
                                                        : 'play-circle-outline'
                                            }
                                            size={18}
                                            color={colors.textSecondary}
                                        />
                                        <AppText className="ml-2 text-sm font-semibold" color={colors.textPrimary}>
                                            {suggestion.label}
                                        </AppText>
                                    </View>
                                    <AppText className="text-xs" color={colors.textSecondary}>
                                        {suggestionTypeLabel[suggestion.type]}
                                    </AppText>
                                </Pressable>
                            ))
                        ) : (
                            <View className="px-3 py-3">
                                <AppText className="text-sm" color={colors.textSecondary}>
                                    No suggestions yet. Try another keyword.
                                </AppText>
                            </View>
                        )}
                    </View>
                ) : null}
            </View>

            <FlashList
                data={videosGrid}
                keyExtractor={(item) => item.id}
                numColumns={2}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingTop: 14, paddingBottom: 120 }}
                ListHeaderComponent={
                    <View>
                        {query.trim().length === 0 ? (
                            <View
                                className="mb-4 rounded-2xl border p-3"
                                style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}
                            >
                                <AppText className="text-sm font-bold" color={colors.textPrimary}>
                                    Recent Searches
                                </AppText>
                                <View className="mt-2 flex-row flex-wrap">
                                    {recentQueries.map((item) => (
                                        <Pressable
                                            key={item}
                                            onPress={() => setQuery(item)}
                                            className="mb-2 mr-2 rounded-full border px-3 py-1.5"
                                            style={{ borderColor: colors.border, backgroundColor: colors.background }}
                                            accessibilityRole="button"
                                            accessibilityLabel={`Search ${item}`}
                                        >
                                            <AppText className="text-xs font-semibold" color={colors.textPrimary}>
                                                {item}
                                            </AppText>
                                        </Pressable>
                                    ))}
                                </View>
                            </View>
                        ) : null}

                        <View className="mb-3 flex-row items-center justify-between">
                            <AppText className="text-base font-bold" color={colors.textPrimary}>
                                Top Creators
                            </AppText>
                            <Pressable
                                onPress={() => router.push(`/search/users?q=${encodeURIComponent(debouncedQuery)}` as Href)}
                                accessibilityRole="button"
                                accessibilityLabel="Open all creator results"
                            >
                                <AppText className="text-xs font-semibold" color={colors.primary}>
                                    See all
                                </AppText>
                            </Pressable>
                        </View>

                        <View className="mb-4">
                            {creatorsPreview.map((user) => {
                                const normalized = normalizeCreatorHandle(user.username);
                                const isFollowing = followedCreators.has(normalized);
                                return (
                                    <View
                                        key={user.id}
                                        className="mb-2 flex-row items-center rounded-2xl border px-3 py-2"
                                        style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}
                                    >
                                        <Pressable
                                            onPress={() => router.push(`/video/creator/${encodeURIComponent(user.username.replace(/^@/, ''))}` as Href)}
                                            className="flex-1 flex-row items-center"
                                            accessibilityRole="button"
                                            accessibilityLabel={`Open ${user.username} profile`}
                                        >
                                            <View
                                                className="h-11 w-11 items-center justify-center rounded-full"
                                                style={{ backgroundColor: colors.primary50 }}
                                            >
                                                <AppText className="text-sm font-bold" color="#FFFFFF">
                                                    {user.displayName.slice(0, 1).toUpperCase()}
                                                </AppText>
                                            </View>
                                            <View className="ml-3 flex-1">
                                                <View className="flex-row items-center">
                                                    <AppText className="text-sm font-bold" color={colors.textPrimary}>
                                                        {user.username}
                                                    </AppText>
                                                    {user.isVerified ? (
                                                        <Ionicons name="checkmark-circle" size={14} color={colors.info} style={{ marginLeft: 5 }} />
                                                    ) : null}
                                                </View>
                                                <AppText className="text-xs" color={colors.textSecondary}>
                                                    {user.displayName} · {searchService.compactCount(user.followersCount)} followers
                                                </AppText>
                                            </View>
                                        </Pressable>

                                        <Pressable
                                            onPress={() => handleCreatorFollow(user.username)}
                                            className="rounded-full px-4 py-2"
                                            style={{ backgroundColor: isFollowing ? colors.success : colors.textPrimary }}
                                            accessibilityRole="button"
                                            accessibilityLabel={isFollowing ? `Unfollow ${user.username}` : `Follow ${user.username}`}
                                        >
                                            <AppText className="text-xs font-bold" color={colors.white}>
                                                {isFollowing ? 'Following' : 'Follow'}
                                            </AppText>
                                        </Pressable>
                                    </View>
                                );
                            })}
                        </View>

                        <View className="mb-3 flex-row items-center justify-between">
                            <AppText className="text-base font-bold" color={colors.textPrimary}>
                                Trending Hashtags
                            </AppText>
                            <Pressable
                                onPress={() => router.push('/search/trending' as Href)}
                                accessibilityRole="button"
                                accessibilityLabel="Open trending page"
                            >
                                <AppText className="text-xs font-semibold" color={colors.primary}>
                                    View all
                                </AppText>
                            </Pressable>
                        </View>

                        <View className="mb-4 flex-row flex-wrap">
                            {trendingNow.map((tag) => (
                                <Pressable
                                    key={tag.id}
                                    onPress={() => router.push(`/search/hashtag/${encodeURIComponent(tag.tag)}` as Href)}
                                    className="mb-2 mr-2 rounded-2xl border px-3 py-2"
                                    style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}
                                    accessibilityRole="button"
                                    accessibilityLabel={`Open hashtag ${tag.tag}`}
                                >
                                    <AppText className="text-xs font-bold" color={colors.textPrimary}>
                                        #{tag.tag}
                                    </AppText>
                                    <AppText className="mt-0.5 text-[10px]" color={colors.textSecondary}>
                                        {searchService.compactCount(tag.postsCount)} posts · {tag.growthLabel}
                                    </AppText>
                                </Pressable>
                            ))}
                        </View>

                        <View className="mb-3 flex-row items-center justify-between">
                            <AppText className="text-base font-bold" color={colors.textPrimary}>
                                Videos
                            </AppText>
                            <Pressable
                                onPress={() => router.push(`/search/videos?q=${encodeURIComponent(debouncedQuery)}` as Href)}
                                accessibilityRole="button"
                                accessibilityLabel="Open all video results"
                            >
                                <AppText className="text-xs font-semibold" color={colors.primary}>
                                    See all
                                </AppText>
                            </Pressable>
                        </View>

                        {isLoadingResults ? (
                            <View className="mb-3 flex-row items-center">
                                <ActivityIndicator color={colors.primary} />
                                <AppText className="ml-2 text-sm" color={colors.textSecondary}>
                                    Searching across Tamkko...
                                </AppText>
                            </View>
                        ) : null}
                    </View>
                }
                renderItem={({ item, index }) => (
                    <Pressable
                        onPress={() => router.push(`/video/${encodeURIComponent(item.id)}` as Href)}
                        className="mb-3 overflow-hidden rounded-3xl border"
                        style={{
                            width: tileWidth,
                            marginRight: index % 2 === 0 ? tileGap : 0,
                            borderColor: colors.border,
                            backgroundColor: colors.backgroundAlt,
                        }}
                        accessibilityRole="button"
                        accessibilityLabel={`Open video ${item.title}`}
                    >
                        <View style={{ aspectRatio: 3 / 4, backgroundColor: '#111111' }}>
                            <LinearGradient
                                colors={['rgba(243,130,24,0.22)', 'rgba(87,18,23,0.44)', 'rgba(0,0,0,0.55)']}
                                style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }}
                            />
                            <View className="absolute left-2 top-2 rounded-full px-2 py-1" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
                                <AppText className="text-[10px] font-semibold" color="#FFFFFF">
                                    {item.creatorUsername}
                                </AppText>
                            </View>
                            <View className="absolute bottom-2 left-2 right-2 rounded-2xl px-2 py-1.5" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
                                <View className="flex-row items-center justify-between">
                                    <View className="flex-row items-center">
                                        <Ionicons name="play" size={11} color="#FFFFFF" />
                                        <AppText className="ml-1 text-[10px] font-semibold" color="#FFFFFF">
                                            {searchService.compactCount(item.viewsCount)}
                                        </AppText>
                                    </View>
                                    <View className="flex-row items-center">
                                        <Ionicons name="heart" size={10} color="#FFFFFF" />
                                        <AppText className="ml-1 text-[10px] font-semibold" color="#FFFFFF">
                                            {searchService.compactCount(item.likesCount)}
                                        </AppText>
                                    </View>
                                </View>
                            </View>
                        </View>

                        <View className="px-2.5 pb-3 pt-2">
                            <AppText className="text-xs font-bold" color={colors.textPrimary} numberOfLines={1}>
                                {item.title}
                            </AppText>
                        </View>
                    </Pressable>
                )}
                ListEmptyComponent={
                    !isLoadingResults ? (
                        <View className="rounded-2xl border p-4" style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}>
                            <AppText className="text-sm font-semibold" color={colors.textPrimary}>
                                No results yet
                            </AppText>
                            <AppText className="mt-1 text-sm" color={colors.textSecondary}>
                                Try another search term for creators, videos, or hashtags.
                            </AppText>
                        </View>
                    ) : null
                }
            />
        </Screen>
    );
}


