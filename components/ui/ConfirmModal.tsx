import React from 'react';

import AppModal from '@/components/ui/AppModal';
import ConfirmAction from '@/components/ui/ConfirmAction';

type ConfirmModalProps = {
    visible: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    description?: string;
    confirmText?: string;
    isDestructive?: boolean;
};

export default function ConfirmModal({
    visible,
    onClose,
    onConfirm,
    title = 'Confirm Action',
    description = 'Are you sure you want to proceed?',
    confirmText = 'Confirm',
    isDestructive = true,
}: ConfirmModalProps) {
    return (
        <AppModal visible={visible} onClose={onClose} showCloseButton={false} closeOnBackdropPress>
            <ConfirmAction
                onConfirm={onConfirm}
                onCancel={onClose}
                title={title}
                desc={description}
                confirmBtnTitle={confirmText}
                isDestructive={isDestructive}
            />
        </AppModal>
    );
}
