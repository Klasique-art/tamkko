import { Href, router, useLocalSearchParams } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, View } from 'react-native';
import { OtpInput } from 'react-native-otp-entry';

import AppErrorMessage from '@/components/form/AppErrorMessage';
import FormLoader from '@/components/form/FormLoader';
import AppButton from '@/components/ui/AppButton';
import AppText from '@/components/ui/AppText';
import Screen from '@/components/ui/Screen';
import { useColors } from '@/config/colors';
import { useAuth } from '@/context/AuthContext';
import { authService } from '@/lib/services/authService';

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

const VerifyCodeScreen = () => {
    const colors = useColors();
    const { verifySignupCode } = useAuth();
    const params = useLocalSearchParams<{ email?: string }>();

    const email = useMemo(() => String(params.email ?? '').trim(), [params.email]);
    const [code, setCode] = useState('');
    const [apiError, setApiError] = useState('');
    const [infoMessage, setInfoMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isResending, setIsResending] = useState(false);

    const handleVerify = async () => {
        if (!email) {
            setApiError('Missing email for verification. Please register again.');
            return;
        }

        if (code.length < 6) {
            setApiError('Enter the 6-digit verification code.');
            return;
        }

        try {
            setApiError('');
            setInfoMessage('');
            setIsSubmitting(true);

            await verifySignupCode(email, code);
            router.replace('/(tabs)' as Href);
        } catch (error: any) {
            const data = error?.response?.data;
            const parsedError =
                extractFirstErrorText(data?.error?.details?.error?.details) ||
                extractFirstErrorText(data?.error?.details?.error?.message) ||
                extractFirstErrorText(data?.error?.details) ||
                extractFirstErrorText(data?.error?.message) ||
                extractFirstErrorText(data?.detail) ||
                extractFirstErrorText(data?.message) ||
                extractFirstErrorText(data?.error) ||
                error?.message ||
                'Verification failed. Please check the code and try again.';

            setApiError(parsedError);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleResendCode = async () => {
        if (!email) {
            setApiError('Missing email for verification. Please register again.');
            return;
        }

        try {
            setApiError('');
            setInfoMessage('');
            setIsResending(true);
            await authService.resendVerificationCode({ email });
            setInfoMessage('A new verification code has been sent to your email.');
        } catch (error: any) {
            const data = error?.response?.data;
            const parsedError =
                extractFirstErrorText(data?.error?.details?.error?.details) ||
                extractFirstErrorText(data?.error?.details?.error?.message) ||
                extractFirstErrorText(data?.error?.details) ||
                extractFirstErrorText(data?.error?.message) ||
                extractFirstErrorText(data?.detail) ||
                extractFirstErrorText(data?.message) ||
                extractFirstErrorText(data?.error) ||
                'Could not resend verification code. Please try again.';
            setApiError(parsedError);
        } finally {
            setIsResending(false);
        }
    };

    return (
        <Screen>
            <KeyboardAvoidingView
                className="flex-1"
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 16 : 0}
            >
                <ScrollView
                    className="flex-1"
                    contentContainerStyle={{ paddingVertical: 24, paddingBottom: 40 }}
                    keyboardShouldPersistTaps="always"
                    keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
                    automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
                    showsVerticalScrollIndicator={false}
                    nestedScrollEnabled
                >
                    <View
                        className="rounded-2xl border p-5"
                        style={{ backgroundColor: colors.backgroundAlt, borderColor: colors.border }}
                    >
                        <AppText className="mb-2 text-2xl font-bold">Enter Verification Code</AppText>
                        <AppText className="mb-1 text-sm" color={colors.textSecondary}>
                            We sent a verification code to:
                        </AppText>
                        <AppText className="mb-6 text-sm font-semibold" color={colors.textPrimary}>
                            {email || 'No email provided'}
                        </AppText>

                        <OtpInput
                            numberOfDigits={6}
                            onTextChange={setCode}
                            onFilled={setCode}
                            focusColor={colors.accent}
                            theme={{
                                pinCodeContainerStyle: {
                                    borderColor: colors.border,
                                    backgroundColor: colors.background,
                                },
                                focusedPinCodeContainerStyle: {
                                    borderColor: colors.accent,
                                },
                                pinCodeTextStyle: {
                                    color: colors.textPrimary,
                                    fontSize: 18,
                                    fontWeight: '700',
                                },
                            }}
                        />

                        <View className="mt-4">
                            <AppErrorMessage error={apiError} visible={!!apiError} />
                            {infoMessage ? (
                                <View
                                    className="mt-2 rounded-lg p-3"
                                    style={{ backgroundColor: `${colors.success}15`, borderWidth: 1, borderColor: `${colors.success}55` }}
                                >
                                    <AppText className="text-sm font-semibold" color={colors.success}>
                                        {infoMessage}
                                    </AppText>
                                </View>
                            ) : null}
                        </View>

                        <View className="mt-4">
                            <AppButton
                                title="Verify and Continue"
                                fullWidth
                                onClick={handleVerify}
                                loading={isSubmitting}
                                disabled={isSubmitting || code.length < 6}
                            />
                        </View>

                        <View className="mt-4 items-center">
                            <TouchableOpacity
                                onPress={handleResendCode}
                                accessibilityRole="button"
                                accessibilityLabel="Resend verification code"
                                disabled={isResending || isSubmitting}
                            >
                                <AppText className="text-sm font-semibold" color={colors.accent}>
                                    {isResending ? 'Resending code...' : "Didn't get a code? Resend"}
                                </AppText>
                            </TouchableOpacity>
                        </View>

                        <View className="mt-5 flex-row justify-center">
                            <AppText className="text-sm" color={colors.textSecondary}>
                                Already verified?{' '}
                            </AppText>
                            <TouchableOpacity
                                onPress={() => router.replace('/(auth)/login' as Href)}
                                accessibilityRole="button"
                                accessibilityLabel="Go to login"
                            >
                                <AppText className="text-sm font-semibold" color={colors.accent}>
                                    Sign In
                                </AppText>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            <FormLoader visible={isSubmitting} message="Verifying your code..." />
        </Screen>
    );
};

export default VerifyCodeScreen;
