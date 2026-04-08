import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { Ionicons } from '@expo/vector-icons';
import React, { forwardRef, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';

import AppBottomSheet, { AppBottomSheetRef } from '@/components/ui/AppBottomSheet';
import AppButton from '@/components/ui/AppButton';
import AppText from '@/components/ui/AppText';
import { tipCurrency, tipPresetAmounts } from '@/data/mock';
import { SimulatedTipPayload, TipFlowStep } from '@/types/tip.types';
import { VideoItem } from '@/types/video.types';

type TipBottomSheetProps = {
    video?: VideoItem | null;
    onClosed?: () => void;
    onTipSuccess?: (payload: SimulatedTipPayload) => void;
};

const formatCurrency = (amount: number) => `${tipCurrency} ${amount.toFixed(2)}`;

const makeReference = () => `TIP-${Date.now().toString().slice(-8)}`;

const normalizePhone = (value: string) => value.replace(/[^\d+]/g, '');

const isValidMomoNumber = (value: string) => /^\+?\d{10,15}$/.test(value);

const TipBottomSheet = forwardRef<AppBottomSheetRef, TipBottomSheetProps>(
    ({ video, onClosed, onTipSuccess }, ref) => {
        const sheetRef = useRef<AppBottomSheetRef>(null);
        const [selectedAmount, setSelectedAmount] = useState<number>(tipPresetAmounts[1] ?? 10);
        const [customAmount, setCustomAmount] = useState('');
        const [momoNumber, setMomoNumber] = useState('');
        const [formError, setFormError] = useState<string | null>(null);
        const [step, setStep] = useState<TipFlowStep>('form');
        const [pendingAmount, setPendingAmount] = useState<number | null>(null);
        const [isSendingRequest, setIsSendingRequest] = useState(false);

        const resolvedAmount = useMemo(() => {
            const parsedCustom = Number(customAmount.trim());
            if (customAmount.trim().length > 0 && Number.isFinite(parsedCustom)) {
                return parsedCustom;
            }
            return selectedAmount;
        }, [customAmount, selectedAmount]);

        const resetState = () => {
            setSelectedAmount(tipPresetAmounts[1] ?? 10);
            setCustomAmount('');
            setMomoNumber('');
            setFormError(null);
            setStep('form');
            setPendingAmount(null);
            setIsSendingRequest(false);
        };

        useImperativeHandle(ref, () => ({
            open: () => {
                resetState();
                sheetRef.current?.open();
            },
            close: () => {
                sheetRef.current?.close();
            },
        }));

        const handleClose = () => {
            resetState();
            onClosed?.();
        };

        const handleSubmit = () => {
            const amount = resolvedAmount;
            const normalizedPhone = normalizePhone(momoNumber.trim());

            if (!video) {
                setFormError('No creator selected for this tip.');
                return;
            }

            if (!Number.isFinite(amount) || amount <= 0) {
                setFormError('Enter a valid amount above 0.');
                return;
            }

            if (!isValidMomoNumber(normalizedPhone)) {
                setFormError('Enter a valid MTN MoMo number (10-15 digits).');
                return;
            }

            setFormError(null);
            setPendingAmount(amount);
            setIsSendingRequest(true);

            setTimeout(() => {
                setIsSendingRequest(false);
                setStep('awaiting_approval');
            }, 900);
        };

        const handleApprove = () => {
            if (!video || pendingAmount === null) return;

            const payload: SimulatedTipPayload = {
                creatorHandle: video.creatorUsername,
                videoId: video.id,
                amount: pendingAmount,
                momoNumber: normalizePhone(momoNumber.trim()),
                currency: tipCurrency,
                reference: makeReference(),
                createdAt: new Date().toISOString(),
            };

            onTipSuccess?.(payload);
            setStep('success');
        };

        return (
            <AppBottomSheet ref={sheetRef} snapPoints={['68%']} onClose={handleClose}>
                <View className="flex-1 px-5 pb-6 pt-2">
                    <AppText className="text-lg font-bold" color="#111111">
                        Tip Creator
                    </AppText>
                    <AppText className="mt-1 text-sm" color="#444444">
                        Support {video?.creatorUsername ?? 'this creator'} with MTN MoMo.
                    </AppText>

                    {step === 'form' ? (
                        <View className="mt-5">
                            <AppText className="text-sm font-semibold" color="#111111">
                                Choose Amount
                            </AppText>
                            <View className="mt-3 flex-row flex-wrap gap-2">
                                {tipPresetAmounts.map((amount) => {
                                    const isActive = customAmount.length === 0 && selectedAmount === amount;
                                    return (
                                        <Pressable
                                            key={amount}
                                            onPress={() => {
                                                setSelectedAmount(amount);
                                                setCustomAmount('');
                                            }}
                                            className="rounded-full border px-4 py-2"
                                            style={{
                                                borderColor: isActive ? '#111111' : '#D4D4D8',
                                                backgroundColor: isActive ? '#111111' : '#FFFFFF',
                                            }}
                                            accessibilityRole="button"
                                            accessibilityLabel={`Select ${formatCurrency(amount)}`}
                                            accessibilityState={{ selected: isActive }}
                                        >
                                            <AppText className="text-sm font-semibold" color={isActive ? '#FFFFFF' : '#111111'}>
                                                {formatCurrency(amount)}
                                            </AppText>
                                        </Pressable>
                                    );
                                })}
                            </View>

                            <AppText className="mt-4 text-sm font-semibold" color="#111111">
                                Custom Amount
                            </AppText>
                            <BottomSheetTextInput
                                value={customAmount}
                                onChangeText={setCustomAmount}
                                placeholder={`e.g. ${tipPresetAmounts[0] ?? 5}`}
                                keyboardType="decimal-pad"
                                style={{
                                    marginTop: 8,
                                    borderWidth: 1,
                                    borderColor: '#D4D4D8',
                                    borderRadius: 12,
                                    paddingHorizontal: 14,
                                    paddingVertical: 12,
                                    color: '#111111',
                                    fontSize: 16,
                                }}
                                accessibilityLabel="Custom tip amount"
                                accessibilityHint="Enter the amount you want to send"
                            />

                            <AppText className="mt-4 text-sm font-semibold" color="#111111">
                                MTN MoMo Number
                            </AppText>
                            <BottomSheetTextInput
                                value={momoNumber}
                                onChangeText={setMomoNumber}
                                placeholder="e.g. 0241234567"
                                keyboardType="phone-pad"
                                style={{
                                    marginTop: 8,
                                    borderWidth: 1,
                                    borderColor: '#D4D4D8',
                                    borderRadius: 12,
                                    paddingHorizontal: 14,
                                    paddingVertical: 12,
                                    color: '#111111',
                                    fontSize: 16,
                                }}
                                accessibilityLabel="MTN mobile money number"
                                accessibilityHint="Enter your number to receive the payment prompt"
                            />

                            {formError ? (
                                <AppText className="mt-3 text-sm font-semibold" color="#B91C1C">
                                    {formError}
                                </AppText>
                            ) : null}

                            <View className="mt-5">
                                <AppButton
                                    title={isSendingRequest ? 'Sending Prompt...' : `Send ${formatCurrency(resolvedAmount)}`}
                                    onClick={handleSubmit}
                                    loading={isSendingRequest}
                                    accessibilityLabel="Send tip request"
                                    accessibilityHint="Starts MTN MoMo payment prompt"
                                />
                            </View>
                        </View>
                    ) : null}

                    {step === 'awaiting_approval' ? (
                        <View className="mt-8 items-center">
                            <ActivityIndicator size="large" color="#111111" />
                            <AppText className="mt-5 text-center text-base font-semibold" color="#111111">
                                USSD Prompt Sent
                            </AppText>
                            <AppText className="mt-2 text-center text-sm" color="#444444">
                                We sent {formatCurrency(pendingAmount ?? 0)} to {normalizePhone(momoNumber)}. Approve it on your phone.
                            </AppText>

                            <View className="mt-6 w-full">
                                <AppButton
                                    title="I Approved on My Phone"
                                    onClick={handleApprove}
                                    accessibilityLabel="Confirm payment approval"
                                />
                            </View>
                        </View>
                    ) : null}

                    {step === 'success' ? (
                        <View className="mt-8 items-center">
                            <Ionicons name="checkmark-circle" size={56} color="#111111" />
                            <AppText className="mt-4 text-center text-base font-bold" color="#111111">
                                Tip Sent Successfully
                            </AppText>
                            <AppText className="mt-2 text-center text-sm" color="#444444">
                                {formatCurrency(pendingAmount ?? 0)} tip confirmed for {video?.creatorUsername ?? 'creator'}.
                            </AppText>
                            <View className="mt-6 w-full">
                                <AppButton
                                    title="Done"
                                    onClick={() => sheetRef.current?.close()}
                                    accessibilityLabel="Close tip sheet"
                                />
                            </View>
                        </View>
                    ) : null}
                </View>
            </AppBottomSheet>
        );
    }
);

TipBottomSheet.displayName = 'TipBottomSheet';

export default TipBottomSheet;
