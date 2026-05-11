import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { getAuthUser } from '@/lib/api-guard';
import db from '@/lib/db';

export async function GET(req: Request) {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const errorParam = url.searchParams.get('error');

    // Retrieve active logged in user from cookie
    const user = await getAuthUser();
    if (!user) {
        return NextResponse.redirect(new URL('/login?error=auth_required_for_google', req.url));
    }

    if (errorParam) {
        console.error("Google Auth Error from query:", errorParam);
        return NextResponse.redirect(new URL('/dashboard/instructor/settings?error=google_declined', req.url));
    }

    if (!code) {
        return NextResponse.redirect(new URL('/dashboard/instructor/settings?error=no_code', req.url));
    }

    try {
        const oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            "http://localhost:3000/api/auth/google/callback"
        );

        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);
        
        // Get user's Google Email
        const oauth2 = google.oauth2({ auth: oauth2Client, version: 'v2' });
        const userInfo = await oauth2.userinfo.get();
        const googleEmail = userInfo.data.email || 'unknown@gmail.com';

        // Log the success locally
        console.log(`Google OAuth Success for [${user.email}]. Connected to Google identity: [${googleEmail}]`);

        // Save refresh_token and email to DB securely
        // NOTE: If prompt=consent is used, refresh_token should always be present.
        if (tokens.refresh_token) {
            db.prepare('UPDATE users SET google_refresh_token = ?, google_email = ? WHERE id = ?')
              .run(tokens.refresh_token, googleEmail, user.id);
        } else {
             // Fallback if somehow missing
             db.prepare('UPDATE users SET google_email = ? WHERE id = ?')
              .run(googleEmail, user.id);
        }

        return NextResponse.redirect(new URL('/dashboard/instructor/settings?google=connected', req.url));

    } catch (error: any) {
        console.error("Google OAuth Callback Error Exchange Failed:", error);
        return NextResponse.redirect(new URL('/dashboard/instructor/settings?error=google_auth_failed', req.url));
    }
}
