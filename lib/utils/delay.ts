export const delay = (ms = 1100) =>
    new Promise<void>((resolve) => {
        setTimeout(resolve, ms);
    });
