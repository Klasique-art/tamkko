import { useFormikContext } from 'formik';
import AppButton from '../ui/AppButton';

type Props = {
    title: string;
    forceEnable?: boolean;
    onPress?: () => void;
};

const SubmitButton = ({ title, forceEnable = false, onPress }: Props) => {
    const { handleSubmit, isValid, dirty, isSubmitting } = useFormikContext();

    const isDisabled = forceEnable
        ? isSubmitting
        : !(isValid && dirty) || isSubmitting;

    const handlePress = () => {
        if (!isDisabled) {
            if (onPress) {
                onPress();
            } else {
                handleSubmit();
            }
        }
    };

    return (
        <AppButton
            title={isSubmitting ? 'Submitting...' : title}
            variant="primary"
            size="lg"
            fullWidth
            disabled={isDisabled}
            onClick={handlePress}
            className={isDisabled ? 'opacity-50' : ''}
        />
    );
};

export default SubmitButton;
