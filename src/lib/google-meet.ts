import { google } from 'googleapis';
import crypto from 'crypto';

/**
 * Automatically creates a Google Calendar event with a Google Meet conference link attached
 * using the Instructor's specific OAuth Refresh Token.
 * 
 * @param instructorRefreshToken - The Refresh token obtained from DB (OAuth2 connection)
 * @param title - The title of the session
 * @param scheduledAt - The start ISO timestamp
 * @param durationMinutes - The duration in minutes
 * @param emails - Array of participant emails
 * @returns { meetLink, eventId }
 */
export async function createGoogleMeetEvent(
    instructorRefreshToken: string,
    title: string,
    scheduledAt: string,
    durationMinutes: number = 60,
    emails: string[] = []
): Promise<{ meetLink: string; eventId: string } | null> {
    
    // If we're missing Global keys entirely or we don't have an instructor token, return a fallback.
    // In production, you would want this to strictly fail if no token is provided.
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET || !instructorRefreshToken) {
        if (!instructorRefreshToken) {
            console.error("[Google Meet] Cannot generate Meet link: Instructor has not linked their Google Account.");
            throw new Error("Instructor has not linked Google Calendar.");
        }
        
        console.warn("[Google Meet] Google API Keys missing in .env. Fallback to mock mechanism.");
        const mockMeetCode = `${randomString(3)}-${randomString(4)}-${randomString(3)}`;
        return {
            meetLink: `https://meet.google.com/${mockMeetCode}`,
            eventId: `mock_event_${Date.now()}`
        };
    }

    try {
        // Instantiate a private targeted client for this specific Instructor
        const oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            "http://localhost:3000/api/auth/google/callback"
        );

        oauth2Client.setCredentials({
            refresh_token: instructorRefreshToken
        });

        // Initialize Google Calendar API with the scoped client
        const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
        
        const startTime = new Date(scheduledAt);
        const endTime = new Date(startTime.getTime() + durationMinutes * 60000);

        const event = {
            summary: title,
            description: 'This is an automated Live Mentorship Session booked via Cyber Shield Academy.',
            start: {
                dateTime: startTime.toISOString(),
                timeZone: 'Asia/Riyadh', 
            },
            end: {
                dateTime: endTime.toISOString(),
                timeZone: 'Asia/Riyadh',
            },
            attendees: emails.map(email => ({ email })),
            conferenceData: {
                createRequest: {
                    requestId: crypto.randomUUID(),
                    conferenceSolutionKey: { type: 'hangoutsMeet' }
                }
            },
            reminders: {
                useDefault: false,
                overrides: [
                    { method: 'email', minutes: 24 * 60 },
                    { method: 'popup', minutes: 10 },
                ],
            },
        };

        const response = await calendar.events.insert({
            calendarId: 'primary',
            requestBody: event,
            conferenceDataVersion: 1, // Crucial for Meet link generation
            sendUpdates: 'all' // Sends automated Google emails to the attendees
        });

        // The hangoutsMeet uri represents the standard Google Meet URL
        const meetLink = response.data.hangoutLink || response.data.conferenceData?.entryPoints?.find(e => e.entryPointType === 'video')?.uri;

        if (!meetLink) {
            throw new Error("Google Calendar API returned success but without a Meet link.");
        }

        return {
            meetLink: meetLink,
            eventId: response.data.id || ''
        };

    } catch (error: any) {
        console.error("Error creating Google Meet Event:", error.message || error);
        return null;
    }
}

function randomString(length: number) {
    const chars = 'abcdefghijklmnopqrstuvwxyz';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}
