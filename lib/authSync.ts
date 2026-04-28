type UnauthorizedHandler = () => void;

let unauthorizedHandler: UnauthorizedHandler | null = null;

export const authSync = {
    setUnauthorizedHandler(handler: UnauthorizedHandler) {
        unauthorizedHandler = handler;
        return () => {
            if (unauthorizedHandler === handler) {
                unauthorizedHandler = null;
            }
        };
    },

    handleUnauthorized() {
        unauthorizedHandler?.();
    },
};

