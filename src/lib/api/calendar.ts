import { API_CONFIG } from '@/lib/config/api';

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start: Date;
  end: Date;
  location?: string;
  attendees?: string[];
  isAllDay: boolean;
  status: 'confirmed' | 'tentative' | 'cancelled';
  organizer?: string;
  htmlLink?: string;
}

export interface AIInsight {
  type: 'overview' | 'suggestion' | 'conflict' | 'preparation' | 'travel';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  actionable?: boolean;
}

// Mock data für Demo
export const MOCK_EVENTS: CalendarEvent[] = [
  {
    id: '1',
    title: 'Team Stand-up',
    description: 'Daily team synchronization and blockers discussion',
    start: new Date(2024, 11, 30, 9, 0),
    end: new Date(2024, 11, 30, 9, 30),
    location: 'Zoom Meeting',
    attendees: ['team@company.com'],
    isAllDay: false,
    status: 'confirmed',
    organizer: 'scrum-master@company.com'
  },
  {
    id: '2',
    title: 'Projektpräsentation',
    description: 'Vorstellung der neuen ALL-KI Features vor dem Management Board',
    start: new Date(2024, 11, 30, 14, 0),
    end: new Date(2024, 11, 30, 15, 30),
    location: 'Hauptkonferenzraum',
    attendees: ['ceo@company.com', 'cto@company.com', 'team@company.com'],
    isAllDay: false,
    status: 'confirmed',
    organizer: 'project-manager@company.com'
  },
  {
    id: '3',
    title: 'Code Review Session',
    description: 'Review der Widget-System Implementation',
    start: new Date(2024, 11, 30, 16, 0),
    end: new Date(2024, 11, 30, 17, 0),
    location: 'Entwicklungsbereich',
    attendees: ['senior-dev@company.com', 'lead@company.com'],
    isAllDay: false,
    status: 'tentative'
  },
  {
    id: '4',
    title: 'Client Call - Widget Integration',
    description: 'Besprechen der Widget-Integration beim Kunden',
    start: new Date(2024, 11, 31, 10, 0),
    end: new Date(2024, 11, 31, 11, 0),
    location: 'Video Call',
    attendees: ['client@customer.com', 'sales@company.com'],
    isAllDay: false,
    status: 'confirmed'
  }
];

// Transform Google Calendar API response to our format
function transformGoogleEvent(googleEvent: any): CalendarEvent {
  const start = googleEvent.start.dateTime 
    ? new Date(googleEvent.start.dateTime)
    : new Date(googleEvent.start.date);
  
  const end = googleEvent.end.dateTime
    ? new Date(googleEvent.end.dateTime)
    : new Date(googleEvent.end.date);

  return {
    id: googleEvent.id,
    title: googleEvent.summary || 'Unbenannter Termin',
    description: googleEvent.description,
    start,
    end,
    location: googleEvent.location,
    attendees: googleEvent.attendees?.map((a: any) => a.email) || [],
    isAllDay: !googleEvent.start.dateTime,
    status: googleEvent.status || 'confirmed',
    organizer: googleEvent.organizer?.email,
    htmlLink: googleEvent.htmlLink
  };
}

// Fetch events from Google Calendar API
export async function fetchCalendarEvents(
  apiKey: string, 
  calendarId: string = 'primary',
  timeMin?: Date,
  timeMax?: Date
): Promise<CalendarEvent[]> {
  if (!apiKey) {
    throw new Error('Google Calendar API key is required');
  }

  try {
    const now = timeMin || new Date();
    const endTime = timeMax || new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days from now

    const params = new URLSearchParams({
      key: apiKey,
      timeMin: now.toISOString(),
      timeMax: endTime.toISOString(),
      singleEvents: 'true',
      orderBy: 'startTime',
      maxResults: '50'
    });

    const url = `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?${params}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Google Calendar API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.items) {
      return [];
    }

    return data.items.map(transformGoogleEvent);
    
  } catch (error) {
    throw error;
  }
}

// Generate AI insights based on calendar events
export function generateAIInsights(events: CalendarEvent[]): AIInsight[] {
  const insights: AIInsight[] = [];
  const today = new Date();
  const todayEvents = events.filter(event => 
    event.start.toDateString() === today.toDateString()
  );

  // Overview insight
  if (todayEvents.length > 0) {
    const totalDuration = todayEvents.reduce((total, event) => {
      return total + (event.end.getTime() - event.start.getTime());
    }, 0);
    
    const hours = Math.round(totalDuration / (1000 * 60 * 60) * 10) / 10;
    
    insights.push({
      type: 'overview',
      title: 'Tagesübersicht',
      message: `Du hast ${todayEvents.length} Termine heute (${hours}h gesamt). ${
        todayEvents.length > 4 ? 'Ein sehr voller Tag - plane genügend Pausen ein.' :
        todayEvents.length > 2 ? 'Ein gut gefüllter Tag mit ausreichend Flexibilität.' :
        'Ein entspannter Tag mit Zeit für tiefe Arbeit.'
      }`,
      priority: todayEvents.length > 4 ? 'high' : 'medium'
    });
  }

  // Conflict detection
  for (let i = 0; i < todayEvents.length - 1; i++) {
    const current = todayEvents[i];
    const next = todayEvents[i + 1];
    
    if (current.end.getTime() > next.start.getTime()) {
      insights.push({
        type: 'conflict',
        title: 'Terminkonflikt erkannt',
        message: `"${current.title}" überschneidet sich mit "${next.title}". Du solltest einen der Termine verschieben.`,
        priority: 'high',
        actionable: true
      });
    }
  }

  // Travel time suggestions
  const eventsWithLocation = todayEvents.filter(event => event.location && !event.location.toLowerCase().includes('zoom') && !event.location.toLowerCase().includes('online'));
  
  eventsWithLocation.forEach((event, index) => {
    if (index < eventsWithLocation.length - 1) {
      const nextEvent = eventsWithLocation[index + 1];
      const timeBetween = (nextEvent.start.getTime() - event.end.getTime()) / (1000 * 60); // minutes
      
      if (timeBetween < 30 && event.location !== nextEvent.location) {
        insights.push({
          type: 'travel',
          title: 'Fahrzeit beachten',
          message: `Nur ${timeBetween} Minuten zwischen "${event.title}" (${event.location}) und "${nextEvent.title}" (${nextEvent.location}). Prüfe die Fahrtzeit.`,
          priority: 'medium',
          actionable: true
        });
      }
    }
  });

  // Preparation suggestions
  const importantEvents = todayEvents.filter(event => 
    event.attendees && event.attendees.length > 2 || 
    event.title.toLowerCase().includes('präsentation') ||
    event.title.toLowerCase().includes('interview') ||
    event.title.toLowerCase().includes('client')
  );

  importantEvents.forEach(event => {
    const timeUntil = (event.start.getTime() - Date.now()) / (1000 * 60); // minutes
    
    if (timeUntil > 0 && timeUntil < 120) { // Next 2 hours
      insights.push({
        type: 'preparation',
        title: 'Vorbereitung empfohlen',
        message: `"${event.title}" startet in ${Math.round(timeUntil)} Minuten. ${
          event.description ? 'Überprüfe die Agenda und bereite Fragen vor.' :
          'Überprüfe deine Unterlagen und teste die Technik.'
        }`,
        priority: timeUntil < 30 ? 'high' : 'medium',
        actionable: true
      });
    }
  });

  // Focus time suggestions
  const gaps = findFreeTimeSlots(todayEvents);
  const longGaps = gaps.filter(gap => gap.duration >= 60); // 1+ hour gaps
  
  if (longGaps.length > 0) {
    const nextGap = longGaps[0];
    insights.push({
      type: 'suggestion',
      title: 'Fokuszeit verfügbar',
      message: `Du hast ${nextGap.duration} Minuten freie Zeit ab ${nextGap.start.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}. Ideal für tiefe Arbeit oder wichtige Aufgaben.`,
      priority: 'low'
    });
  }

  // Weekly pattern analysis
  if (events.length > 7) { // If we have data for multiple days
    const avgMeetingsPerDay = events.length / 7;
    const todayMeetings = todayEvents.length;
    
    if (todayMeetings > avgMeetingsPerDay * 1.5) {
      insights.push({
        type: 'suggestion',
        title: 'Überdurchschnittlich viele Termine',
        message: `Heute hast du ${todayMeetings} Termine vs. durchschnittlich ${Math.round(avgMeetingsPerDay)}. Überlege, welche Meetings wirklich notwendig sind.`,
        priority: 'medium'
      });
    }
  }

  return insights.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });
}

// Find free time slots between events
function findFreeTimeSlots(events: CalendarEvent[]) {
  if (events.length === 0) return [];
  
  const sortedEvents = [...events].sort((a, b) => a.start.getTime() - b.start.getTime());
  const gaps = [];
  
  for (let i = 0; i < sortedEvents.length - 1; i++) {
    const current = sortedEvents[i];
    const next = sortedEvents[i + 1];
    
    const gapStart = current.end;
    const gapEnd = next.start;
    const duration = (gapEnd.getTime() - gapStart.getTime()) / (1000 * 60); // minutes
    
    if (duration > 15) { // Only gaps longer than 15 minutes
      gaps.push({
        start: gapStart,
        end: gapEnd,
        duration: Math.round(duration)
      });
    }
  }
  
  return gaps;
}

// Validate Google Calendar API key
export async function validateApiKey(apiKey: string): Promise<boolean> {
  try {
    const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary?key=${apiKey}`);
    return response.ok;
  } catch {
    return false;
  }
}

// Get calendar list
export async function getCalendarList(apiKey: string) {
  try {
    const response = await fetch(`https://www.googleapis.com/calendar/v3/users/me/calendarList?key=${apiKey}`);
    if (!response.ok) throw new Error('API call failed');
    
    const data = await response.json();
    return data.items || [];
  } catch (error) {
    return [];
  }
}