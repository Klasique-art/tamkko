export type CreateMediaType = 'image' | 'video';

export type CreateVisibility = 'public' | 'followers_only' | 'private';

export type CreateImageFilter = 'original' | 'mono' | 'warm';

export type SelectedCreateMedia = {
    uri: string;
    type: CreateMediaType;
    fileName?: string | null;
    fileSize?: number | null;
    width?: number;
    height?: number;
    durationMs?: number;
    thumbnailUri?: string;
};

export type CreateDraft = {
    media: SelectedCreateMedia | null;
    caption: string;
    visibility: CreateVisibility;
    allowComments: boolean;
    trimDurationSeconds: number;
    imageFilter: CreateImageFilter;
};
