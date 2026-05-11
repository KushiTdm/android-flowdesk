// ---------------------------------------------------------------------------
// Profile screen — app/(tabs)/profile.tsx
// ---------------------------------------------------------------------------

import React, { useEffect } from 'react';
import {
  View,
  ScrollView,
  Pressable,
  StyleSheet,
  ViewStyle,
  Platform,
  ActivityIndicator,
  Modal,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import {
  useAuthRequest,
  makeRedirectUri,
  useAutoDiscovery,
  ResponseType,
} from 'expo-auth-session';

import { COLORS, SPACING, RADII, TYPOGRAPHY } from '@/constants/theme';
import { FDText } from '@/src/components/atoms/FDText';
import { Icon } from '@/src/components/atoms/Icon';
import { Button } from '@/src/components/atoms/Button';
import { Input } from '@/src/components/atoms/Input';
import { Avatar } from '@/src/components/atoms/Avatar';
import { IntegrationRow } from '@/src/components/molecules/IntegrationRow';
import { GradientBackground } from '@/src/components/organisms/GradientBackground';
import { Header } from '@/src/components/organisms/Header';
import { useCredentials } from '@/src/hooks/use-credentials';
import { useChatStore } from '@/src/store/chat.store';
import { GEMINI_MODELS } from '@/src/types/credentials.types';
import type { AppCredentials } from '@/src/types/credentials.types';
import { AirtableService } from '@/src/services/airtable.service';
import type { AirtableTable } from '@/src/services/airtable.service';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const BLUR_INTENSITY = Platform.OS === 'android' ? 40 : 50;

// ---------------------------------------------------------------------------
// Row / RowDivider helpers
// ---------------------------------------------------------------------------

function Row({ children, style }: { children: React.ReactNode; style?: ViewStyle }): React.ReactElement {
  return (
    <View style={[{ flexDirection: 'row', alignItems: 'center' }, style]}>
      {children}
    </View>
  );
}

function RowDivider(): React.ReactElement {
  return (
    <View
      style={{
        height: StyleSheet.hairlineWidth,
        backgroundColor: COLORS.hairline,
        marginLeft: SPACING.lg,
      }}
    />
  );
}

// ---------------------------------------------------------------------------
// StatusIndicator
// ---------------------------------------------------------------------------

type FieldStatus = 'untested' | 'testing' | 'valid' | 'invalid';

function StatusIndicator({
  status,
  hasValue,
}: {
  status: FieldStatus;
  hasValue: boolean;
}): React.ReactElement {
  if (status === 'testing') {
    return <FDText variant="caption" color={COLORS.textMuted}>Vérification…</FDText>;
  }
  if (status === 'valid') {
    return <FDText variant="caption" color={COLORS.successText}>Sauvegardé</FDText>;
  }
  if (status === 'invalid') {
    return <FDText variant="caption" color={COLORS.dangerText}>Clé invalide</FDText>;
  }
  if (hasValue) {
    return <FDText variant="caption" color={COLORS.successText}>Configuré</FDText>;
  }
  return <FDText variant="caption" color={COLORS.textFaint}>Non configuré</FDText>;
}

// ---------------------------------------------------------------------------
// CredentialField
// ---------------------------------------------------------------------------

interface CredentialFieldProps {
  label: string;
  credKey: keyof AppCredentials;
  placeholder?: string;
  helpText?: string;
}

function CredentialField({
  label,
  credKey,
  placeholder,
  helpText,
}: CredentialFieldProps): React.ReactElement {
  const { credentials, setCredentials } = useCredentials();
  const [value, setValue] = React.useState('');
  const [visible, setVisible] = React.useState(false);
  const [status, setStatus] = React.useState<FieldStatus>('untested');

  const hasValue = !!credentials[credKey];

  const handleSave = async (): Promise<void> => {
    if (!value.trim()) return;
    setStatus('testing');
    try {
      await setCredentials({ [credKey]: value.trim() } as Partial<AppCredentials>);
      setStatus('valid');
      setValue('');
    } catch {
      setStatus('invalid');
    }
  };

  return (
    <View style={styles.credField}>
      <FDText variant="label" style={{ marginBottom: SPACING.sm }}>
        {label}
      </FDText>
      <Row>
        <Input
          value={value}
          onChangeText={setValue}
          placeholder={hasValue ? '••••• déjà configuré' : (placeholder ?? 'Entrez votre clé')}
          secureTextEntry={!visible}
          style={styles.credInput}
        />
        <Pressable
          onPress={() => setVisible((v) => !v)}
          style={styles.eyeButton}
        >
          <Icon name={visible ? 'EyeOff' : 'Eye'} color={COLORS.textMuted} size={18} />
        </Pressable>
      </Row>
      <Row style={{ marginTop: SPACING.sm, justifyContent: 'space-between' }}>
        <StatusIndicator status={status} hasValue={hasValue} />
        {value.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onPress={() => { void handleSave(); }}
          >
            Sauvegarder
          </Button>
        )}
      </Row>
      {helpText !== undefined && (
        <FDText variant="caption" style={{ marginTop: SPACING.xs }}>
          {helpText}
        </FDText>
      )}
    </View>
  );
}

// ---------------------------------------------------------------------------
// AirtableTableSelector — fetch tables and let user pick
// ---------------------------------------------------------------------------

function AirtableTableSelector(): React.ReactElement {
  const { credentials, setCredentials } = useCredentials();
  const [tables, setTables] = React.useState<AirtableTable[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [modalVisible, setModalVisible] = React.useState(false);

  const canFetch = !!(credentials.airtableApiKey && credentials.airtableBaseId);
  const selectedTableId = credentials.airtableTableId;
  const selectedTable = tables.find(t => t.id === selectedTableId);

  const fetchTables = async (): Promise<void> => {
    if (!canFetch) return;
    setLoading(true);
    setError(null);
    try {
      const result = await AirtableService.listTables(
        credentials.airtableApiKey!,
        credentials.airtableBaseId!,
      );
      setTables(result);
      setModalVisible(true);
    } catch {
      setError('Impossible de récupérer les tables. Vérifiez votre clé API et Base ID.');
    } finally {
      setLoading(false);
    }
  };

  const selectTable = async (table: AirtableTable): Promise<void> => {
    await setCredentials({ airtableTableId: table.id });
    setModalVisible(false);
  };

  return (
    <View style={styles.credField}>
      <FDText variant="label" style={{ marginBottom: SPACING.sm }}>
        TABLE AIRTABLE
      </FDText>

      {selectedTableId && (
        <View style={styles.selectedTableRow}>
          <View style={styles.selectedTableInfo}>
            <FDText variant="bodyMedium" color={COLORS.successText}>
              {selectedTable?.name ?? selectedTableId}
            </FDText>
            <FDText variant="caption" color={COLORS.textFaint}>
              {selectedTableId}
            </FDText>
          </View>
        </View>
      )}

      {!canFetch && (
        <FDText variant="caption" color={COLORS.textMuted} style={{ marginBottom: SPACING.sm }}>
          Configurez d'abord la clé API et le Base ID.
        </FDText>
      )}

      <Button
        variant={selectedTableId ? 'ghost' : 'secondary'}
        size="sm"
        disabled={!canFetch}
        onPress={() => { void fetchTables(); }}
        loading={loading}
      >
        {selectedTableId ? 'Changer de table' : 'Choisir une table'}
      </Button>

      {error !== null && (
        <FDText variant="caption" color={COLORS.dangerText} style={{ marginTop: SPACING.sm }}>
          {error}
        </FDText>
      )}

      {/* Table picker modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <FDText variant="bodyMedium" size={18}>Choisir une table</FDText>
              <Pressable onPress={() => setModalVisible(false)} style={styles.modalClose}>
                <Icon name="X" size={20} color={COLORS.textMuted} />
              </Pressable>
            </View>
            <FlatList
              data={tables}
              keyExtractor={(t) => t.id}
              ItemSeparatorComponent={() => (
                <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: COLORS.hairline }} />
              )}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => { void selectTable(item); }}
                  style={[
                    styles.tableRow,
                    item.id === selectedTableId && styles.tableRowSelected,
                  ]}
                >
                  <View style={styles.tableRowContent}>
                    <FDText variant="bodyMedium">{item.name}</FDText>
                    <FDText variant="caption" color={COLORS.textFaint}>{item.id}</FDText>
                  </View>
                  {item.id === selectedTableId && (
                    <Icon name="Check" size={16} color={COLORS.accent} strokeWidth={2.5} />
                  )}
                </Pressable>
              )}
              ListEmptyComponent={
                <View style={styles.emptyTables}>
                  <FDText variant="caption" color={COLORS.textMuted} align="center">
                    Aucune table trouvée dans cette base.
                  </FDText>
                </View>
              }
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ---------------------------------------------------------------------------
// ModelSelector
// ---------------------------------------------------------------------------

function ModelSelector(): React.ReactElement {
  const { selectedModel, setModel } = useChatStore();

  return (
    <View style={styles.modelSelector}>
      {GEMINI_MODELS.map((model) => {
        const isSelected = selectedModel === model.id;
        return (
          <Pressable
            key={model.id}
            onPress={() => setModel(model.id)}
            style={[
              styles.modelOption,
              isSelected && styles.modelOptionSelected,
            ]}
          >
            <FDText
              variant="bodyMedium"
              color={isSelected ? COLORS.accent : COLORS.text}
              style={{ fontSize: TYPOGRAPHY.sm }}
            >
              {model.label}
            </FDText>
            <FDText
              variant="caption"
              color={isSelected ? COLORS.accent : COLORS.textFaint}
            >
              {model.description}
            </FDText>
          </Pressable>
        );
      })}
    </View>
  );
}

// ---------------------------------------------------------------------------
// SettingRow
// ---------------------------------------------------------------------------

function SettingRow({
  label,
  value,
  rightElement,
  onPress,
}: {
  label: string;
  value?: string;
  rightElement?: React.ReactNode;
  onPress?: () => void;
}): React.ReactElement {
  return (
    <Pressable onPress={onPress} style={styles.settingRow}>
      <FDText variant="bodyMedium" style={{ flex: 1 }}>
        {label}
      </FDText>
      {value !== undefined && (
        <FDText variant="caption" color={COLORS.textMuted} style={styles.settingValue}>
          {value}
        </FDText>
      )}
      {rightElement}
    </Pressable>
  );
}

// ---------------------------------------------------------------------------
// GlassCard wrapper
// ---------------------------------------------------------------------------

function GlassCard({ children, style }: { children: React.ReactNode; style?: ViewStyle }): React.ReactElement {
  return (
    <BlurView intensity={BLUR_INTENSITY} tint="light" style={[styles.glassCard, style]}>
      {children}
    </BlurView>
  );
}

// ---------------------------------------------------------------------------
// ProfileScreen
// ---------------------------------------------------------------------------

export default function ProfileScreen(): React.ReactElement {
  const { hasAirtable, hasSupabase, hasGoogle, clearCredentials, setCredentials } = useCredentials();

  const airtableStatus = hasAirtable ? ('ok' as const) : ('off' as const);
  const supabaseStatus = hasSupabase ? ('ok' as const) : ('off' as const);
  const googleStatus = hasGoogle ? ('ok' as const) : ('off' as const);

  // ── Google OAuth ─────────────────────────────────────────────────────────
  // Use useAutoDiscovery for the OpenID Connect discovery document
  const discovery = useAutoDiscovery('https://accounts.google.com');

  // Build redirect URI — must match what's registered in Google Cloud Console
  const redirectUri = makeRedirectUri({
    scheme: 'flowdesk',
    path: 'oauth2redirect',
  });

  const googleClientId = Platform.select({
    ios: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS,
    android: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID,
    default: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS,
  });

  const [request, response, promptAsync] = useAuthRequest(
    {
      // Use ResponseType.Code for PKCE flow (more secure, avoids implicit flow deprecation)
      responseType: ResponseType.Code,
      clientId: googleClientId ?? '',
      scopes: [
        'openid',
        'profile',
        'email',
        'https://www.googleapis.com/auth/calendar.readonly',
        'https://www.googleapis.com/auth/calendar.events',
      ],
      redirectUri,
      // Enable PKCE
      usePKCE: true,
    },
    discovery,
  );

  useEffect(() => {
    if (response?.type === 'success') {
      const { code } = response.params;
      // Exchange code for tokens using PKCE
      void exchangeCodeForTokens(code);
    } else if (response?.type === 'error') {
      console.warn('Google OAuth error:', response.error?.message ?? 'Unknown error');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [response]);

  const exchangeCodeForTokens = async (code: string): Promise<void> => {
    try {
      const clientId = googleClientId ?? '';
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          client_id: clientId,
          redirect_uri: redirectUri,
          grant_type: 'authorization_code',
          code_verifier: request?.codeVerifier ?? '',
        }).toString(),
        signal: AbortSignal.timeout(10_000),
      });

      if (!tokenResponse.ok) {
        const err = await tokenResponse.text();
        console.warn('Token exchange failed:', err);
        return;
      }

      const data = await tokenResponse.json() as {
        access_token?: string;
        refresh_token?: string;
        expires_in?: number;
      };

      if (data.access_token) {
        await setCredentials({
          googleAccessToken: data.access_token,
          googleRefreshToken: data.refresh_token ?? null,
          googleTokenExpiry: Date.now() + (Number(data.expires_in) || 3600) * 1000,
        });
      }
    } catch (err) {
      console.warn('Token exchange error:', err);
    }
  };
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <GradientBackground style={styles.flex}>
      <SafeAreaView style={styles.flex} edges={['top']}>
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Header title="Profil" titleVariant="displayIt" />

          {/* ── Identité ── */}
          <View style={styles.section}>
            <GlassCard>
              <View style={styles.identityRow}>
                <Avatar initials="?" size={52} tone="accent" />
                <View style={styles.flex}>
                  <FDText variant="bodyMedium" size={18}>Mon Compte</FDText>
                  <FDText variant="caption">Configurez vos intégrations ci-dessous</FDText>
                </View>
                <Icon name="ChevronRight" color={COLORS.textFaint} />
              </View>
            </GlassCard>
          </View>

          {/* ── IA ── */}
          <View style={[styles.section, styles.sectionGap]}>
            <FDText variant="label">INTELLIGENCE ARTIFICIELLE</FDText>

            <GlassCard style={styles.sectionCardNoPad}>
              <CredentialField
                label="Clé API Gemini"
                credKey="geminiApiKey"
                placeholder="AIza..."
                helpText="Obtenez votre clé sur ai.google.dev"
              />
              <RowDivider />
              <View style={styles.modelSelectorSection}>
                <FDText variant="label" style={styles.modelSelectorLabel}>
                  MODÈLE
                </FDText>
                <ModelSelector />
              </View>
            </GlassCard>
          </View>

          {/* ── Intégrations ── */}
          <View style={[styles.section, styles.sectionGap]}>
            <FDText variant="label">INTÉGRATIONS</FDText>

            <GlassCard style={styles.integrationCard}>
              <IntegrationRow
                icon={<Icon name="Airtable" color="white" size={16} />}
                iconBg={COLORS.airtable}
                name="Airtable"
                subtitle="Base de données tâches"
                status={airtableStatus}
              />
              <RowDivider />
              <IntegrationRow
                icon={<Icon name="Supabase" color="white" size={16} />}
                iconBg={COLORS.supabase}
                name="Supabase"
                subtitle="Sync en temps réel"
                status={supabaseStatus}
              />
              <RowDivider />
              <IntegrationRow
                icon={<Icon name="Google" color="white" size={16} />}
                iconBg={COLORS.google}
                name="Google Agenda"
                subtitle="Événements du calendrier"
                status={googleStatus}
              />
            </GlassCard>

            {/* Google OAuth */}
            <GlassCard style={styles.sectionCardNoPad}>
              <View style={styles.credField}>
                <FDText variant="label" style={{ marginBottom: SPACING.sm }}>
                  GOOGLE AGENDA
                </FDText>
                {!hasGoogle ? (
                  <>
                    <Button
                      variant="ai"
                      onPress={() => { void promptAsync(); }}
                      disabled={!request}
                      icon={<Icon name="Google" color={COLORS.accent} size={16} />}
                    >
                      Connecter Google Agenda
                    </Button>
                    <FDText
                      variant="caption"
                      color={COLORS.textMuted}
                      style={{ marginTop: SPACING.sm }}
                    >
                      Redirect URI à configurer dans Google Cloud Console :
                    </FDText>
                    <FDText
                      variant="mono"
                      style={styles.uriBox}
                    >
                      {redirectUri}
                    </FDText>
                  </>
                ) : (
                  <Row style={{ justifyContent: 'space-between' }}>
                    <FDText variant="caption" color={COLORS.successText}>
                      ✓ Compte connecté
                    </FDText>
                    <Button
                      variant="ghost"
                      size="sm"
                      onPress={() => {
                        void setCredentials({
                          googleAccessToken: null,
                          googleRefreshToken: null,
                          googleTokenExpiry: null,
                        });
                      }}
                    >
                      Déconnecter
                    </Button>
                  </Row>
                )}
              </View>
            </GlassCard>

            {/* Airtable credentials */}
            <GlassCard style={styles.sectionCardNoPad}>
              <CredentialField
                label="Airtable — Clé API"
                credKey="airtableApiKey"
                placeholder="keyXXXX... ou patXXXX..."
              />
              <RowDivider />
              <CredentialField
                label="Airtable — Base ID"
                credKey="airtableBaseId"
                placeholder="appXXXX..."
                helpText="Visible dans l'URL de votre base Airtable"
              />
              <RowDivider />
              {/* Dynamic table selector instead of manual input */}
              <AirtableTableSelector />
            </GlassCard>

            {/* Supabase credentials */}
            <GlassCard style={styles.sectionCardNoPad}>
              <CredentialField
                label="Supabase — URL"
                credKey="supabaseUrl"
                placeholder="https://xxx.supabase.co"
              />
              <RowDivider />
              <CredentialField
                label="Supabase — Anon Key"
                credKey="supabaseAnonKey"
                placeholder="eyJhbGciOiJ..."
              />
            </GlassCard>
          </View>

          {/* ── Paramètres ── */}
          <View style={[styles.section, styles.sectionGap]}>
            <FDText variant="label">PARAMÈTRES</FDText>

            <GlassCard style={styles.settingsCard}>
              <SettingRow
                label="Notifications"
                rightElement={<Icon name="ChevronRight" color={COLORS.textFaint} size={16} />}
              />
              <RowDivider />
              <SettingRow
                label="Langue"
                value="Français"
                rightElement={<Icon name="ChevronRight" color={COLORS.textFaint} size={16} />}
              />
            </GlassCard>
          </View>

          {/* ── Déconnexion ── */}
          <View style={[styles.section, styles.sectionGap, styles.logoutSection]}>
            <Button
              variant="danger"
              onPress={() => { void clearCredentials(); }}
              icon={<Icon name="Logout" color={COLORS.dangerText} size={16} />}
            >
              Réinitialiser tous les credentials
            </Button>
            <FDText variant="caption" align="center" style={styles.version}>
              FlowDesk v1.0.0
            </FDText>
          </View>
        </ScrollView>
      </SafeAreaView>
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
  scrollContent: {
    paddingBottom: 120,
  },

  section: {
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
  } as ViewStyle,
  sectionGap: {
    marginTop: SPACING.xl,
    gap: SPACING.sm,
  } as ViewStyle,

  // Glass card
  glassCard: {
    borderRadius: RADII.md,
    borderWidth: 1,
    borderColor: COLORS.hairline,
    overflow: 'hidden',
    padding: SPACING.lg,
  } as ViewStyle,
  sectionCardNoPad: {
    padding: 0,
  } as ViewStyle,
  integrationCard: {
    padding: 0,
    paddingHorizontal: SPACING.lg,
  } as ViewStyle,
  settingsCard: {
    padding: 0,
  } as ViewStyle,

  // Identity
  identityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  } as ViewStyle,

  // CredentialField
  credField: {
    padding: SPACING.lg,
  } as ViewStyle,
  credInput: {
    flex: 1,
  } as ViewStyle,
  eyeButton: {
    marginLeft: SPACING.sm,
    padding: SPACING.xs,
  } as ViewStyle,

  // URI box
  uriBox: {
    backgroundColor: COLORS.bgSurface,
    borderRadius: RADII.sm,
    borderWidth: 1,
    borderColor: COLORS.hairline,
    padding: SPACING.sm,
    marginTop: SPACING.xs,
    fontSize: 10,
  },

  // AirtableTableSelector
  selectedTableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.accentMist,
    borderRadius: RADII.sm,
    borderWidth: 1,
    borderColor: COLORS.accentGlow,
    padding: SPACING.sm,
    marginBottom: SPACING.sm,
  } as ViewStyle,
  selectedTableInfo: {
    flex: 1,
    gap: 2,
  } as ViewStyle,

  // Modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(20,18,42,0.5)',
    justifyContent: 'flex-end',
  } as ViewStyle,
  modalSheet: {
    backgroundColor: COLORS.bgBase,
    borderTopLeftRadius: RADII.xl,
    borderTopRightRadius: RADII.xl,
    maxHeight: '70%',
    paddingBottom: SPACING.xl,
  } as ViewStyle,
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.hairline,
  } as ViewStyle,
  modalClose: {
    padding: SPACING.xs,
  } as ViewStyle,
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  } as ViewStyle,
  tableRowSelected: {
    backgroundColor: COLORS.accentMist,
  } as ViewStyle,
  tableRowContent: {
    flex: 1,
    gap: 2,
  } as ViewStyle,
  emptyTables: {
    padding: SPACING.xl,
  } as ViewStyle,

  // ModelSelector
  modelSelectorSection: {
    padding: SPACING.lg,
    gap: SPACING.sm,
  } as ViewStyle,
  modelSelectorLabel: {
    marginBottom: SPACING.xs,
  },
  modelSelector: {
    gap: SPACING.xs,
  } as ViewStyle,
  modelOption: {
    padding: SPACING.md,
    borderRadius: RADII.sm,
    borderWidth: 1,
    borderColor: COLORS.hairline,
    gap: 2,
  } as ViewStyle,
  modelOptionSelected: {
    backgroundColor: COLORS.accentMist,
    borderColor: COLORS.accent,
  } as ViewStyle,

  // SettingRow
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
  } as ViewStyle,
  settingValue: {
    marginRight: SPACING.xs,
  },

  // Logout
  logoutSection: {
    alignItems: 'stretch',
    gap: SPACING.md,
  } as ViewStyle,
  version: {
    marginTop: SPACING.xs,
    color: COLORS.textFaint,
  },
});