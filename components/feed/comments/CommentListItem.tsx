import React, { memo } from 'react';
import { Pressable, View } from 'react-native';

import AppText from '@/components/ui/AppText';
import { VideoComment } from '@/types/comment.types';

type CommentListItemProps = {
    comment: VideoComment;
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

function CommentListItem({ comment, onReply, onToggleLike, likeBusy = false }: CommentListItemProps) {
    const isReply = Boolean(comment.parentCommentId);

    return (
        <View
            className={`${isReply ? 'ml-5' : ''} mb-3 rounded-xl p-3`}
            style={{ backgroundColor: isReply ? '#F4F4F5' : '#FAFAFA' }}
        >
            <View className="flex-row items-center justify-between">
                <AppText className="text-sm font-semibold" color="#111111">
                    {comment.authorHandle}
                </AppText>
                <AppText className="text-xs" color="#52525B">
                    {timeAgo(comment.createdAt)}
                </AppText>
            </View>

            <AppText className="mt-2 text-sm leading-5" color="#18181B">
                {comment.text}
            </AppText>

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
    prev.likeBusy === next.likeBusy
);
