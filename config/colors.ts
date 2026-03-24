import { useTheme } from '@/context/ThemeContext';

export type Theme = 'light' | 'dark';

interface ColorScheme {
    // Primary colors (Deep Brown - The Fourth Book brand)
    primary: string;
    primary50: string;
    primary100: string;
    primary200: string;

    // Accent colors (Orange, Yellow, Green, Blue)
    accent: string;
    accent50: string;
    accent100: string;

    // Base colors
    white: string;
    black: string;

    // Background colors
    background: string;
    backgroundAlt: string;

    // Text colors
    textPrimary: string;
    textSecondary: string;

    // Border
    border: string;

    // Status colors
    success: string;
    error: string;
    warning: string;
    info: string;
}

const lightColors: ColorScheme = {
    // Primary colors (Deep Brown - The Fourth Book brand)
    primary: '#571217',      // Deep Brown - main brand color
    primary50: '#8B1E24',    // Lighter brown variant
    primary100: '#6E1A1D',   // Medium brown variant
    primary200: '#3D0C10',   // Darker brown variant

    // Accent colors
    accent: '#F38218',       // Orange - primary accent color
    accent50: '#FFA85C',     // Light orange - lighter variant
    accent100: '#E67200',    // Dark orange - darker variant

    // Base colors
    white: '#FFFFFF',
    black: '#000000',

    // Background colors
    background: '#FFFFFF',
    backgroundAlt: '#F5F1E8', // Warm cream/beige background

    // Text colors
    textPrimary: '#1A1A1A',
    textSecondary: '#666666',

    // Border
    border: '#E5E5E5',

    // Status colors
    success: '#1A760D',      // Green - success states (brand green)
    error: '#DC2626',        // Red - error states
    warning: '#F8B735',      // Yellow - warning states (brand yellow)
    info: '#040F40',         // Deep Blue - info states (brand blue)
};

const darkColors: ColorScheme = {
    // Primary colors (keep brand colors consistent)
    primary: '#571217',      // Deep Brown - main brand color
    primary50: '#8B1E24',    // Lighter brown variant
    primary100: '#6E1A1D',   // Medium brown variant
    primary200: '#3D0C10',   // Darker brown variant

    // Accent colors
    accent: '#F38218',       // Orange - primary accent color
    accent50: '#4A2A0F',     // Dark orange - subtle accent for dark mode
    accent100: '#E67200',    // Dark orange - stronger accent

    // Base colors
    white: '#FFFFFF',
    black: '#000000',

    // Background colors
    background: '#121212',   // Dark background
    backgroundAlt: '#1E1E1E', // Slightly lighter dark background

    // Text colors
    textPrimary: '#FFFFFF',  // White text
    textSecondary: '#B0B0B0', // Light gray text

    // Border
    border: '#2C2C2C',       // Dark border

    // Status colors
    success: '#1A760D',      // Green - success states (brand green)
    error: '#DC2626',        // Red - error states
    warning: '#F8B735',      // Yellow - warning states (brand yellow)
    info: '#0000ff',         // Deep Blue - info states (brand blue)
};

export const getColors = (theme: Theme): ColorScheme => {
    return theme === 'dark' ? darkColors : lightColors;
};

// Hook to get colors based on current theme
export const useColors = (): ColorScheme => {
    const { theme } = useTheme();
    return getColors(theme);
};

// Default export for backward compatibility (light theme)
export default lightColors;

