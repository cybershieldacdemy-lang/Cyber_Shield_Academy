const otplib = require('otplib');
const authenticator = otplib.authenticator || otplib.default?.authenticator;
import qrcode from 'qrcode';

// Configure authenticator
if (authenticator) {
    authenticator.options = {
        window: 1 // Allow 1 step window for time drift
    };
}


/**
 * Generate a new 2FA secret and QR code data URL
 */
export async function generateTwoFactorSecret(userEmail: string) {
    const secret = authenticator.generateSecret();
    const otpauth = authenticator.keyuri(userEmail, 'CyberShield', secret);

    // Generate QR Code
    const qrCodeUrl = await qrcode.toDataURL(otpauth);

    return {
        secret,
        qrCodeUrl
    };
}

/**
 * Verify a TOTP token against a secret
 */
export function verifyTwoFactorToken(token: string, secret: string): boolean {
    return authenticator.check(token, secret);
}
