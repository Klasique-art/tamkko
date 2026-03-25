import * as Yup from 'yup';

export const RoomCreateValidationSchema = Yup.object().shape({
    name: Yup.string().trim().min(3).max(80).required('Room name is required'),
    description: Yup.string().trim().max(300),
    entry_fee: Yup.number().typeError('Entry fee must be a number').min(0).required('Entry fee is required'),
    capacity: Yup.number().typeError('Capacity must be a number').min(2).max(500).required('Capacity is required'),
});
