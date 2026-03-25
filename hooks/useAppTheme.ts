import { useMemo } from 'react';

import { useColors } from '@/config/colors';
import { useTheme } from '@/context/ThemeContext';

export const useAppTheme = () => {
    const colors = useColors();
    const { theme, setTheme, toggleTheme } = useTheme();

    return useMemo(
        () => ({
            theme,
            isDark: theme === 'dark',
            colors,
            setTheme,
            toggleTheme,
        }),
        [colors, setTheme, theme, toggleTheme]
    );
};
