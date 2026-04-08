import { CreateImageFilter, CreateVisibility } from '@/types/create.types';

export const createVisibilityOptions: { value: CreateVisibility; label: string; description: string }[] = [
    {
        value: 'public',
        label: 'Free',
        description: 'Anyone can watch this post (default).',
    },
    {
        value: 'premium',
        label: 'Paid (Subscribers)',
        description: 'Only active subscribers can view this post.',
    },
    {
        value: 'followers_only',
        label: 'Followers',
        description: 'Only your followers can watch this post.',
    },
    {
        value: 'private',
        label: 'Private',
        description: 'Only you can view this post.',
    },
];

export const imageFilterOptions: { value: CreateImageFilter; label: string }[] = [
    { value: 'original', label: 'Original' },
    { value: 'mono', label: 'Mono' },
    { value: 'warm', label: 'Warm' },
];

export const CREATE_MAX_RECORDING_SECONDS = 60;
export const CREATE_MAX_CAPTION_LENGTH = 220;
