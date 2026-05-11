# FlowDesk — Architecture du code

> Fichier maintenu par l'orchestrateur. Dernière mise à jour : Phase 6 + Logo integration.
> **55 fichiers** créés/réécrits. TypeScript : 0 erreur. Logo FlowDesk_logo.png intégré partout.

## Structure complète

```
FlowDesk/
│
├── app/
│   ├── _layout.tsx              ✅ Root Stack + font loading + credentials init + auth gate
│   ├── splash.tsx               ✅ Onboarding animé (3 phases staggered, 0/600/1200ms)
│   └── (tabs)/
│       ├── _layout.tsx          ✅ 5 onglets + CustomTabBar flottante
│       ├── index.tsx            ✅ Dashboard (metrics, hero event, tasks preview, AI banner)
│       ├── agenda.tsx           ✅ Agenda (day strip, timeline, free slots, FAB)
│       ├── tasks.tsx            ✅ Tâches (filtres, swipe gestures, FadeInDown stagger, FAB)
│       ├── assistant.tsx        ✅ Chat Gemini streaming + intent routing
│       └── profile.tsx          ✅ Profil (credentials, Google OAuth, integrations)
│   └── modals/
│       ├── add-task.tsx         ✅ Création tâche (BottomSheet)
│       ├── add-event.tsx        ✅ Création événement (BottomSheet)
│       ├── edit-task.tsx        ✅ Édition tâche (BottomSheet pré-rempli)
│       └── confirm-delete.tsx   ✅ Confirmation suppression (native + IA)
│
├── src/
│   ├── types/
│   │   ├── credentials.types.ts  ✅ AppCredentials, GEMINI_MODELS
│   │   ├── task.types.ts         ✅ Task, CreateTaskInput, UpdateTaskInput, TaskFilter
│   │   ├── event.types.ts        ✅ CalendarEvent, FreeSlot, CreateEventInput, CALENDAR_COLORS
│   │   └── ai-intent.types.ts    ✅ AIIntent, ChatMessage, IntentExecutionResult
│   │
│   ├── utils/
│   │   ├── error.utils.ts        ✅ GeminiError, AirtableError, SupabaseError, CalendarError, getUserFacingError()
│   │   ├── date.utils.ts         ✅ Helpers date-fns/fr
│   │   └── sanitize.utils.ts     ✅ stripIntentBlock(), truncate(), sanitizeInput()
│   │
│   ├── services/
│   │   ├── secure-storage.service.ts    ✅ Blob JSON unique 'fd_credentials_v1'
│   │   ├── intent-parser.service.ts     ✅ buildSystemPrompt(), parseIntentFromResponse(), stripIntentBlock()
│   │   ├── gemini.service.ts            ✅ chatStream() AsyncGenerator, validateKey(), timeout 15s
│   │   ├── airtable.service.ts          ✅ CRUD complet, timeout 10s/5s
│   │   ├── supabase.service.ts          ✅ Client lazy, auth persistSession:false
│   │   └── google-calendar.service.ts   ✅ CRUD events, refreshTokenIfNeeded()
│   │
│   ├── store/
│   │   ├── credentials.store.ts  ✅ Mirror SecureStore, isLoaded flag, Zustand
│   │   ├── tasks.store.ts        ✅ Persist AsyncStorage 'fd_tasks_v1', 8 tâches seed
│   │   ├── agenda.store.ts       ✅ Cache temps-réel, sans persistence
│   │   └── chat.store.ts         ✅ Persist 'fd_chat_v1', pendingIntent, selectedModel
│   │
│   ├── hooks/
│   │   ├── use-credentials.ts    ✅ hasGemini/hasAirtable/hasSupabase/hasGoogle flags
│   │   ├── use-tasks.ts          ✅ CRUD optimiste, sync Airtable/Supabase, filteredTasks
│   │   ├── use-agenda.ts         ✅ fetchTodayEvents, isNotConnected guard
│   │   ├── use-gemini.ts         ✅ Streaming, intent auto-parse, displayText stripping
│   │   └── use-crud-intent.ts    ✅ execute(intent) → task/event CRUD
│   │
│   └── components/
│       ├── atoms/
│       │   ├── FDText.tsx         ✅ 8 variants (display, displayIt, eyebrow, label, body, bodyMedium, mono, caption)
│       │   ├── Avatar.tsx         ✅ LinearGradient accent tone
│       │   ├── Badge.tsx          ✅ 6 kinds (urgent, doing, done, info, ai, neutral)
│       │   ├── StatusDot.tsx      ✅ ok (glow) / err / off
│       │   ├── Button.tsx         ✅ 5 variants × 3 sizes, Reanimated press scale
│       │   ├── Input.tsx          ✅ Focus border animé, glow shadow
│       │   └── Icon.tsx           ✅ 30 icônes SVG via react-native-svg
│       ├── molecules/
│       │   ├── TaskCard.tsx       ✅ Swipe ±80px, strike-through, progress bar, badges
│       │   ├── EventCard.tsx      ✅ Calendar color border, current event dot glow
│       │   ├── MetricCard.tsx     ✅ BlurView, 3 tones
│       │   ├── ChatMessage.tsx    ✅ User/assistant bubbles, cursor clignotant, actions
│       │   └── IntegrationRow.tsx ✅ Icon box + StatusDot + ChevronRight
│       └── organisms/
│           ├── BottomSheet.tsx    ✅ Spring open, drag-to-dismiss, BlurView backdrop
│           ├── CustomTabBar.tsx   ✅ Floating pill, BlurView, haptics, dot animation
│           ├── Header.tsx         ✅ eyebrow + title variants + rightAction
│           ├── FAB.tsx            ✅ Float animation 6s, LinearGradient, press scale 0.92
│           └── GradientBackground.tsx ✅ Mesh gradient + drifting color orbs
│
├── constants/
│   └── theme.ts                  ✅ COLORS, RADII, SPACING, TYPOGRAPHY, ANIMATION, SHADOWS
│
├── assets/images/                (assets Expo template)
├── .env.local                    ✅ Placeholders OAuth client IDs
├── app.json                      ✅ android:allowBackup:false
├── ARCHITECTURE.md               ✅ CE FICHIER
└── PLAN.md                       ✅ Plan d'exécution complet

```

## Dépendances (complètes)

| Package | Usage |
|---------|-------|
| `expo-secure-store` | Stockage credentials AES |
| `expo-auth-session` | OAuth 2.0 PKCE |
| `expo-crypto` | Crypto PKCE |
| `expo-blur` | BlurView glass-morphism |
| `expo-linear-gradient` | Gradients |
| `@react-native-async-storage/async-storage` | Persistence Zustand |
| `zustand` ^5 | State management |
| `@supabase/supabase-js` ^2 | Client Supabase |
| `date-fns` ^4 | Manipulation dates (locale fr) |
| `@expo-google-fonts/instrument-serif` | Font display |
| `@expo-google-fonts/geist` | Font UI |
| `@expo-google-fonts/geist-mono` | Font mono |
| `react-native-svg` | Icônes SVG |
| `react-native-gesture-handler` | Swipe gestures (déjà installé) |
| `react-native-reanimated` ^4 | Animations (déjà installé) |
| `expo-haptics` | Feedback tactile (déjà installé) |

## Flux CRUD IA (Phase 4)

```
Utilisateur → assistant.tsx → useGemini.send()
  → GeminiService.chatStream() streaming SSE
  → parseIntentFromResponse() → AIIntent ou null
  → stripIntentBlock() → texte affiché
  → si intent.requiresConfirmation:
      chat.store.setPendingIntent(intent) → router.push('/modals/confirm-delete')
      → useCRUDIntent.execute(pendingIntent) → store action
  → sinon:
      useCRUDIntent.execute(intent) → direct
```

## Règles de sécurité respectées

- ✅ Aucune clé API dans le code ou `.env` (sauf OAuth client_id)
- ✅ `expo-secure-store` pour tous les credentials
- ✅ Aucun `console.log` de valeur sensible
- ✅ `AbortSignal.timeout()` sur 17 appels réseau (10s ou 15s)
- ✅ `getUserFacingError()` dans tous les catch utilisateur
- ✅ DELETE → `requiresConfirmation: true` forcé
- ✅ `android:allowBackup: false`
- ✅ `debugStatus()` retourne uniquement des booléens
