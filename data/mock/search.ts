import { SearchHashtagResult } from '@/types/search.types';

export const mockSearchTrendingHashtags: SearchHashtagResult[] = [
    { id: 'tag_001', tag: 'tamkko', postsCount: 812000, growthLabel: '+42% this week' },
    { id: 'tag_002', tag: 'accranights', postsCount: 244000, growthLabel: '+28% this week' },
    { id: 'tag_003', tag: 'campusvibes', postsCount: 421000, growthLabel: '+19% this week' },
    { id: 'tag_004', tag: 'afrobeatschallenge', postsCount: 338000, growthLabel: '+33% this week' },
    { id: 'tag_005', tag: 'danceghana', postsCount: 192000, growthLabel: '+15% this week' },
    { id: 'tag_006', tag: 'tamkkoexclusive', postsCount: 89000, growthLabel: '+57% this week' },
];

export const mockSearchRecentQueries = ['klasique', 'ama creator', '#tamkko', 'studio session'];
