const followedCreatorsStore = new Set<string>(['@klasique', '@ama.creator']);

export const getFollowedCreators = () => new Set(followedCreatorsStore);

export const isCreatorFollowed = (creatorHandle: string) => followedCreatorsStore.has(creatorHandle);

export const toggleFollowedCreator = (creatorHandle: string) => {
    if (followedCreatorsStore.has(creatorHandle)) {
        followedCreatorsStore.delete(creatorHandle);
    } else {
        followedCreatorsStore.add(creatorHandle);
    }
    return followedCreatorsStore.has(creatorHandle);
};