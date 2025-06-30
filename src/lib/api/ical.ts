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
  url?: string;
}

export interface AIInsight {
  type: 'overview' | 'suggestion' | 'conflict' | 'preparation' | 'travel';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  actionable?: boolean;
}

// Parse iCal date string to Date object
function parseICalDate(dateStr: string): Date {
  // Handle different iCal date formats
  if (dateStr.includes('T')) {
    // DateTime format: 20241230T140000Z or 20241230T140000
    const cleanDate = dateStr.replace(/[TZ]/g, '');
    const year = parseInt(cleanDate.substring(0, 4));
    const month = parseInt(cleanDate.substring(4, 6)) - 1; // Month is 0-indexed
    const day = parseInt(cleanDate.substring(6, 8));
    const hour = parseInt(cleanDate.substring(8, 10)) || 0;
    const minute = parseInt(cleanDate.substring(10, 12)) || 0;
    const second = parseInt(cleanDate.substring(12, 14)) || 0;
    
    return new Date(year, month, day, hour, minute, second);
  } else {
    // Date only format: 20241230
    const year = parseInt(dateStr.substring(0, 4));
    const month = parseInt(dateStr.substring(4, 6)) - 1;
    const day = parseInt(dateStr.substring(6, 8));
    
    return new Date(year, month, day);
  }
}

// Extract value from iCal line
function extractValue(line: string): string {
  const colonIndex = line.indexOf(':');
  if (colonIndex === -1) return '';
  return line.substring(colonIndex + 1).trim();
}

// Parse iCal/ICS content
export function parseICalEvents(icalContent: string): CalendarEvent[] {
  const events: CalendarEvent[] = [];
  const lines = icalContent.split(/\r?\n/);
  
  let currentEvent: Partial<CalendarEvent> | null = null;
  let currentProperty = '';
  
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();
    
    // Handle line folding (lines starting with space or tab)
    while (i + 1 < lines.length && /^[ \t]/.test(lines[i + 1])) {
      line += lines[i + 1].substring(1);
      i++;
    }
    
    if (line === 'BEGIN:VEVENT') {
      currentEvent = {
        id: '',
        title: '',
        isAllDay: false,
        status: 'confirmed',
        attendees: []
      };
    } else if (line === 'END:VEVENT' && currentEvent) {
      // Finalize event
      if (currentEvent.title && currentEvent.start && currentEvent.end) {
        events.push(currentEvent as CalendarEvent);
      }
      currentEvent = null;
    } else if (currentEvent && line.includes(':')) {
      const property = line.split(':')[0].split(';')[0];
      const value = extractValue(line);
      
      switch (property.toUpperCase()) {
        case 'UID':
          currentEvent.id = value;
          break;
        case 'SUMMARY':
          currentEvent.title = value;
          break;
        case 'DESCRIPTION':
          currentEvent.description = value.replace(/\\n/g, '\n').replace(/\\,/g, ',');
          break;
        case 'LOCATION':
          currentEvent.location = value;
          break;
        case 'DTSTART':
          currentEvent.start = parseICalDate(value);
          // Check if it's an all-day event (no time component)
          if (!value.includes('T')) {
            currentEvent.isAllDay = true;
          }
          break;
        case 'DTEND':
          currentEvent.end = parseICalDate(value);
          break;
        case 'STATUS':
          switch (value.toUpperCase()) {
            case 'CONFIRMED':
              currentEvent.status = 'confirmed';
              break;
            case 'TENTATIVE':
              currentEvent.status = 'tentative';
              break;
            case 'CANCELLED':
              currentEvent.status = 'cancelled';
              break;
          }
          break;
        case 'ORGANIZER':
          // Extract email from ORGANIZER:mailto:email@example.com or ORGANIZER:CN=Name:mailto:email@example.com
          const emailMatch = value.match(/mailto:([^:]+)/);
          if (emailMatch) {
            currentEvent.organizer = emailMatch[1];
          }
          break;
        case 'URL':
          currentEvent.url = value;
          break;
      }
    }
  }
  
  return events.filter(event => event.start && event.end);
}

// Fetch and parse iCal from URL
export async function fetchICalEvents(icalUrl: string): Promise<CalendarEvent[]> {
  if (!icalUrl) {
    throw new Error('iCal URL is required');
  }
  
  try {
    // Use a CORS proxy for cross-origin requests
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(icalUrl)}`;
    
    const response = await fetch(proxyUrl);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    const icalContent = data.contents;
    
    if (!icalContent) {
      throw new Error('No iCal content received');
    }
    
    // Parse the iCal content
    const events = parseICalEvents(icalContent);
    
    // Filter events to only show upcoming events (next 30 days)
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    
    return events.filter(event => 
      event.start >= now && event.start <= thirtyDaysFromNow
    ).sort((a, b) => a.start.getTime() - b.start.getTime());
    
  } catch (error) {
    throw new Error(`Fehler beim Laden des Kalenders: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`);
  }
}

// Validate iCal URL
export async function validateICalUrl(url: string): Promise<boolean> {
  try {
    await fetchICalEvents(url);
    return true;
  } catch {
    return false;
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
      if (event.isAllDay) return total;
      return total + (event.end.getTime() - event.start.getTime());
    }, 0);
    
    const hours = Math.round(totalDuration / (1000 * 60 * 60) * 10) / 10;
    
    insights.push({
      type: 'overview',
      title: 'Tagesübersicht',
      message: `Du hast ${todayEvents.length} Termine heute${hours > 0 ? ` (${hours}h gesamt)` : ''}. ${
        todayEvents.length > 4 ? 'Ein sehr voller Tag - plane genügend Pausen ein.' :
        todayEvents.length > 2 ? 'Ein gut gefüllter Tag mit ausreichend Flexibilität.' :
        'Ein entspannter Tag mit Zeit für wichtige Aufgaben.'
      }`,
      priority: todayEvents.length > 4 ? 'high' : 'medium'
    });
  } else if (events.length > 0) {
    // Show next upcoming event
    const nextEvent = events[0];
    const timeUntil = (nextEvent.start.getTime() - Date.now()) / (1000 * 60 * 60); // hours
    
    insights.push({
      type: 'overview',
      title: 'Kommende Termine',
      message: `Dein nächster Termin ist "${nextEvent.title}" ${
        timeUntil < 24 ? `in ${Math.round(timeUntil)} Stunden` : 
        `am ${nextEvent.start.toLocaleDateString('de-DE')}`
      }.`,
      priority: 'medium'
    });
  }

  // Conflict detection for today
  for (let i = 0; i < todayEvents.length - 1; i++) {
    const current = todayEvents[i];
    const next = todayEvents[i + 1];
    
    if (!current.isAllDay && !next.isAllDay && current.end.getTime() > next.start.getTime()) {
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
  const eventsWithLocation = todayEvents.filter(event => 
    event.location && 
    !event.location.toLowerCase().includes('zoom') && 
    !event.location.toLowerCase().includes('online') &&
    !event.location.toLowerCase().includes('teams')
  );
  
  eventsWithLocation.forEach((event, index) => {
    if (index < eventsWithLocation.length - 1) {
      const nextEvent = eventsWithLocation[index + 1];
      const timeBetween = (nextEvent.start.getTime() - event.end.getTime()) / (1000 * 60); // minutes
      
      if (timeBetween < 30 && timeBetween > 0 && event.location !== nextEvent.location) {
        insights.push({
          type: 'travel',
          title: 'Fahrzeit beachten',
          message: `Nur ${Math.round(timeBetween)} Minuten zwischen "${event.title}" und "${nextEvent.title}" an verschiedenen Orten. Prüfe die Fahrtzeit.`,
          priority: 'medium',
          actionable: true
        });
      }
    }
  });

  // Preparation suggestions
  const importantEvents = todayEvents.filter(event => 
    event.title.toLowerCase().includes('präsentation') ||
    event.title.toLowerCase().includes('meeting') ||
    event.title.toLowerCase().includes('interview') ||
    event.title.toLowerCase().includes('termin') ||
    (event.description && event.description.length > 50)
  );

  importantEvents.forEach(event => {
    const timeUntil = (event.start.getTime() - Date.now()) / (1000 * 60); // minutes
    
    if (timeUntil > 0 && timeUntil < 120) { // Next 2 hours
      insights.push({
        type: 'preparation',
        title: 'Vorbereitung empfohlen',
        message: `"${event.title}" startet in ${Math.round(timeUntil)} Minuten. ${
          event.description ? 'Überprüfe die Details und bereite dich vor.' :
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
      message: `Du hast ${nextGap.duration} Minuten freie Zeit ab ${nextGap.start.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}. Ideal für wichtige Aufgaben.`,
      priority: 'low'
    });
  }

  return insights.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });
}

// Find free time slots between events
function findFreeTimeSlots(events: CalendarEvent[]) {
  if (events.length === 0) return [];
  
  const timeBasedEvents = events.filter(e => !e.isAllDay);
  const sortedEvents = [...timeBasedEvents].sort((a, b) => a.start.getTime() - b.start.getTime());
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