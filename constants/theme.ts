export const COLORS = {
  // Accents violets
  accent:       '#6E72FF',
  accentHover:  '#5C61F2',
  accentDeep:   '#4A4FE0',
  accentSoft:   '#C9CBFF',
  accentGlow:   'rgba(110,114,255,0.20)',
  accentMist:   'rgba(110,114,255,0.06)',

  // Surfaces (light premium)
  bgDeep:    '#F2F0FA',
  bgBase:    '#FBFAF6',
  bgSurface: 'rgba(255,255,255,0.72)',
  bgCard:    'rgba(255,255,255,0.72)',
  bgHover:   'rgba(255,255,255,0.92)',

  // Texte
  text:       '#1A1934',
  textMuted:  '#6B6986',
  textFaint:  '#A09EB8',

  // Bordures
  border:       'rgba(255,255,255,0.55)',
  borderStrong: 'rgba(255,255,255,0.75)',
  borderFaint:  'rgba(20,18,42,0.04)',
  hairline:     'rgba(20,18,42,0.06)',

  // Sémantique
  success:     '#2C8456',
  successSoft: 'rgba(60,160,110,0.12)',
  successText: '#3AB077',
  danger:      '#C0354F',
  dangerSoft:  'rgba(220,80,110,0.10)',
  dangerText:  '#E05570',
  info:        '#4068C0',
  infoSoft:    'rgba(80,140,230,0.10)',
  infoText:    '#5A8CD8',

  // Intégrations
  airtable:  '#1A7A5E',
  supabase:  '#1C3F5A',
  gemini:    '#4A4890',
  google:    '#C0354F',

  // AI highlight
  aiGlow:    'rgba(110,114,255,0.12)',
  aiMist:    'rgba(110,114,255,0.05)',

  // Opaque pour les overlays
  overlay:   'rgba(20,18,42,0.30)',
  overlayLight: 'rgba(242,240,250,0.85)',
} as const;

export const RADII = {
  xs:   6,
  sm:   10,
  md:   14,
  lg:   20,
  xl:   28,
  pill: 999,
} as const;

export const SPACING = {
  xs:  4,
  sm:  8,
  md:  12,
  lg:  16,
  xl:  24,
  xxl: 32,
} as const;

export const TYPOGRAPHY = {
  // Familles (noms des fonts chargées via expo-font)
  display:    'InstrumentSerif_400Regular',
  displayIt:  'InstrumentSerif_400Regular_Italic',
  ui:         'Geist_400Regular',
  uiMedium:   'Geist_500Medium',
  uiSemiBold: 'Geist_600SemiBold',
  uiBold:     'Geist_700Bold',
  mono:       'GeistMono_400Regular',

  // Fallbacks système (avant chargement des fonts)
  displayFallback:  'serif',
  uiFallback:       'System',
  monoFallback:     'monospace',

  // Taille
  xs:          10,
  sm:          12,
  base:        14.5,
  md:          16,
  lg:          20,
  xl:          26,
  displaySize: 30,
  hero:        40,
} as const;

export const ANIMATION = {
  spring: { damping: 18, stiffness: 180, mass: 0.8 },
  springSnappy: { damping: 15, stiffness: 300 },
  quick:    150,
  standard: 240,
  slow:     480,
  // Easing bezier spring-out (usage: Easing.bezier(0.32, 0.72, 0.24, 1))
  easeOutValues: [0.32, 0.72, 0.24, 1] as [number, number, number, number],
} as const;

export const SHADOWS = {
  sm: {
    shadowColor:   '#4A46C8',
    shadowOffset:  { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius:  8,
    elevation:     2,
  },
  md: {
    shadowColor:   '#4A46C8',
    shadowOffset:  { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius:  18,
    elevation:     6,
  },
  lg: {
    shadowColor:   '#4A46C8',
    shadowOffset:  { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius:  32,
    elevation:     12,
  },
} as const;

// Shims de compatibilité pour les composants Expo template (remplacés en Phase 3)
export const Colors = {
  light: { text: '#1A1934', background: '#F2F0FA', tint: '#6E72FF', icon: '#6B6986', tabIconDefault: '#6B6986', tabIconSelected: '#6E72FF' },
  dark:  { text: '#1A1934', background: '#F2F0FA', tint: '#6E72FF', icon: '#6B6986', tabIconDefault: '#6B6986', tabIconSelected: '#6E72FF' },
};
export const Fonts = { sans: 'System', serif: 'serif', rounded: 'System', mono: 'monospace' };
