import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';

import { Nav, Screen } from '@/components';
import { AppErrorMessage, AppForm, AppFormField, FormLoader, SubmitButton } from '@/components/form';
import AppText from '@/components/ui/AppText';
import { useColors } from '@/config/colors';
import { useToast } from '@/context/ToastContext';
import { passwordSettingsValidationSchema } from '@/data/accountValidation';
import { authService } from '@/lib/services/authService';
import { PasswordSettingsFormValues } from '@/types/account.types';

const ChangePasswordScreen = () => {
    const router = useRouter();
    const colors = useColors();
    const { showToast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [apiError, setApiError] = useState('');

    const initialValues: PasswordSettingsFormValues = {
        current_password: '',
        new_password: '',
        confirm_password: '',
    };

    const extractFirstErrorText = (value: unknown): string | null => {
        if (typeof value === 'string') return value;
        if (Array.isArray(value)) {
            for (const item of value) {
                const found = extractFirstErrorText(item);
                if (found) return found;
            }
            return null;
        }
        if (value && typeof value === 'object') {
            for (const nested of Object.values(value as Record<string, unknown>)) {
                const found = extractFirstErrorText(nested);
                if (found) return found;
            }
        }
        return null;
    };

    const handleSubmit = async (values: PasswordSettingsFormValues) => {
        setIsLoading(true);
        setApiError('');

        try {
            await authService.setPassword({
                current_password: values.current_password,
                new_password: values.new_password,
                re_new_password: values.confirm_password,
            });

            showToast('Password changed successfully', { variant: 'success' });
            router.back();
        } catch (error: any) {
            const data = error?.response?.data;
            const parsedError =
                extractFirstErrorText(data?.error?.details?.error?.details) ||
                extractFirstErrorText(data?.error?.details?.error?.message) ||
                extractFirstErrorText(data?.error?.details?.message) ||
                extractFirstErrorText(data?.error?.details) ||
                extractFirstErrorText(data?.error?.message) ||
                extractFirstErrorText(data?.detail) ||
                extractFirstErrorText(data?.message) ||
                extractFirstErrorText(data?.error) ||
                'Failed to update your password. Please try again.';

            setApiError(parsedError);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Screen>
            <Nav title="Change Password" />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={{ flex: 1 }}
            >
                <ScrollView
                    className="pt-4"
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 40 }}
                >
                    <AppForm
                        initialValues={initialValues}
                        validationSchema={passwordSettingsValidationSchema}
                        onSubmit={handleSubmit}
                    >
                        <View className="mb-2">
                            <AppText className="text-lg font-bold mb-2" style={{ color: colors.textPrimary }}>
                                Security
                            </AppText>
                            <AppText className="text-sm" style={{ color: colors.textSecondary }}>
                                Use a strong password that you do not use anywhere else.
                            </AppText>
                        </View>

                        <AppFormField
                            name="current_password"
                            label="Current Password"
                            type="password"
                            placeholder="Enter your current password"
                            icon="eye"
                            iconAria="Toggle current password visibility"
                            required
                        />

                        <AppFormField
                            name="new_password"
                            label="New Password"
                            type="password"
                            placeholder="Create a new password"
                            icon="eye"
                            iconAria="Toggle new password visibility"
                            required
                        />

                        <AppFormField
                            name="confirm_password"
                            label="Confirm New Password"
                            type="password"
                            placeholder="Re-enter your new password"
                            icon="eye"
                            iconAria="Toggle confirm password visibility"
                            required
                        />

                        <View
                            className="rounded-xl p-4"
                            style={{
                                backgroundColor: colors.backgroundAlt,
                                borderWidth: 1,
                                borderColor: colors.border,
                            }}
                        >
                            <AppText className="text-sm font-semibold mb-2" style={{ color: colors.textPrimary }}>
                                Password requirements
                            </AppText>
                            <AppText className="text-xs mb-1" style={{ color: colors.textSecondary }}>
                                - At least 8 characters
                            </AppText>
                            <AppText className="text-xs mb-1" style={{ color: colors.textSecondary }}>
                                - At least one uppercase and one lowercase letter
                            </AppText>
                            <AppText className="text-xs mb-1" style={{ color: colors.textSecondary }}>
                                - At least one number
                            </AppText>
                            <AppText className="text-xs" style={{ color: colors.textSecondary }}>
                                - At least one special character
                            </AppText>
                        </View>

                        <AppErrorMessage error={apiError} visible={!!apiError} />

                        <SubmitButton title="Update Password" />
                    </AppForm>
                </ScrollView>
            </KeyboardAvoidingView>

            <FormLoader visible={isLoading} message="Updating Password..." />
        </Screen>
    );
};

export default ChangePasswordScreen;
