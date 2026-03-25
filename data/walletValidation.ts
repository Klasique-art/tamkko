import * as Yup from 'yup';

export const WalletWithdrawalValidationSchema = Yup.object().shape({
    amount: Yup.number().typeError('Amount is required').positive('Amount must be greater than zero').required('Amount is required'),
    phone_number: Yup.string().trim().required('Phone number is required'),
    network: Yup.string().oneOf(['mtn', 'vodafone', 'airteltigo']).required('Network is required'),
});
