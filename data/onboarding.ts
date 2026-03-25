export interface OnboardingSlide {
    id: number;
    title: string;
    description: string;
    details: string[];
    icon: string;
}

export const onboardingSlides: OnboardingSlide[] = [
    {
        id: 1,
        title: 'Welcome',
        description: 'Start from a clean mobile starter and shape it into your next product.',
        details: [
            'Simple, reusable project structure.',
            'NativeWind and Expo setup already in place.',
            'Ready for new features and APIs.',
        ],
        icon: 'sparkles-outline',
    },
    {
        id: 2,
        title: 'Build Fast',
        description: 'Use this app as a blank base for navigation, screens, and UI experiments.',
        details: [
            'Swap placeholder screens with real flows.',
            'Keep components modular from day one.',
            'Iterate quickly with Expo hot reload.',
        ],
        icon: 'construct-outline',
    },
    {
        id: 3,
        title: 'You Are Ready',
        description: 'Complete onboarding and jump into the starter tabs to begin building.',
        details: [
            'Everything is generic by default.',
            'No app-specific business logic in the starter flow.',
            'Use this as your launchpad.',
        ],
        icon: 'rocket-outline',
    },
];

export const ONBOARDING_SEEN_KEY = '@tamkko_onboarding_seen';
