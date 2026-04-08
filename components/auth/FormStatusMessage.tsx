import { useFormikContext } from 'formik';
import React from 'react';

import AppErrorMessage from '@/components/form/AppErrorMessage';

type StatusShape = {
    error?: string;
};

export default function FormStatusMessage() {
    const { status } = useFormikContext<{ [key: string]: unknown }>();
    const error = (status as StatusShape | undefined)?.error;

    return <AppErrorMessage error={error} visible={Boolean(error)} />;
}
