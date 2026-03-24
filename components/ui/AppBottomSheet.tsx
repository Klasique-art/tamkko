import type { BottomSheetBackdropProps } from '@gorhom/bottom-sheet';
import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import React, { forwardRef, ReactNode, useImperativeHandle, useMemo, useRef } from 'react';

import { useColors } from '@/config/colors';

export interface AppBottomSheetRef {
    open: () => void;
    close: () => void;
}

interface AppBottomSheetProps {
    children: ReactNode;
    onClose?: () => void;
    snapPoints?: (string | number)[];
    showOverlay?: boolean;
    enablePanDownToClose?: boolean;
    scrollable?: boolean;
    [key: string]: any;
}

const AppBottomSheet = forwardRef<AppBottomSheetRef, AppBottomSheetProps>(
    ({
        children,
        onClose,
        snapPoints: customSnapPoints = ['40%'],
        showOverlay = true,
        enablePanDownToClose = true,
        scrollable = false,
        ...otherProps
    }, ref) => {
        const snapPoints = useMemo(() => customSnapPoints, [customSnapPoints]);
        const bottomSheetRef = useRef<BottomSheet>(null);
        const colors = useColors();

        useImperativeHandle(ref, () => ({
            open: () => {
                if (bottomSheetRef.current) {
                    bottomSheetRef.current.snapToIndex(0);
                }
            },
            close: () => {
                bottomSheetRef.current?.close();
            },
        }));

        // Overlay/Backdrop Component
        const renderBackdrop = useMemo(
            () =>
                showOverlay
                    ? (props: BottomSheetBackdropProps) => (
                        <BottomSheetBackdrop
                            {...props}
                            disappearsOnIndex={-1}
                            appearsOnIndex={0}
                            opacity={0.5}
                        />
                    )
                    : undefined,
            [showOverlay]
        );

        return (
            <BottomSheet
                snapPoints={snapPoints}
                index={-1}
                ref={bottomSheetRef}
                enablePanDownToClose={enablePanDownToClose}
                backdropComponent={renderBackdrop}
                enableHandlePanningGesture={enablePanDownToClose}
                handleIndicatorStyle={{
                    backgroundColor: colors.accent, // Orange accent color
                    height: 4,
                    borderRadius: 2,
                    width: 50,
                }}
                backgroundStyle={{ backgroundColor: colors.background }}
                onClose={onClose}
                accessible={true}
                // @ts-ignore
                focusable={true}
                // @ts-ignore
                onMagicTap={onClose}
                style={{
                    zIndex: 1000,
                    elevation: 1000,
                }}
                {...otherProps}
            >
                {scrollable ? children : (
                    <BottomSheetView style={{ flex: 1 }}>
                        {children}
                    </BottomSheetView>
                )}
            </BottomSheet>
        );
    }
);

AppBottomSheet.displayName = 'AppBottomSheet';

export default AppBottomSheet;
