export interface OnboardingSlide {
    id: number;
    title: string;
    description: string;
    details: string[];
    icon: string;
    colors: [string, string];
}

export const onboardingSlides: OnboardingSlide[] = [
    {
        id: 1,
        title: 'Build Impact Together',
        description:
            'Join a growing community contributing monthly to create meaningful financial impact across the diaspora.',
        details: [
            'Contribute alongside members in a shared monthly cycle.',
            'Track how your participation supports collective progress.',
            'Be part of a structured and transparent community model.',
        ],
        icon: 'people',
        colors: ['#571217', '#8B1E24'],
    },
    {
        id: 2,
        title: 'Enter Monthly Cycles',
        description:
            'With your monthly contribution, you stay eligible for the next draw cycle and all related updates.',
        details: [
            'Eligibility is tied to successful contribution for that month.',
            'Each cycle resets, giving active members fresh opportunity.',
            'Stay informed with reminders and status updates.',
        ],
        icon: 'calendar',
        colors: ['#F38218', '#E67200'],
    },
    {
        id: 3,
        title: 'Track Everything Clearly',
        description:
            'Follow contributions, notifications, draw history, and payout status in one transparent dashboard.',
        details: [
            'View contribution and participation history in one place.',
            'Monitor notification updates and important account events.',
            'Follow payout and draw outcomes with clear status states.',
        ],
        icon: 'analytics',
        colors: ['#040F40', '#1A2A6B'],
    },
    {
        id: 4,
        title: 'Ready To Get Started',
        description:
            'Set your preferences, stay active each month, and move forward with confidence in every cycle.',
        details: [
            'Choose language and appearance settings from profile.',
            'Manage account and security details anytime.',
            'Start with confidence and keep your monthly streak active.',
        ],
        icon: 'rocket',
        colors: ['#1A760D', '#145A0A'],
    },
];

export const ONBOARDING_SEEN_KEY = '@thefourthbook_onboarding_seen';
