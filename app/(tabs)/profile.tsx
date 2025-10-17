import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator, Alert, Text as RNText, TouchableOpacity } from 'react-native';
import { Text, Snackbar } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSession } from '../../lib/hooks/useSession';
import { getCurrentUserProfile, uploadAvatar, getAvatarUrl } from '../../lib/api/profile';
import { signOut, deleteAccount } from '../../lib/api/auth';
import { useRouter } from 'expo-router';
import type { User, Profile, Intent } from '../../lib/types';
import { colors, typography, spacing, borderRadius, shadows } from '../../utils/theme';

export default function ProfileScreen() {
  const router = useRouter();
  const { user: authUser } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [intent, setIntent] = useState<Intent | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadProfile = async () => {
    if (!authUser) return;

    setLoading(true);
    try {
      const data = await getCurrentUserProfile(authUser.id);
      setUser(data.user);
      setProfile(data.profile);
      setIntent(data.intent);

      const url = await getAvatarUrl(authUser.id);
      setAvatarUrl(url);
    } catch (err: any) {
      console.error('Failed to load profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [authUser]);

  const handleUploadAvatar = async () => {
    if (!authUser) return;

    try {
      const url = await uploadAvatar(authUser.id);
      if (url) {
        setAvatarUrl(url);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to upload avatar');
    }
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut();
            router.replace('/(auth)/signin');
          } catch (err: any) {
            setError(err.message || 'Failed to sign out');
          }
        },
      },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      '⚠️ This will permanently delete your account and all your data. This action cannot be undone.\n\nAre you absolutely sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Forever',
          style: 'destructive',
          onPress: async () => {
            if (!authUser) return;
            
            try {
              setLoading(true);
              await deleteAccount(authUser.id);
              // User will be automatically redirected to sign-in by AuthGuard
              router.replace('/(auth)/signin');
            } catch (err: any) {
              setLoading(false);
              setError(err.message || 'Failed to delete account');
              Alert.alert('Error', 'Failed to delete account. Please try again.');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.centered}>
        <Text>Failed to load profile</Text>
      </View>
    );
  }

  const initials = user.display_name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  // Calculate profile completion
  const totalFields = 8;
  let completedFields = 2; // Always have name and age
  if (profile?.headline) completedFields++;
  if (profile?.bio) completedFields++;
  if (profile?.stage) completedFields++;
  if (profile?.commitment_hours) completedFields++;
  if (profile?.domains && profile.domains.length > 0) completedFields++;
  if (profile?.skills && profile.skills.length > 0) completedFields++;
  const completionPercent = Math.round((completedFields / totalFields) * 100);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header with Avatar */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <RNText style={styles.avatarText}>{initials}</RNText>
          </View>
          <TouchableOpacity style={styles.avatarEditButton} onPress={handleUploadAvatar}>
            <MaterialCommunityIcons name="camera" size={16} color={colors.text} />
          </TouchableOpacity>
        </View>

        <RNText style={styles.name}>{user.display_name}</RNText>
        
        <View style={styles.metaRow}>
          <MaterialCommunityIcons name="cake-variant" size={16} color={colors.textSecondary} />
          <RNText style={styles.meta}>{user.age_band}</RNText>
          <RNText style={styles.separator}>•</RNText>
          <MaterialCommunityIcons name="map-marker" size={16} color={colors.textSecondary} />
          <RNText style={styles.meta}>{user.timezone.split('/')[1] || user.timezone}</RNText>
        </View>

        {/* Profile Completion */}
        <View style={styles.completionCard}>
          <View style={styles.completionHeader}>
            <RNText style={styles.completionTitle}>Profile Completion</RNText>
            <RNText style={styles.completionPercent}>{completionPercent}%</RNText>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${completionPercent}%` }]} />
          </View>
        </View>
      </View>

      {/* Profile Section */}
      {profile && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="account" size={20} color={colors.primary} />
            <RNText style={styles.sectionTitle}>Profile</RNText>
          </View>

          {profile.headline && (
            <View style={styles.infoCard}>
              <MaterialCommunityIcons name="format-quote-close" size={20} color={colors.primary} />
              <View style={styles.infoContent}>
                <RNText style={styles.infoLabel}>Headline</RNText>
                <RNText style={styles.infoValue}>{profile.headline}</RNText>
              </View>
            </View>
          )}

          {profile.bio && (
            <View style={styles.infoCard}>
              <MaterialCommunityIcons name="text" size={20} color={colors.accent} />
              <View style={styles.infoContent}>
                <RNText style={styles.infoLabel}>Bio</RNText>
                <RNText style={styles.infoValue}>{profile.bio}</RNText>
              </View>
            </View>
          )}

          <View style={styles.statsGrid}>
            {profile.stage && (
              <View style={styles.statCard}>
                <MaterialCommunityIcons name="rocket-launch" size={24} color={colors.primary} />
                <RNText style={styles.statLabel}>Stage</RNText>
                <RNText style={styles.statValue}>{profile.stage}</RNText>
              </View>
            )}
            {profile.commitment_hours && (
              <View style={styles.statCard}>
                <MaterialCommunityIcons name="clock-outline" size={24} color={colors.accent} />
                <RNText style={styles.statLabel}>Commitment</RNText>
                <RNText style={styles.statValue}>{profile.commitment_hours}h/wk</RNText>
              </View>
            )}
          </View>

          {profile.domains && profile.domains.length > 0 && (
            <View style={styles.chipsSection}>
              <RNText style={styles.chipsLabel}>Domains</RNText>
              <View style={styles.chips}>
                {profile.domains.map((domain) => (
                  <View key={domain} style={[styles.chip, styles.domainChip]}>
                    <RNText style={styles.chipText}>{domain}</RNText>
                  </View>
                ))}
              </View>
            </View>
          )}

          {profile.skills && profile.skills.length > 0 && (
            <View style={styles.chipsSection}>
              <RNText style={styles.chipsLabel}>Skills</RNText>
              <View style={styles.chips}>
                {profile.skills.map((skill) => (
                  <View key={skill} style={[styles.chip, styles.skillChip]}>
                    <RNText style={styles.chipText}>{skill}</RNText>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      )}

      {/* Intent Section */}
      {intent && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="target" size={20} color={colors.accent} />
            <RNText style={styles.sectionTitle}>What I'm Looking For</RNText>
          </View>

          <View style={styles.infoCard}>
            <MaterialCommunityIcons name="account-search" size={20} color={colors.primary} />
            <View style={styles.infoContent}>
              <RNText style={styles.infoLabel}>Seeking</RNText>
              <RNText style={styles.infoValue}>{intent.seeking}</RNText>
            </View>
          </View>

          {intent.availability_text && (
            <View style={styles.infoCard}>
              <MaterialCommunityIcons name="calendar" size={20} color={colors.accent} />
              <View style={styles.infoContent}>
                <RNText style={styles.infoLabel}>Availability</RNText>
                <RNText style={styles.infoValue}>{intent.availability_text}</RNText>
              </View>
            </View>
          )}
        </View>
      )}

      {/* Account Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <MaterialCommunityIcons name="cog" size={20} color={colors.textSecondary} />
          <RNText style={styles.sectionTitle}>Account</RNText>
        </View>

        <View style={styles.infoCard}>
          <MaterialCommunityIcons name="translate" size={20} color={colors.textSecondary} />
          <View style={styles.infoContent}>
            <RNText style={styles.infoLabel}>Languages</RNText>
            <RNText style={styles.infoValue}>{user.languages.join(', ')}</RNText>
          </View>
        </View>

        <View style={styles.infoCard}>
          <MaterialCommunityIcons name="shield-check" size={20} color={colors.success} />
          <View style={styles.infoContent}>
            <RNText style={styles.infoLabel}>Verification Tier</RNText>
            <RNText style={styles.infoValue}>Level {user.verification_tier}</RNText>
          </View>
        </View>
      </View>

      <TouchableOpacity onPress={handleSignOut} style={styles.signOutButton} activeOpacity={0.8}>
        <MaterialCommunityIcons name="logout" size={20} color={colors.error} />
        <RNText style={styles.signOutText}>Sign Out</RNText>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleDeleteAccount} style={styles.deleteAccountButton} activeOpacity={0.8}>
        <MaterialCommunityIcons name="delete-forever" size={20} color={colors.error} />
        <RNText style={styles.deleteAccountText}>Delete Account</RNText>
      </TouchableOpacity>

      <View style={styles.bottomSpacer} />

      <Snackbar visible={!!error} onDismiss={() => setError('')} duration={4000} style={styles.errorSnackbar}>
        {error}
      </Snackbar>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  header: {
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: spacing.md,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.large,
  },
  avatarText: {
    fontSize: typography.fontSizes.display,
    fontFamily: typography.fontFamilies.bold,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
  },
  avatarEditButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.surface,
    ...shadows.medium,
  },
  name: {
    fontSize: typography.fontSizes.xxl,
    fontFamily: typography.fontFamilies.bold,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },
  meta: {
    fontSize: typography.fontSizes.sm,
    color: colors.textSecondary,
  },
  separator: {
    fontSize: typography.fontSizes.sm,
    color: colors.textTertiary,
    marginHorizontal: spacing.xs,
  },
  completionCard: {
    width: '100%',
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.small,
  },
  completionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  completionTitle: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamilies.medium,
    color: colors.textSecondary,
  },
  completionPercent: {
    fontSize: typography.fontSizes.lg,
    fontFamily: typography.fontFamilies.bold,
    fontWeight: typography.fontWeights.bold,
    color: colors.primary,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
  },
  section: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: typography.fontSizes.lg,
    fontFamily: typography.fontFamilies.bold,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    gap: spacing.md,
    ...shadows.small,
  },
  infoContent: {
    flex: 1,
    gap: spacing.xs,
  },
  infoLabel: {
    fontSize: typography.fontSizes.xs,
    color: colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamilies.regular,
    color: colors.text,
    lineHeight: typography.fontSizes.base * typography.lineHeights.normal,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    gap: spacing.xs,
    ...shadows.small,
  },
  statLabel: {
    fontSize: typography.fontSizes.xs,
    color: colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamilies.bold,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
    textTransform: 'capitalize',
  },
  chipsSection: {
    gap: spacing.sm,
  },
  chipsLabel: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamilies.medium,
    color: colors.textSecondary,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  domainChip: {
    backgroundColor: `${colors.primary}33`,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  skillChip: {
    backgroundColor: `${colors.accent}33`,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  chipText: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamilies.medium,
    color: colors.text,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.error,
    ...shadows.small,
  },
  signOutText: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamilies.bold,
    fontWeight: typography.fontWeights.bold,
    color: colors.error,
  },
  deleteAccountButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.error,
    borderRadius: borderRadius.lg,
    ...shadows.medium,
  },
  deleteAccountText: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamilies.bold,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
  },
  bottomSpacer: {
    height: spacing.xl,
  },
  errorSnackbar: {
    backgroundColor: colors.error,
  },
});

