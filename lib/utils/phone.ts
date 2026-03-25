export function sanitizePhoneNumber(input: string) {
    return input.replace(/[^\d+]/g, '');
}
