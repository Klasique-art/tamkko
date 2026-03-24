import React, { createContext, useContext, useMemo, useState } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import AppToast, { ToastVariant } from '@/components/ui/AppToast';

type ToastOptions = {
    variant?: ToastVariant;
    duration?: number;
};

type ToastState = {
    message: string;
    variant: ToastVariant;
    duration: number;
    visible: boolean;
};

interface ToastContextType {
    showToast: (message: string, options?: ToastOptions) => void;
    hideToast: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const defaultToastState: ToastState = {
    message: '',
    variant: 'info',
    duration: 5200,
    visible: false,
};

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
    const insets = useSafeAreaInsets();
    const [toast, setToast] = useState<ToastState>(defaultToastState);

    const hideToast = () => {
        setToast((prev) => ({ ...prev, visible: false }));
    };

    const showToast = (message: string, options?: ToastOptions) => {
        setToast({
            message,
            variant: options?.variant || 'info',
            duration: options?.duration || 5200,
            visible: true,
        });
    };

    const value = useMemo(
        () => ({
            showToast,
            hideToast,
        }),
        []
    );

    return (
        <ToastContext.Provider value={value}>
            {children}
            <View
                pointerEvents="box-none"
                style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    top: insets.top + 16,
                    zIndex: 50,
                }}
            >
                <AppToast
                    visible={toast.visible}
                    message={toast.message}
                    variant={toast.variant}
                    duration={toast.duration}
                    onHide={hideToast}
                />
            </View>
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};
