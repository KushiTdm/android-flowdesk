// ---------------------------------------------------------------------------
// google-calendar.service.ts — Google Calendar v3 REST API wrapper
// ---------------------------------------------------------------------------

import type { CalendarEvent, CreateEventInput } from '../types/event.types';
import { CalendarError } from '../utils/error.utils';
import type { AppCredentials } from '../types/credentials.types';

const BASE_URL = 'https://www.googleapis.com/calendar/v3';
const CALENDAR_ID = 'primary';
/** Refresh a Google token if expiry is less than this many ms away */
const REFRESH_THRESHOLD_MS = 60_000;

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function authHeaders(accessToken: string): HeadersInit {
  return {
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  };
}

async function throwOnCalendarError(response: Response): Promise<void> {
  if (!response.ok) {
    let body = '';
    try {
      body = await response.text();
    } catch {
      // ignore
    }
    throw new CalendarError(
      `Google Calendar HTTP ${response.status}: ${body}`,
      response.status,
    );
  }
}

interface GoogleEventDateTime {
  dateTime?: string;
  date?: string;
  timeZone?: string;
}

interface GoogleEventAttendee {
  email?: string;
  displayName?: string;
}

interface GoogleEvent {
  id?: string;
  summary?: string;
  description?: string;
  location?: string;
  start?: GoogleEventDateTime;
  end?: GoogleEventDateTime;
  attendees?: GoogleEventAttendee[];
}

function mapGoogleEvent(g: GoogleEvent): CalendarEvent {
  return {
    id: g.id ?? '',
    title: g.summary ?? '(Sans titre)',
    start: g.start?.dateTime ?? g.start?.date ?? new Date().toISOString(),
    end: g.end?.dateTime ?? g.end?.date ?? new Date().toISOString(),
    calendar: 'travail',
    location: g.location,
    notes: g.description,
    attendees: (g.attendees ?? [])
      .map((a) => a.displayName ?? a.email ?? '')
      .filter(Boolean),
    googleEventId: g.id,
  };
}

function buildGoogleEventBody(input: CreateEventInput | Partial<CreateEventInput>): Record<string, unknown> {
  const body: Record<string, unknown> = {};

  if (input.title !== undefined) body['summary'] = input.title;
  if (input.location !== undefined) body['location'] = input.location;
  if (input.notes !== undefined) body['description'] = input.notes;

  if (input.start !== undefined) {
    body['start'] = { dateTime: input.start, timeZone: 'Europe/Paris' };
  }
  if (input.end !== undefined) {
    body['end'] = { dateTime: input.end, timeZone: 'Europe/Paris' };
  }

  return body;
}

// ---------------------------------------------------------------------------
// GoogleCalendarService
// ---------------------------------------------------------------------------

export const GoogleCalendarService = {
  /** Fetches all events for the current calendar day */
  async getTodayEvents(
    accessToken: string,
    signal?: AbortSignal,
  ): Promise<CalendarEvent[]> {
    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    const url = new URL(`${BASE_URL}/calendars/${CALENDAR_ID}/events`);
    url.searchParams.set('timeMin', startOfDay.toISOString());
    url.searchParams.set('timeMax', endOfDay.toISOString());
    url.searchParams.set('orderBy', 'startTime');
    url.searchParams.set('singleEvents', 'true');

    const response = await fetch(url.toString(), {
      headers: authHeaders(accessToken),
      signal: signal ?? AbortSignal.timeout(10_000),
    });

    await throwOnCalendarError(response);

    const data = (await response.json()) as { items: GoogleEvent[] };
    return (data.items ?? []).map(mapGoogleEvent);
  },

  /** Creates a new Google Calendar event */
  async createEvent(
    accessToken: string,
    input: CreateEventInput,
    signal?: AbortSignal,
  ): Promise<CalendarEvent> {
    const response = await fetch(
      `${BASE_URL}/calendars/${CALENDAR_ID}/events`,
      {
        method: 'POST',
        headers: authHeaders(accessToken),
        body: JSON.stringify(buildGoogleEventBody(input)),
        signal: signal ?? AbortSignal.timeout(10_000),
      },
    );

    await throwOnCalendarError(response);

    const data = (await response.json()) as GoogleEvent;
    return mapGoogleEvent(data);
  },

  /** Updates an existing Google Calendar event */
  async updateEvent(
    accessToken: string,
    eventId: string,
    input: Partial<CreateEventInput>,
    signal?: AbortSignal,
  ): Promise<CalendarEvent> {
    const response = await fetch(
      `${BASE_URL}/calendars/${CALENDAR_ID}/events/${eventId}`,
      {
        method: 'PATCH',
        headers: authHeaders(accessToken),
        body: JSON.stringify(buildGoogleEventBody(input)),
        signal: signal ?? AbortSignal.timeout(10_000),
      },
    );

    await throwOnCalendarError(response);

    const data = (await response.json()) as GoogleEvent;
    return mapGoogleEvent(data);
  },

  /** Deletes a Google Calendar event */
  async deleteEvent(
    accessToken: string,
    eventId: string,
    signal?: AbortSignal,
  ): Promise<void> {
    const response = await fetch(
      `${BASE_URL}/calendars/${CALENDAR_ID}/events/${eventId}`,
      {
        method: 'DELETE',
        headers: authHeaders(accessToken),
        signal: signal ?? AbortSignal.timeout(10_000),
      },
    );

    // 204 No Content is success for DELETE
    if (!response.ok && response.status !== 204) {
      await throwOnCalendarError(response);
    }
  },

  /**
   * Refreshes the Google access token if it will expire within 60 seconds.
   * Returns new { googleAccessToken, googleTokenExpiry } or null if refresh
   * is not possible (missing refresh token or network failure).
   */
  async refreshTokenIfNeeded(
    credentials: Pick<AppCredentials, 'googleRefreshToken' | 'googleTokenExpiry'>,
  ): Promise<{ googleAccessToken: string; googleTokenExpiry: number } | null> {
    const { googleRefreshToken, googleTokenExpiry } = credentials;

    if (!googleRefreshToken) return null;

    const now = Date.now();
    const expiry = googleTokenExpiry ?? 0;

    if (expiry - now > REFRESH_THRESHOLD_MS) {
      // Token still valid — no refresh needed
      return null;
    }

    try {
      const clientId = process.env['EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS'] ?? '';

      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: googleRefreshToken,
          client_id: clientId,
        }).toString(),
        signal: AbortSignal.timeout(10_000),
      });

      if (!response.ok) return null;

      const data = (await response.json()) as {
        access_token?: string;
        expires_in?: number;
      };

      if (!data.access_token) return null;

      return {
        googleAccessToken: data.access_token,
        googleTokenExpiry: Date.now() + (data.expires_in ?? 3600) * 1000,
      };
    } catch {
      return null;
    }
  },
};
