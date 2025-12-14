import crypto from 'crypto';

export function verifyToken(providedToken, secretToken) {
    if (!providedToken || !secretToken) return false;

    const encoder = new TextEncoder();
    const a = encoder.encode(providedToken);
    const b = encoder.encode(secretToken);

    if (a.byteLength !== b.byteLength) return false;

    return crypto.timingSafeEqual(a, b);
}
