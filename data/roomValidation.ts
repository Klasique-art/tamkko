import * as Yup from 'yup';

export const RoomCreateValidationSchema = Yup.object().shape({
    name: Yup.string().trim().min(3).max(80).required('Room name is required'),
    description: Yup.string().trim().max(300),
    entry_fee_ghs: Yup.string()
        .trim()
        .matches(/^(\d{1,2})(\.\d{1,2})?$/, 'Entry fee must be a valid amount with max 2 digits and up to 2 decimals.')
        .required('Entry fee is required'),
});
