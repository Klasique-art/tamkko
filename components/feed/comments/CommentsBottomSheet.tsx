import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { View } from 'react-native';

import CommentsThread from '@/components/feed/comments/CommentsThread';
import AppBottomSheet, { AppBottomSheetRef } from '@/components/ui/AppBottomSheet';
import { VideoItem } from '@/types/video.types';

type CommentsBottomSheetProps = {
    video?: VideoItem | null;
    onClosed?: () => void;
    onCommentCreated?: (videoId: string) => void;
};

const CommentsBottomSheet = forwardRef<AppBottomSheetRef, CommentsBottomSheetProps>(
    ({ video, onClosed, onCommentCreated }, ref) => {
        const sheetRef = useRef<AppBottomSheetRef>(null);

        useImperativeHandle(ref, () => ({
            open: () => {
                sheetRef.current?.open();
            },
            close: () => {
                sheetRef.current?.close();
            },
        }));

        const handleClose = React.useCallback(() => {
            onClosed?.();
        }, [onClosed]);

        return (
            <AppBottomSheet ref={sheetRef} snapPoints={['78%']} onClose={handleClose} scrollable>
                <View className="flex-1" style={{ backgroundColor: '#FFFFFF' }}>
                    {video ? (
                        <CommentsThread
                            videoId={video.id}
                            videoTitle={video.title}
                            onCommentCreated={onCommentCreated}
                            compact
                        />
                    ) : null}
                </View>
            </AppBottomSheet>
        );
    }
);

CommentsBottomSheet.displayName = 'CommentsBottomSheet';

export default CommentsBottomSheet;
