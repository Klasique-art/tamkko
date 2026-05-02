import { Ionicons } from '@expo/vector-icons';
import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { Pressable, View } from 'react-native';

import AppBottomSheet, { AppBottomSheetRef } from '@/components/ui/AppBottomSheet';
import AppText from '@/components/ui/AppText';
import { useColors } from '@/config/colors';
import { VideoItem } from '@/types/video.types';

type VideoManageActionSheetProps = {
    video: VideoItem | null;
    onEdit: (video: VideoItem) => void;
    onDelete: (video: VideoItem) => void;
};

const ActionRow = ({
    icon,
    label,
    danger = false,
    onPress,
}: {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    danger?: boolean;
    onPress: () => void;
}) => {
    const colors = useColors();
    const textColor = danger ? colors.error : colors.textPrimary;
    return (
        <Pressable
            onPress={onPress}
            className="mt-2 flex-row items-center rounded-2xl border px-4 py-4"
            style={{
                borderColor: danger ? `${colors.error}33` : colors.border,
                backgroundColor: danger ? `${colors.error}12` : colors.backgroundAlt,
            }}
            accessibilityRole="button"
            accessibilityLabel={label}
        >
            <View
                className="h-9 w-9 items-center justify-center rounded-full"
                style={{ backgroundColor: danger ? `${colors.error}20` : colors.background }}
            >
                <Ionicons name={icon} size={18} color={textColor} />
            </View>
            <AppText className="ml-3 text-base font-semibold" color={textColor}>
                {label}
            </AppText>
        </Pressable>
    );
};

const VideoManageActionSheet = forwardRef<AppBottomSheetRef, VideoManageActionSheetProps>(
    ({ video, onEdit, onDelete }, ref) => {
        const colors = useColors();
        const sheetRef = useRef<AppBottomSheetRef>(null);
        const [confirmDelete, setConfirmDelete] = React.useState(false);
        const isImagePost = video?.mediaType === 'image' || (!video?.videoSource && !video?.playbackUrl);
        const mediaNoun = isImagePost ? 'image' : 'video';

        useImperativeHandle(ref, () => ({
            open: () => sheetRef.current?.open(),
            close: () => {
                setConfirmDelete(false);
                sheetRef.current?.close();
            },
        }));

        const close = () => {
            setConfirmDelete(false);
            sheetRef.current?.close();
        };

        const handleEdit = () => {
            if (!video) return;
            close();
            onEdit(video);
        };

        const requestDelete = () => {
            setConfirmDelete(true);
        };

        const handleConfirmDelete = () => {
            if (!video) return;
            close();
            onDelete(video);
        };

        return (
            <AppBottomSheet ref={sheetRef} snapPoints={['46%']} onClose={() => setConfirmDelete(false)}>
                <View className="px-4 pb-4 pt-2">
                    <AppText className="text-lg font-black" color={colors.textPrimary}>
                        {isImagePost ? 'Manage Image' : 'Manage Video'}
                    </AppText>
                    <AppText className="mt-1 text-xs" color={colors.textSecondary} numberOfLines={2}>
                        {video?.title ?? 'Post options'}
                    </AppText>

                    {!confirmDelete ? (
                        <>
                            <ActionRow icon="create-outline" label="Edit caption & settings" onPress={handleEdit} />
                            <ActionRow icon="trash-outline" label={`Delete ${mediaNoun}`} danger onPress={requestDelete} />
                            <Pressable
                                onPress={close}
                                className="mt-3 rounded-2xl border py-3"
                                style={{ borderColor: colors.border, backgroundColor: colors.background }}
                                accessibilityRole="button"
                                accessibilityLabel="Cancel"
                            >
                                <AppText className="text-center text-sm font-semibold" color={colors.textPrimary}>
                                    Cancel
                                </AppText>
                            </Pressable>
                        </>
                    ) : (
                        <View className="mt-3 rounded-2xl border p-4" style={{ borderColor: `${colors.error}44`, backgroundColor: `${colors.error}12` }}>
                            <AppText className="text-sm font-bold" color={colors.error}>
                                {`Delete this ${mediaNoun} permanently?`}
                            </AppText>
                            <AppText className="mt-1 text-xs" color={colors.textSecondary}>
                                This action cannot be undone.
                            </AppText>
                            <View className="mt-3 flex-row">
                                <Pressable
                                    onPress={() => setConfirmDelete(false)}
                                    className="mr-2 flex-1 rounded-xl border py-3"
                                    style={{ borderColor: colors.border, backgroundColor: colors.background }}
                                    accessibilityRole="button"
                                    accessibilityLabel="Cancel delete"
                                >
                                    <AppText className="text-center text-sm font-semibold" color={colors.textPrimary}>No, keep it</AppText>
                                </Pressable>
                                <Pressable
                                    onPress={handleConfirmDelete}
                                    className="flex-1 rounded-xl border py-3"
                                    style={{ borderColor: `${colors.error}55`, backgroundColor: `${colors.error}20` }}
                                    accessibilityRole="button"
                                    accessibilityLabel={`Confirm delete ${mediaNoun}`}
                                >
                                    <AppText className="text-center text-sm font-semibold" color={colors.error}>Delete</AppText>
                                </Pressable>
                            </View>
                        </View>
                    )}
                </View>
            </AppBottomSheet>
        );
    }
);

VideoManageActionSheet.displayName = 'VideoManageActionSheet';

export default VideoManageActionSheet;
