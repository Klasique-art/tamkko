import React, { ReactNode } from "react";
import { StyleProp, Text, TextProps, TextStyle } from "react-native";
import { useTranslation } from 'react-i18next';

import { useColors } from "@/config/colors";

interface AppTextProps extends TextProps {
    children: ReactNode;
    styles?: string;
    className?: string;
    color?: string;
    style?: StyleProp<TextStyle>;
    disableTranslation?: boolean;
}

const AppText: React.FC<AppTextProps> = ({
    children,
    className = "",
    style,
    color,
    disableTranslation = false,
    ...otherProps
}) => {
    const colors = useColors();
    const { t } = useTranslation();

    // Default to textPrimary color if no color specified
    const textColor = color || colors.textPrimary;

    const translateChildren = (node: ReactNode): ReactNode => {
        if (disableTranslation) return node;

        if (typeof node === 'string') return t(node);
        if (Array.isArray(node)) return node.map((item, index) => <React.Fragment key={index}>{translateChildren(item)}</React.Fragment>);
        return node;
    };

    return (
        <Text
            className={className}
            style={[{ color: textColor }, style]}
            {...otherProps}
        >
            {translateChildren(children)}
        </Text>
    );
};

export default AppText;
