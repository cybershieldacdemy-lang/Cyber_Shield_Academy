import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { getAuthUser } from '@/lib/api-guard';

export async function GET(req: Request) {
    const user = await getAuthUser();
    if (!user) {
        return NextResponse.redirect(new URL('/login', req.url));
    }
    if (user.role !== 'instructor' && user.role !== 'admin' && user.role !== 'teacher') {
        return NextResponse.json({ message: 'Unauthorized - Instructors Only' }, { status: 403 });
    }

    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
        console.error("Missing Google API Keys in environment!");
        return NextResponse.redirect(new URL('/dashboard/instructor/settings?error=missing_api_keys', req.url));
    }

    const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        "http://localhost:3000/api/auth/google/callback"
    );

    const scopes = [
        'https://www.googleapis.com/auth/calendar.events',
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile'
    ];

    const url = oauth2Client.generateAuthUrl({
        access_type: 'offline', // Crucial: gets refresh_token
        prompt: 'consent', // Crucial: forces it to send refresh_token even on reconnect
        scope: scopes,
    });

    return NextResponse.redirect(url);
}
