export type CalendarType = 'travail' | 'perso' | 'recrut';

export interface CalendarEvent {
  id:             string;
  title:          string;
  start:          string;
  end:            string;
  calendar:       CalendarType;
  location?:      string;
  attendees?:     string[];
  isCurrent?:     boolean;
  fromAI?:        boolean;
  googleEventId?: string;
  notes?:         string;
}

export interface FreeSlot {
  id:     string;
  start:  string;
  end:    string;
  label:  string;
}

export interface CreateEventInput {
  title:     string;
  start:     string;
  end:       string;
  calendar:  CalendarType;
  location?: string;
  notes?:    string;
}

export const CALENDAR_COLORS: Record<CalendarType, string> = {
  travail: '#4068C0',
  perso:   '#6B6986',
  recrut:  '#8C6B3A',
};
