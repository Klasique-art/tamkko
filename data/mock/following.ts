export const normalizeCreatorHandle = (creatorHandle: string) => {
    const trimmed = creatorHandle.trim();
    if (!trimmed) return '';
    return trimmed.startsWith('@') ? trimmed : `@${trimmed}`;
};

const followedCreatorsStore = new Set<string>(
    ['@klasique', '@ama.creator'].map((handle) => normalizeCreatorHandle(handle))
);

export const getFollowedCreators = () => new Set(followedCreatorsStore);

export const isCreatorFollowed = (creatorHandle: string) =>
    followedCreatorsStore.has(normalizeCreatorHandle(creatorHandle));

export const toggleFollowedCreator = (creatorHandle: string) => {
    const normalized = normalizeCreatorHandle(creatorHandle);
    if (!normalized) return false;

    if (followedCreatorsStore.has(normalized)) {
        followedCreatorsStore.delete(normalized);
    } else {
        followedCreatorsStore.add(normalized);
    }
    return followedCreatorsStore.has(normalized);
};
