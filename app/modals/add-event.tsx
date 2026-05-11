// ---------------------------------------------------------------------------
// Add Event modal — app/modals/add-event.tsx
// Route: /modals/add-event  |  presentation: transparentModal
// ---------------------------------------------------------------------------

import React from 'react';
import {
  View,
  Pressable,
  ScrollView,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { useRouter } from 'expo-router';

import { COLORS, SPACING, RADII, TYPOGRAPHY } from '@/constants/theme';
import { FDText } from '@/src/components/atoms/FDText';
import { Button } from '@/src/components/atoms/Button';
import { Input } from '@/src/components/atoms/Input';
import { BottomSheet } from '@/src/components/organisms/BottomSheet';
import type { CalendarType } from '@/src/types/event.types';
import { CALENDAR_COLORS } from '@/src/types/event.types';

// ---------------------------------------------------------------------------
// Calendar options
// ---------------------------------------------------------------------------

interface CalendarOption {
  value: CalendarType;
  label: string;
}

const CALENDAR_OPTIONS: CalendarOption[] = [
  { value: 'travail', label: 'Travail' },
  { value: 'perso',   label: 'Perso' },
  { value: 'recrut',  label: 'Recrut' },
];

// ---------------------------------------------------------------------------
// AddEventModal
// ---------------------------------------------------------------------------

export default function AddEventModal(): React.ReactElement {
  const router = useRouter();
  const [title, setTitle] = React.useState('');
  const [calendar, setCalendar] = React.useState<CalendarType>('travail');

  const handleCreate = (): void => {
    if (!title.trim()) return;
    // Phase 5: will call Google Calendar service
    router.back();
  };

  return (
    <View style={styles.backdrop}>
      <BottomSheet isOpen onClose={() => router.back()} title="Nouvel événement" snapHeight="68%">
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Title input */}
          <Input
            value={title}
            onChangeText={setTitle}
            placeholder="Titre de l'événement"
            autoFocus
          />

          {/* Calendar selector */}
          <FDText variant="label" style={styles.sectionLabel}>CALENDRIER</FDText>
          <View style={styles.chipRow}>
            {CALENDAR_OPTIONS.map((opt) => {
              const calColor = CALENDAR_COLORS[opt.value];
              const isSelected = calendar === opt.value;
              return (
                <Pressable
                  key={opt.value}
                  onPress={() => setCalendar(opt.value)}
                  style={[
                    styles.chip,
                    isSelected
                      ? [styles.chipSelected, { backgroundColor: calColor, borderColor: calColor }]
                      : styles.chipUnselected,
                  ]}
                >
                  <FDText
                    variant="caption"
                    color={isSelected ? COLORS.bgBase : COLORS.textMuted}
                    style={styles.chipText}
                  >
                    {opt.label}
                  </FDText>
                </Pressable>
              );
            })}
          </View>

          {/* Date & time (simplified placeholder) */}
          <FDText variant="label" style={styles.sectionLabel}>DATE & HEURE</FDText>
          <View style={styles.dateRow}>
            <View style={styles.datePlaceholder}>
              <FDText variant="body" color={COLORS.textFaint}>Aujourd'hui</FDText>
            </View>
            <View style={styles.datePlaceholder}>
              <FDText variant="body" color={COLORS.textFaint}>09:00 – 10:00</FDText>
            </View>
          </View>

          {/* Google Calendar required notice */}
          <View style={styles.notice}>
            <FDText variant="caption" color={COLORS.textMuted}>
              Google Agenda requis pour créer des événements
            </FDText>
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <Button
              variant="secondary"
              onPress={() => router.back()}
              style={styles.actionBtn}
            >
              Annuler
            </Button>
            <Button
              variant="primary"
              onPress={handleCreate}
              disabled={!title.trim()}
              style={styles.actionBtn}
            >
              Créer
            </Button>
          </View>
        </ScrollView>
      </BottomSheet>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: COLORS.overlay,
  } as ViewStyle,
  flex: {
    flex: 1,
  } as ViewStyle,
  content: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xl,
    gap: SPACING.sm,
  } as ViewStyle,

  sectionLabel: {
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },

  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  } as ViewStyle,
  chip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: RADII.pill,
    borderWidth: 1,
  } as ViewStyle,
  chipSelected: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  } as ViewStyle,
  chipUnselected: {
    backgroundColor: 'transparent',
    borderColor: COLORS.hairline,
  } as ViewStyle,
  chipText: {
    fontFamily: TYPOGRAPHY.uiMedium,
  },

  dateRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  } as ViewStyle,
  datePlaceholder: {
    flex: 1,
    backgroundColor: COLORS.bgSurface,
    borderRadius: RADII.sm,
    borderWidth: 1,
    borderColor: COLORS.hairline,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    alignItems: 'center',
  } as ViewStyle,

  notice: {
    backgroundColor: COLORS.infoSoft,
    borderRadius: RADII.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginTop: SPACING.sm,
  } as ViewStyle,

  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.md,
    marginTop: SPACING.xl,
  } as ViewStyle,
  actionBtn: {
    flex: 1,
  } as ViewStyle,
});
