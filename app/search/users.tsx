import { Ionicons } from '@expo/vector-icons';
import { Href, router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Pressable, TextInput, View } from 'react-native';

import AppText from '@/components/ui/AppText';
import Screen from '@/components/ui/Screen';
import { useColors } from '@/config/colors';
import { getFollowedCreators, normalizeCreatorHandle, toggleFollowedCreator } from '@/data/mock/following';
import { searchService } from '@/lib/services/searchService';
import { SearchUserResult } from '@/types/search.types';

export default function SearchUsersScreen() {
    const colors = useColors();
    const params = useLocalSearchParams<{ q?: string }>();
    const initialQuery = typeof params.q === 'string' ? decodeURIComponent(params.q) : '';
    const [query, setQuery] = React.useState(initialQuery);
    const [results, setResults] = React.useState<SearchUserResult[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [followedCreators, setFollowedCreators] = React.useState<Set<string>>(getFollowedCreators());

    React.useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(true);
            searchService.searchUsers(query.trim()).then((next) => {
                setResults(next);
                setLoading(false);
            });
        }, 150);
        return () => clearTimeout(timer);
    }, [query]);

    const toggleFollow = React.useCallback((handle: string) => {
        const normalized = normalizeCreatorHandle(handle);
        setFollowedCreators((current) => {
            const next = new Set(current);
            const isNowFollowed = toggleFollowedCreator(normalized);
            if (isNowFollowed) next.add(normalized);
            else next.delete(normalized);
            return next;
        });
    }, []);

    return (
        <Screen title="Search Users">
            <View className="rounded-2xl border px-3 py-2" style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}>
                <View className="flex-row items-center">
                    <Ionicons name="search" size={16} color={colors.textSecondary} />
                    <TextInput
                        value={query}
                        onChangeText={setQuery}
                        placeholder="Search creators"
                        placeholderTextColor={colors.textSecondary}
                        style={{ flex: 1, marginLeft: 8, color: colors.textPrimary, fontSize: 15, fontWeight: '600', paddingVertical: 6 }}
                        accessibilityLabel="Search users"
                    />
                </View>
            </View>

            {loading ? (
                <View className="mt-4 flex-row items-center">
                    <ActivityIndicator color={colors.primary} />
                    <AppText className="ml-2 text-sm" color={colors.textSecondary}>Loading users...</AppText>
                </View>
            ) : null}

            <View className="mt-3">
                {results.map((user) => {
                    const normalized = normalizeCreatorHandle(user.username);
                    const isFollowing = followedCreators.has(normalized);
                    return (
                        <View key={user.id} className="mb-2 flex-row items-center rounded-2xl border px-3 py-2" style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}>
                            <Pressable
                                onPress={() => router.push(`/video/creator/${encodeURIComponent(user.username.replace(/^@/, ''))}` as Href)}
                                className="flex-1 flex-row items-center"
                                accessibilityRole="button"
                                accessibilityLabel={`Open ${user.username} profile`}
                            >
                                <View className="h-11 w-11 items-center justify-center rounded-full" style={{ backgroundColor: colors.primary50 }}>
                                    <AppText className="text-sm font-bold" color="#FFFFFF">
                                        {user.displayName.slice(0, 1).toUpperCase()}
                                    </AppText>
                                </View>
                                <View className="ml-3 flex-1">
                                    <View className="flex-row items-center">
                                        <AppText className="text-sm font-bold" color={colors.textPrimary}>{user.username}</AppText>
                                        {user.isVerified ? <Ionicons name="checkmark-circle" size={14} color={colors.info} style={{ marginLeft: 4 }} /> : null}
                                    </View>
                                    <AppText className="text-xs" color={colors.textSecondary}>
                                        {user.displayName} · {searchService.compactCount(user.followersCount)} followers
                                    </AppText>
                                </View>
                            </Pressable>

                            <Pressable
                                onPress={() => toggleFollow(user.username)}
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
        </Screen>
    );
}

