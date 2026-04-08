import type { BottomSheetBackdropProps } from '@gorhom/bottom-sheet';
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
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
    (
        {
            children,
            onClose,
            snapPoints: customSnapPoints = ['40%'],
            showOverlay = true,
            enablePanDownToClose = true,
            scrollable = false,
            ...otherProps
        },
        ref
    ) => {
        const snapPoints = useMemo(() => customSnapPoints, [customSnapPoints]);
        const modalRef = useRef<BottomSheetModal>(null);
        const colors = useColors();

        useImperativeHandle(ref, () => ({
            open: () => {
                modalRef.current?.present();
                requestAnimationFrame(() => {
                    modalRef.current?.snapToIndex(0);
                });
            },
            close: () => {
                modalRef.current?.dismiss();
            },
        }));

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
            <BottomSheetModal
                ref={modalRef}
                snapPoints={snapPoints}
                index={0}
                enableDynamicSizing={false}
                animateOnMount
                enablePanDownToClose={enablePanDownToClose}
                backdropComponent={renderBackdrop}
                enableHandlePanningGesture={enablePanDownToClose}
                handleIndicatorStyle={{
                    backgroundColor: colors.accent,
                    height: 4,
                    borderRadius: 2,
                    width: 50,
                }}
                backgroundStyle={{ backgroundColor: colors.background }}
                onDismiss={onClose}
                {...otherProps}
            >
                {scrollable ? children : <BottomSheetView style={{ flex: 1 }}>{children}</BottomSheetView>}
            </BottomSheetModal>
        );
    }
);

AppBottomSheet.displayName = 'AppBottomSheet';

export default AppBottomSheet;
