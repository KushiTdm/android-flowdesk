// ---------------------------------------------------------------------------
// Confirm Delete modal — app/modals/confirm-delete.tsx
// Route: /modals/confirm-delete?entityType=task|event&entityId=xxx&title=xxx
// presentation: transparentModal
// ---------------------------------------------------------------------------

import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

import { COLORS, SPACING, RADII } from '@/constants/theme';
import { FDText } from '@/src/components/atoms/FDText';
import { Icon } from '@/src/components/atoms/Icon';
import { Button } from '@/src/components/atoms/Button';
import { BottomSheet } from '@/src/components/organisms/BottomSheet';
import { useTasks } from '@/src/hooks/use-tasks';
import { useCRUDIntent } from '@/src/hooks/use-crud-intent';
import { useChatStore } from '@/src/store/chat.store';

// ---------------------------------------------------------------------------
// Row helper
// ---------------------------------------------------------------------------

function Row({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
}): React.ReactElement {
  return (
    <View style={[{ flexDirection: 'row', alignItems: 'center' }, style]}>
      {children}
    </View>
  );
}

// ---------------------------------------------------------------------------
// ConfirmDeleteModal
// ---------------------------------------------------------------------------

export default function ConfirmDeleteModal(): React.ReactElement {
  const router = useRouter();
  const { entityType, entityId, title } = useLocalSearchParams<{
    entityType: string;
    entityId: string;
    title: string;
  }>();
  const { remove: removeTask } = useTasks();
  const { execute } = useCRUDIntent();
  const { pendingIntent, setPendingIntent } = useChatStore();

  const [loading, setLoading] = React.useState(false);

  const displayName =
    pendingIntent
      ? `${pendingIntent.action === 'DELETE' ? 'Supprimer' : 'Modifier'} ${pendingIntent.entity === 'task' ? 'la tâche' : "l'événement"}`
      : (title ?? entityType ?? 'cet élément');

  const handleConfirm = async (): Promise<void> => {
    setLoading(true);
    try {
      if (pendingIntent) {
        await execute(pendingIntent);
        setPendingIntent(null);
      } else if (entityType === 'task' && entityId) {
        await removeTask(entityId);
      }
    } finally {
      setLoading(false);
      router.back();
    }
  };

  return (
    <View style={styles.backdrop}>
      <BottomSheet
        isOpen
        onClose={() => router.back()}
        title="Confirmer la suppression"
        snapHeight="42%"
      >
        <View style={styles.content}>
          {/* Danger icon */}
          <View style={styles.iconCircle}>
            <Icon name="Trash" size={28} color={COLORS.danger} />
          </View>

          {/* Message */}
          <FDText variant="bodyMedium" align="center">
            Supprimer "{displayName}" ?
          </FDText>
          <FDText variant="caption" align="center" color={COLORS.textMuted}>
            Cette action est irréversible.
          </FDText>

          {/* Buttons */}
          <Row style={styles.btnRow}>
            <Button
              variant="secondary"
              onPress={() => router.back()}
              style={styles.btnFlex}
            >
              Annuler
            </Button>
            <Button
              variant="danger"
              onPress={() => { void handleConfirm(); }}
              loading={loading}
              style={styles.btnFlex}
            >
              Supprimer
            </Button>
          </Row>
        </View>
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
  content: {
    padding: SPACING.lg,
    alignItems: 'center',
    gap: SPACING.lg,
  } as ViewStyle,

  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.dangerSoft,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,

  btnRow: {
    gap: SPACING.md,
    width: '100%',
  } as ViewStyle,
  btnFlex: {
    flex: 1,
  } as ViewStyle,
});
