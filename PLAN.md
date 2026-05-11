# FlowDesk — Plan d'exécution

> Fichier maintenu par l'orchestrateur. Dernière mise à jour : Phase 6 terminée.

## Avancement global

```
[✅] Phase 0 — Foundation (deps + theme + types)
[✅] Phase 1 — Service/État (Agent Fonctionnel)
[✅] Phase 2 — Composants UI (Agent Design)
[✅] Phase 3 — Écrans + App Shell
[✅] Phase 4 — Wiring CRUD IA
[✅] Phase 5 — Google OAuth + Splash
[✅] Phase 6 — Polish & Security
```

**TypeScript : 0 erreur** à chaque phase ✅

---

## Phase 0 — Foundation ✅

| # | Tâche | Statut |
|---|-------|--------|
| 0.1 | Installer dépendances | ✅ |
| 0.2 | `app.json` — android:allowBackup:false | ✅ |
| 0.3 | `constants/theme.ts` — tokens premium | ✅ |
| 0.4–0.7 | Types TypeScript (credentials, task, event, ai-intent) | ✅ |
| 0.8 | `.env.local` — placeholders OAuth | ✅ |

---

## Phase 1 — Couche service/état ✅

| # | Fichier | Statut |
|---|---------|--------|
| 1.1–1.3 | `src/utils/` (error, date, sanitize) | ✅ |
| 1.4 | `src/services/secure-storage.service.ts` | ✅ |
| 1.5 | `src/services/intent-parser.service.ts` | ✅ |
| 1.6 | `src/services/gemini.service.ts` | ✅ |
| 1.7 | `src/services/airtable.service.ts` | ✅ |
| 1.8 | `src/services/supabase.service.ts` | ✅ |
| 1.9 | `src/services/google-calendar.service.ts` | ✅ |
| 1.10–1.13 | `src/store/` (credentials, tasks, agenda, chat) | ✅ |
| 1.14–1.18 | `src/hooks/` (credentials, tasks, agenda, gemini, crud-intent) | ✅ |

---

## Phase 2 — Bibliothèque composants ✅

| # | Fichier | Statut |
|---|---------|--------|
| 2.1–2.7 | `src/components/atoms/` (FDText, Avatar, Badge, StatusDot, Button, Input, Icon) | ✅ |
| 2.8–2.12 | `src/components/molecules/` (TaskCard, EventCard, MetricCard, ChatMessage, IntegrationRow) | ✅ |
| 2.13–2.17 | `src/components/organisms/` (BottomSheet, CustomTabBar, Header, FAB, GradientBackground) | ✅ |

---

## Phase 3 — Écrans + App Shell ✅

| # | Fichier | Statut |
|---|---------|--------|
| 3.1 | `app/_layout.tsx` — fonts + credentials init + auth gate | ✅ |
| 3.2 | `app/(tabs)/_layout.tsx` — 5 onglets + CustomTabBar | ✅ |
| 3.3 | `app/(tabs)/index.tsx` — Dashboard | ✅ |
| 3.4 | `app/(tabs)/agenda.tsx` — Agenda + timeline | ✅ |
| 3.5 | `app/(tabs)/tasks.tsx` — Tâches + filtres + swipe | ✅ |
| 3.6 | `app/(tabs)/assistant.tsx` — Chat Gemini streaming | ✅ |
| 3.7 | `app/(tabs)/profile.tsx` — Profil + credentials | ✅ |
| 3.8–3.11 | `app/modals/` (add-task, add-event, edit-task, confirm-delete) | ✅ |

---

## Phase 4 — Wiring CRUD IA ✅

| # | Tâche | Statut |
|---|-------|--------|
| 4.1 | `chat.store.ts` — `pendingIntent` + `setPendingIntent` | ✅ |
| 4.2 | `assistant.tsx` — capture intent retourné par `send()`, gate confirmation | ✅ |
| 4.3 | `confirm-delete.tsx` — exécute `pendingIntent` via `useCRUDIntent` | ✅ |

---

## Phase 5 — Google OAuth + Splash ✅

| # | Tâche | Statut |
|---|-------|--------|
| 5.1 | `app/splash.tsx` — animation staggerée 3 phases | ✅ |
| 5.2 | `app/_layout.tsx` — Redirect vers /splash si pas de geminiApiKey | ✅ |
| 5.3 | `app/(tabs)/profile.tsx` — OAuth Google via expo-auth-session PKCE | ✅ |

---

## Phase 6 — Polish & Security ✅

| # | Tâche | Statut |
|---|-------|--------|
| 6.1 | Entrance stagger `FadeInDown.delay(index*50)` sur tasks FlatList | ✅ |
| 6.2 | Audit `console.log` — aucune valeur de credential | ✅ |
| 6.3 | Timeout 15s sur tous les appels réseau (17 AbortSignal) | ✅ |
| 6.4 | `android:allowBackup: false` confirmé | ✅ |
| 6.5 | Checklist CLAUDE.md pré-release | ✅ |

---

## Log de changements final

| Date | Phase | Événement |
|------|-------|-----------|
| 2026-05-09 | 0 | Foundation : deps + theme + types + fichiers coordination |
| 2026-05-09 | 1 | 18 fichiers service/store/hook créés |
| 2026-05-09 | 2 | 17 composants React Native créés (atoms, molecules, organisms) |
| 2026-05-09 | 3 | 11 écrans + app shell créés, explore.tsx supprimé |
| 2026-05-09 | 4 | Wiring CRUD IA — pendingIntent store + confirmation flow |
| 2026-05-09 | 5 | Splash animé + auth gate + OAuth Google setup |
| 2026-05-09 | 6 | Entrance stagger + audit sécurité final |
| 2026-05-09 | Post | Logo FlowDesk_logo.png : app.json + splash.tsx + TypeScript fix |
| 2026-05-09 | ALL | TypeScript 0 erreur · 55 fichiers créés/réécrits |
