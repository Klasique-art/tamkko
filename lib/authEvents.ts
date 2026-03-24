type UnauthorizedListener = () => void;

const listeners = new Set<UnauthorizedListener>();

export const authEvents = {
    onUnauthorized(listener: UnauthorizedListener) {
        listeners.add(listener);
        return () => {
            listeners.delete(listener);
        };
    },

    emitUnauthorized() {
        listeners.forEach((listener) => listener());
    },
};
