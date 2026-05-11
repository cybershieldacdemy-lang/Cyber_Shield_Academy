const otplib = require('otplib');
console.log('otplib keys:', Object.keys(otplib));
try {
    console.log('otplib.authenticator:', otplib.authenticator);
} catch (e) {
    console.log('Error accessing authenticator:', e.message);
}
console.log('otplib.default:', otplib.default);
