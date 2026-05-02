import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React, { memo } from 'react';
import { Pressable, View } from 'react-native';

import AppText from '@/components/ui/AppText';
import { VideoComment } from '@/types/comment.types';

type CommentListItemProps = {
    comment: VideoComment;
    depth?: number;
    onReply: (comment: VideoComment) => void;
    onToggleLike: (comment: VideoComment) => void;
    likeBusy?: boolean;
};

const timeAgo = (isoDate: string) => {
    const deltaMs = Date.now() - new Date(isoDate).getTime();
    const minutes = Math.max(1, Math.floor(deltaMs / (1000 * 60)));
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    return `${days}d`;
};

function CommentListItem({ comment, depth = 0, onReply, onToggleLike, likeBusy = false }: CommentListItemProps) {
    const isReply = depth > 0;
    const hasAvatar = Boolean(comment.authorAvatarUrl);
    const INDENT_PER_LEVEL = 16;

    return (
        <View
            className="mb-3 rounded-xl p-3"
            style={{
                backgroundColor: isReply ? '#F4F4F5' : '#FAFAFA',
                marginLeft: depth * INDENT_PER_LEVEL,
            }}
        >
            {isReply ? (
                <View
                    pointerEvents="none"
                    style={{
                        position: 'absolute',
                        left: -depth * INDENT_PER_LEVEL + 6,
                        top: 0,
                        bottom: 0,
                        width: depth * INDENT_PER_LEVEL,
                    }}
                >
                    {Array.from({ length: depth }).map((_, level) => (
                        <View
                            key={`thread-line-${comment.id}-${level}`}
                            style={{
                                position: 'absolute',
                                left: level * INDENT_PER_LEVEL,
                                top: -4,
                                bottom: -4,
                                width: 1,
                                backgroundColor: '#D4D4D8',
                            }}
                        />
                    ))}
                    <View
                        style={{
                            position: 'absolute',
                            left: (depth - 1) * INDENT_PER_LEVEL,
                            top: 18,
                            width: 10,
                            height: 1,
                            backgroundColor: '#D4D4D8',
                        }}
                    />
                </View>
            ) : null}
            <View className="flex-row">
                <View
                    className="mr-3 h-8 w-8 items-center justify-center overflow-hidden rounded-full"
                    style={{ backgroundColor: '#E4E4E7' }}
                    accessible
                    accessibilityRole="image"
                    accessibilityLabel={hasAvatar ? `${comment.authorHandle} profile avatar` : `${comment.authorHandle} placeholder avatar`}
                >
                    {hasAvatar ? (
                        <Image
                            source={{ uri: comment.authorAvatarUrl! }}
                            style={{ width: '100%', height: '100%' }}
                            contentFit="cover"
                        />
                    ) : (
                        <Ionicons name="person" size={15} color="#52525B" />
                    )}
                </View>

                <View className="flex-1">
                    <View className="flex-row items-center justify-between">
                        <AppText className="text-sm font-semibold" color="#111111">
                            {comment.authorHandle}
                        </AppText>
                        <AppText className="text-xs" color="#52525B">
                            {timeAgo(comment.createdAt)}
                        </AppText>
                    </View>

                    <AppText className="mt-2 text-sm leading-5" color="#18181B">
                        {comment.isDeleted ? 'Comment deleted' : comment.text}
                    </AppText>
                    {comment.parentDeleted ? (
                        <AppText className="mt-1 text-xs" color="#71717A">
                            Comment replied to has been deleted.
                        </AppText>
                    ) : null}

                    <View className="mt-2 flex-row items-center">
                        <Pressable
                            onPress={() => onToggleLike(comment)}
                            className="rounded-full px-2 py-1"
                            accessibilityRole="button"
                            accessibilityLabel={comment.isLiked ? 'Unlike comment' : 'Like comment'}
                            accessibilityState={{ busy: likeBusy }}
                        >
                            <AppText className="text-xs font-semibold" color={comment.isLiked ? '#DC2626' : '#52525B'}>
                                {comment.likesCount} {comment.likesCount === 1 ? 'like' : 'likes'}
                            </AppText>
                        </Pressable>
                        <Pressable
                            onPress={() => onReply(comment)}
                            className="ml-4 rounded-full px-2 py-1"
                            disabled={comment.isDeleted}
                            accessibilityRole="button"
                            accessibilityLabel={`Reply to ${comment.authorHandle}`}
                            accessibilityHint="Adds an @ tag for this user in the comment box"
                        >
                            <AppText className="text-xs font-semibold" color="#111111">
                                Reply
                            </AppText>
                        </Pressable>
                    </View>
                </View>
            </View>
        </View>
    );
}

export default memo(CommentListItem, (prev, next) =>
    prev.comment.id === next.comment.id &&
    prev.comment.text === next.comment.text &&
    prev.comment.likesCount === next.comment.likesCount &&
    prev.comment.createdAt === next.comment.createdAt &&
    prev.comment.isLiked === next.comment.isLiked &&
    prev.comment.parentCommentId === next.comment.parentCommentId &&
    prev.comment.replyToHandle === next.comment.replyToHandle &&
    prev.depth === next.depth &&
    prev.likeBusy === next.likeBusy
);
