import React from 'react';
import Svg, {
  Path,
  Circle,
  Rect,
  Line,
  Polyline,
  Polygon,
} from 'react-native-svg';
import { COLORS } from '@/constants/theme';

export type IconName =
  | 'Home'
  | 'Calendar'
  | 'Tasks'
  | 'Chat'
  | 'Profile'
  | 'Sparkle'
  | 'Plus'
  | 'Check'
  | 'Trash'
  | 'Bell'
  | 'Clock'
  | 'Search'
  | 'More'
  | 'ChevronRight'
  | 'ChevronDown'
  | 'ChevronLeft'
  | 'ArrowUp'
  | 'Mic'
  | 'X'
  | 'Eye'
  | 'EyeOff'
  | 'Refresh'
  | 'Logout'
  | 'Gemini'
  | 'Google'
  | 'Airtable'
  | 'Supabase'
  | 'Cloud'
  | 'Send'
  | 'Diamond';

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
}

type IconRenderer = (color: string, sw: number) => React.ReactElement;

const ICONS: Record<IconName, IconRenderer> = {
  Home: (c, sw) => (
    <>
      <Path
        d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"
        stroke={c}
        strokeWidth={sw}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <Polyline
        points="9,22 9,12 15,12 15,22"
        stroke={c}
        strokeWidth={sw}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </>
  ),

  Calendar: (c, sw) => (
    <>
      <Rect
        x="3"
        y="4"
        width="18"
        height="18"
        rx="2"
        stroke={c}
        strokeWidth={sw}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <Line
        x1="16"
        y1="2"
        x2="16"
        y2="6"
        stroke={c}
        strokeWidth={sw}
        strokeLinecap="round"
      />
      <Line
        x1="8"
        y1="2"
        x2="8"
        y2="6"
        stroke={c}
        strokeWidth={sw}
        strokeLinecap="round"
      />
      <Line
        x1="3"
        y1="10"
        x2="21"
        y2="10"
        stroke={c}
        strokeWidth={sw}
        strokeLinecap="round"
      />
    </>
  ),

  Tasks: (c, sw) => (
    <>
      <Circle cx="5" cy="7" r="1.5" stroke={c} strokeWidth={sw} fill="none" />
      <Line x1="9" y1="7" x2="21" y2="7" stroke={c} strokeWidth={sw} strokeLinecap="round" />
      <Circle cx="5" cy="12" r="1.5" stroke={c} strokeWidth={sw} fill="none" />
      <Line x1="9" y1="12" x2="21" y2="12" stroke={c} strokeWidth={sw} strokeLinecap="round" />
      <Circle cx="5" cy="17" r="1.5" stroke={c} strokeWidth={sw} fill="none" />
      <Line x1="9" y1="17" x2="21" y2="17" stroke={c} strokeWidth={sw} strokeLinecap="round" />
    </>
  ),

  Chat: (c, sw) => (
    <Path
      d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"
      stroke={c}
      strokeWidth={sw}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  ),

  Profile: (c, sw) => (
    <>
      <Circle cx="12" cy="8" r="4" stroke={c} strokeWidth={sw} fill="none" />
      <Path
        d="M4 20c0-4 3.6-7 8-7s8 3 8 7"
        stroke={c}
        strokeWidth={sw}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </>
  ),

  Sparkle: (c, sw) => (
    <>
      <Path
        d="M12 2l2.5 7.5H22l-6.5 4.7 2.5 7.5L12 17.2l-6 4.5 2.5-7.5L2 9.5h7.5z"
        stroke={c}
        strokeWidth={sw}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </>
  ),

  Plus: (c, sw) => (
    <>
      <Line x1="12" y1="5" x2="12" y2="19" stroke={c} strokeWidth={sw} strokeLinecap="round" />
      <Line x1="5" y1="12" x2="19" y2="12" stroke={c} strokeWidth={sw} strokeLinecap="round" />
    </>
  ),

  Check: (c, sw) => (
    <Polyline
      points="20,6 9,17 4,12"
      stroke={c}
      strokeWidth={sw}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  ),

  Trash: (c, sw) => (
    <>
      <Polyline
        points="3,6 5,6 21,6"
        stroke={c}
        strokeWidth={sw}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <Path
        d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"
        stroke={c}
        strokeWidth={sw}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <Path
        d="M10 11v6M14 11v6"
        stroke={c}
        strokeWidth={sw}
        strokeLinecap="round"
        fill="none"
      />
      <Path
        d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"
        stroke={c}
        strokeWidth={sw}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </>
  ),

  Bell: (c, sw) => (
    <>
      <Path
        d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"
        stroke={c}
        strokeWidth={sw}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <Path
        d="M13.73 21a2 2 0 01-3.46 0"
        stroke={c}
        strokeWidth={sw}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </>
  ),

  Clock: (c, sw) => (
    <>
      <Circle cx="12" cy="12" r="9" stroke={c} strokeWidth={sw} fill="none" />
      <Polyline
        points="12,7 12,12 15,15"
        stroke={c}
        strokeWidth={sw}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </>
  ),

  Search: (c, sw) => (
    <>
      <Circle cx="11" cy="11" r="7" stroke={c} strokeWidth={sw} fill="none" />
      <Line
        x1="16.5"
        y1="16.5"
        x2="22"
        y2="22"
        stroke={c}
        strokeWidth={sw}
        strokeLinecap="round"
      />
    </>
  ),

  More: (c, sw) => (
    <>
      <Circle cx="12" cy="5" r="1" fill={c} />
      <Circle cx="12" cy="12" r="1" fill={c} />
      <Circle cx="12" cy="19" r="1" fill={c} />
    </>
  ),

  ChevronRight: (c, sw) => (
    <Polyline
      points="9,18 15,12 9,6"
      stroke={c}
      strokeWidth={sw}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  ),

  ChevronDown: (c, sw) => (
    <Polyline
      points="6,9 12,15 18,9"
      stroke={c}
      strokeWidth={sw}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  ),

  ChevronLeft: (c, sw) => (
    <Polyline
      points="15,18 9,12 15,6"
      stroke={c}
      strokeWidth={sw}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  ),

  ArrowUp: (c, sw) => (
    <>
      <Line x1="12" y1="19" x2="12" y2="5" stroke={c} strokeWidth={sw} strokeLinecap="round" />
      <Polyline
        points="5,12 12,5 19,12"
        stroke={c}
        strokeWidth={sw}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </>
  ),

  Mic: (c, sw) => (
    <>
      <Rect
        x="9"
        y="2"
        width="6"
        height="11"
        rx="3"
        stroke={c}
        strokeWidth={sw}
        fill="none"
      />
      <Path
        d="M5 10a7 7 0 0014 0"
        stroke={c}
        strokeWidth={sw}
        strokeLinecap="round"
        fill="none"
      />
      <Line x1="12" y1="19" x2="12" y2="22" stroke={c} strokeWidth={sw} strokeLinecap="round" />
    </>
  ),

  X: (c, sw) => (
    <>
      <Line x1="18" y1="6" x2="6" y2="18" stroke={c} strokeWidth={sw} strokeLinecap="round" />
      <Line x1="6" y1="6" x2="18" y2="18" stroke={c} strokeWidth={sw} strokeLinecap="round" />
    </>
  ),

  Eye: (c, sw) => (
    <>
      <Path
        d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
        stroke={c}
        strokeWidth={sw}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <Circle cx="12" cy="12" r="3" stroke={c} strokeWidth={sw} fill="none" />
    </>
  ),

  EyeOff: (c, sw) => (
    <>
      <Path
        d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"
        stroke={c}
        strokeWidth={sw}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <Line x1="1" y1="1" x2="23" y2="23" stroke={c} strokeWidth={sw} strokeLinecap="round" />
    </>
  ),

  Refresh: (c, sw) => (
    <>
      <Path
        d="M23 4v6h-6"
        stroke={c}
        strokeWidth={sw}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <Path
        d="M20.49 15a9 9 0 11-2.12-9.36L23 10"
        stroke={c}
        strokeWidth={sw}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </>
  ),

  Logout: (c, sw) => (
    <>
      <Path
        d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"
        stroke={c}
        strokeWidth={sw}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <Polyline
        points="16,17 21,12 16,7"
        stroke={c}
        strokeWidth={sw}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <Line x1="21" y1="12" x2="9" y2="12" stroke={c} strokeWidth={sw} strokeLinecap="round" />
    </>
  ),

  Gemini: (c, sw) => (
    <>
      <Path
        d="M12 2l2 8 8 2-8 2-2 8-2-8-8-2 8-2z"
        stroke={c}
        strokeWidth={sw}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </>
  ),

  Google: (c, sw) => (
    <>
      <Path
        d="M20.64 12.2c0-.63-.06-1.25-.16-1.84H12v3.49h4.84a4.14 4.14 0 01-1.8 2.71v2.26h2.92c1.7-1.57 2.68-3.87 2.68-6.62z"
        stroke={c}
        strokeWidth={sw * 0.6}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <Path
        d="M12 21c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.83.86-3.04.86-2.34 0-4.32-1.58-5.03-3.71H3.96v2.33A9 9 0 0012 21z"
        stroke={c}
        strokeWidth={sw * 0.6}
        strokeLinecap="round"
        fill="none"
      />
      <Path
        d="M6.97 13.71A5.41 5.41 0 016.69 12c0-.59.1-1.16.28-1.71V7.96H3.96A9 9 0 003 12c0 1.45.35 2.82.96 4.04l3.01-2.33z"
        stroke={c}
        strokeWidth={sw * 0.6}
        strokeLinecap="round"
        fill="none"
      />
      <Path
        d="M12 6.58c1.32 0 2.5.45 3.44 1.34l2.58-2.58C16.46 3.89 14.43 3 12 3A9 9 0 003.96 7.96l3.01 2.33C7.68 8.16 9.66 6.58 12 6.58z"
        stroke={c}
        strokeWidth={sw * 0.6}
        strokeLinecap="round"
        fill="none"
      />
    </>
  ),

  Airtable: (c, sw) => (
    <>
      <Rect x="3" y="3" width="8" height="5" rx="1" stroke={c} strokeWidth={sw} fill="none" />
      <Rect x="13" y="3" width="8" height="5" rx="1" stroke={c} strokeWidth={sw} fill="none" />
      <Rect x="3" y="10" width="8" height="5" rx="1" stroke={c} strokeWidth={sw} fill="none" />
      <Rect x="13" y="10" width="8" height="5" rx="1" stroke={c} strokeWidth={sw} fill="none" />
      <Rect x="3" y="17" width="8" height="4" rx="1" stroke={c} strokeWidth={sw} fill="none" />
      <Rect x="13" y="17" width="8" height="4" rx="1" stroke={c} strokeWidth={sw} fill="none" />
    </>
  ),

  Supabase: (c, sw) => (
    <Path
      d="M14 2.5l-9.5 11H12l-2 8 9.5-11H12l2-8z"
      stroke={c}
      strokeWidth={sw}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  ),

  Cloud: (c, sw) => (
    <Path
      d="M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z"
      stroke={c}
      strokeWidth={sw}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  ),

  Send: (c, sw) => (
    <>
      <Line x1="22" y1="2" x2="11" y2="13" stroke={c} strokeWidth={sw} strokeLinecap="round" />
      <Polygon
        points="22,2 15,22 11,13 2,9"
        stroke={c}
        strokeWidth={sw}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </>
  ),

  Diamond: (c, sw) => (
    <Path
      d="M12 2l10 10-10 10L2 12z"
      stroke={c}
      strokeWidth={sw}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  ),
};

export function Icon({
  name,
  size = 22,
  color = COLORS.text,
  strokeWidth = 1.5,
}: IconProps): React.ReactElement {
  const renderer = ICONS[name];

  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
    >
      {renderer(color, strokeWidth)}
    </Svg>
  );
}

export default Icon;
