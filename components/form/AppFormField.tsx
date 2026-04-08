import { useFormikContext } from 'formik';
import { KeyboardTypeOptions, View } from 'react-native';

import AppErrorMessage from './AppErrorMessage';
import AppInput from './AppInput';
import SelectInput from './SelectInput';
import DateInput from './DateInput';

type FormFieldValues = Record<string, unknown>;
type Option = { value: string; label: string };

type Props<Values extends FormFieldValues = FormFieldValues> = {
    name: keyof Values & string;
    label: string;
    multiline?: boolean;
    numberOfLines?: number;
    styles?: string;
    options?: Option[];
    type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'select' | 'date';
    required?: boolean;
    placeholder?: string;
    min?: string;
    max?: string;
    icon?: string;
    iconAria?: string;
    iconClick?: () => void;
};

const AppFormField = <Values extends FormFieldValues = FormFieldValues>({
    name,
    label,
    multiline = false,
    numberOfLines = 4,
    styles,
    options = [],
    type = 'text',
    required = false,
    placeholder,
    min,
    max,
    icon,
    iconAria,
    iconClick,
}: Props<Values>) => {
    const { errors, setFieldTouched, setFieldValue, touched, values } = useFormikContext<Values>();

    const error = errors[name] as string;
    const isTouched = touched[name] as boolean;
    const value = String(values[name] ?? '');

    // Map type to keyboard type
    const getKeyboardType = (): KeyboardTypeOptions => {
        switch (type) {
            case 'email':
                return 'email-address';
            case 'number':
                return 'numeric';
            case 'tel':
                return 'phone-pad';
            case 'url':
                return 'url';
            default:
                return 'default';
        }
    };

    // Handle change for different input types
    const handleChange = (text: string) => {
        setFieldValue(name as string, text);
    };

    const handleBlur = () => {
        setFieldTouched(name as string);
    };

    return (
        <View className={`flex flex-col gap-2 ${styles || ''}`}>
            {type === 'select' ? (
                <SelectInput
                    name={name}
                    label={label}
                    value={value}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    options={options}
                    required={required}
                    placeholder={placeholder}
                />
            ) : type === 'date' ? (
                <DateInput
                    name={name}
                    label={label}
                    value={value}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required={required}
                    min={min}
                    max={max}
                />
            ) : (
                <AppInput
                    name={name}
                    label={label}
                    multiline={multiline}
                    numberOfLines={numberOfLines}
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={value}
                    required={required}
                    placeholder={placeholder}
                    keyboardType={getKeyboardType()}
                    secureTextEntry={type === 'password'}
                    autoCapitalize={type === 'email' ? 'none' : 'sentences'}
                    icon={icon as any}
                    iconAria={iconAria}
                    iconClick={iconClick}
                />
            )}
            <AppErrorMessage error={error} visible={isTouched} />
        </View>
    );
};

export default AppFormField;
