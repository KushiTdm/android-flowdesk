// ---------------------------------------------------------------------------
// Assistant screen — app/(tabs)/assistant.tsx
// ---------------------------------------------------------------------------

import React from 'react';
import {
  View,
  FlatList,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ListRenderItem,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { COLORS, SPACING, RADII, TYPOGRAPHY } from '@/constants/theme';
import { FDText } from '@/src/components/atoms/FDText';
import { Icon } from '@/src/components/atoms/Icon';
import { Button } from '@/src/components/atoms/Button';
import { Input } from '@/src/components/atoms/Input';
import { ChatMessage } from '@/src/components/molecules/ChatMessage';
import { GradientBackground } from '@/src/components/organisms/GradientBackground';
import { Header } from '@/src/components/organisms/Header';
import { useGemini } from '@/src/hooks/use-gemini';
import { useCredentials } from '@/src/hooks/use-credentials';
import { useChatStore } from '@/src/store/chat.store';
import { useCRUDIntent } from '@/src/hooks/use-crud-intent';
import type { ChatMessage as ChatMsg } from '@/src/types/ai-intent.types';

// ---------------------------------------------------------------------------
// Quick prompts
// ---------------------------------------------------------------------------

const QUICK_PROMPTS = [
  "Qu'ai-je aujourd'hui ?",
  'Crée une tâche urgente',
  'Résume mes tâches',
  'Libère du temps',
] as const;

// ---------------------------------------------------------------------------
// Row helper
// ---------------------------------------------------------------------------

function Row({ children, style }: { children: React.ReactNode; style?: ViewStyle }): React.ReactElement {
  return (
    <View style={[{ flexDirection: 'row', alignItems: 'center' }, style]}>
      {children}
    </View>
  );
}

// ---------------------------------------------------------------------------
// NotConnectedState
// ---------------------------------------------------------------------------

function NotConnectedState({
  message,
  onPress,
}: {
  message: string;
  onPress: () => void;
}): React.ReactElement {
  return (
    <View style={styles.notConnected}>
      <Icon name="Cloud" size={48} color={COLORS.textFaint} />
      <FDText
        variant="bodyMedium"
        color={COLORS.textMuted}
        align="center"
        style={styles.notConnectedText}
      >
        {message}
      </FDText>
      <Button variant="secondary" onPress={onPress}>
        Configurer
      </Button>
    </View>
  );
}

// ---------------------------------------------------------------------------
// ModelSelectorButton
// ---------------------------------------------------------------------------

function ModelSelectorButton(): React.ReactElement {
  const { selectedModel } = useChatStore();

  const shortLabel = selectedModel === 'gemini-2.0-flash'
    ? '2.0 Flash'
    : selectedModel === 'gemini-1.5-pro'
    ? '1.5 Pro'
    : '1.5 Flash';

  return (
    <Pressable
      onPress={() => {
        // Phase 5: ouvre le sélecteur de modèle
      }}
      style={styles.modelSelector}
    >
      <Icon name="Gemini" size={14} color={COLORS.accent} />
      <FDText variant="caption" color={COLORS.accent} style={styles.modelLabel}>
        {shortLabel}
      </FDText>
      <Icon name="ChevronDown" size={14} color={COLORS.accent} />
    </Pressable>
  );
}

// ---------------------------------------------------------------------------
// AssistantScreen
// ---------------------------------------------------------------------------

export default function AssistantScreen(): React.ReactElement {
  const router = useRouter();
  const { send, isStreaming, messages } = useGemini();
  const { hasGemini } = useCredentials();
  const { setPendingIntent } = useChatStore();
  const { execute } = useCRUDIntent();

  const [draft, setDraft] = React.useState('');
  const flatListRef = React.useRef<FlatList<ChatMsg>>(null);

  const handleSend = React.useCallback(async () => {
    const text = draft.trim();
    if (!text) return;
    setDraft('');
    const intent = await send(text);
    if (!intent) return;
    if (intent.requiresConfirmation) {
      setPendingIntent(intent);
      router.push('/modals/confirm-delete');
    } else {
      await execute(intent);
    }
  }, [draft, send, execute, setPendingIntent, router]);

  const handleQuickPrompt = React.useCallback(
    async (prompt: string) => {
      const intent = await send(prompt);
      if (!intent) return;
      if (intent.requiresConfirmation) {
        setPendingIntent(intent);
        router.push('/modals/confirm-delete');
      } else {
        await execute(intent);
      }
    },
    [send, execute, setPendingIntent, router],
  );

  if (!hasGemini) {
    return (
      <GradientBackground style={styles.flex}>
        <SafeAreaView style={styles.flex} edges={['top']}>
          <Header title="Assistant" titleVariant="displayIt" />
          <NotConnectedState
            message="Configurez votre clé Gemini dans le Profil."
            onPress={() => router.push('/(tabs)/profile')}
          />
        </SafeAreaView>
      </GradientBackground>
    );
  }

  const renderMessage: ListRenderItem<ChatMsg> = ({ item }) => (
    <ChatMessage message={item} />
  );

  return (
    <GradientBackground style={styles.flex}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <SafeAreaView style={styles.flex} edges={['top']}>
          <Header
            title="Assistant"
            titleVariant="displayIt"
            rightAction={<ModelSelectorButton />}
          />

          {/* Quick prompt chips */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickPrompts}
            style={styles.quickPromptsScroll}
          >
            {QUICK_PROMPTS.map((prompt) => (
              <Pressable
                key={prompt}
                onPress={() => handleQuickPrompt(prompt)}
                style={styles.quickChip}
              >
                <FDText variant="caption" color={COLORS.textMuted}>
                  {prompt}
                </FDText>
              </Pressable>
            ))}
          </ScrollView>

          {/* Message list */}
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(m) => m.id}
            renderItem={renderMessage}
            contentContainerStyle={styles.messageList}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() =>
              flatListRef.current?.scrollToEnd({ animated: true })
            }
            style={styles.flex}
          />

          {/* Composer */}
          <View style={styles.composer}>
            <Row style={styles.composerRow}>
              <Input
                value={draft}
                onChangeText={setDraft}
                placeholder="Message..."
                multiline
                style={styles.composerInput}
                onSubmitEditing={handleSend}
              />
              <Pressable
                onPress={handleSend}
                disabled={!draft.trim() || isStreaming}
                style={[
                  styles.sendButton,
                  {
                    backgroundColor:
                      draft.trim() && !isStreaming
                        ? COLORS.accent
                        : COLORS.accentMist,
                  },
                ]}
              >
                <Icon
                  name="ArrowUp"
                  size={18}
                  color={draft.trim() && !isStreaming ? COLORS.bgDeep : COLORS.accent}
                  strokeWidth={2}
                />
              </Pressable>
            </Row>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </GradientBackground>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  } as ViewStyle,

  // NotConnectedState
  notConnected: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xxl,
  } as ViewStyle,
  notConnectedText: {
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
  } as TextStyle,

  // ModelSelector pill
  modelSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: COLORS.accentMist,
    borderWidth: 1,
    borderColor: COLORS.hairline,
    borderRadius: RADII.pill,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
  } as ViewStyle,
  modelLabel: {
    fontFamily: TYPOGRAPHY.uiMedium,
  } as TextStyle,

  // Quick prompts
  quickPromptsScroll: {
    flexGrow: 0,
    marginBottom: SPACING.xs,
  } as ViewStyle,
  quickPrompts: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
  } as ViewStyle,
  quickChip: {
    backgroundColor: COLORS.bgSurface,
    borderWidth: 1,
    borderColor: COLORS.hairline,
    borderRadius: RADII.pill,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
  } as ViewStyle,

  // Message list
  messageList: {
    padding: SPACING.lg,
    paddingBottom: 16,
    gap: SPACING.md,
  } as ViewStyle,

  // Composer
  composer: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    paddingTop: SPACING.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLORS.hairline,
  } as ViewStyle,
  composerRow: {
    gap: SPACING.sm,
    alignItems: 'flex-end',
  } as ViewStyle,
  composerInput: {
    flex: 1,
    maxHeight: 96,
  } as ViewStyle,
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: RADII.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  } as ViewStyle,
});
