import React from 'react';
import { View, StyleSheet, Text, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { Candidate } from '../lib/types';
import { colors, typography, spacing, borderRadius, shadows } from '../utils/theme';

interface CandidateCardProps {
  candidate: Candidate;
}

export function CandidateCard({ candidate }: CandidateCardProps) {
  const { user, profile } = candidate;

  const initials = user.display_name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <View style={styles.card}>
      {/* Avatar Section */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={styles.verificationBadge}>
            <MaterialCommunityIcons name="check-decagram" size={16} color={colors.primary} />
          </View>
        </View>
        
        <View style={styles.headerInfo}>
          <Text style={styles.name}>{user.display_name}</Text>
          <View style={styles.metaRow}>
            <MaterialCommunityIcons name="cake-variant" size={16} color={colors.textSecondary} />
            <Text style={styles.meta}>{user.age_band}</Text>
            <Text style={styles.separator}>•</Text>
            <MaterialCommunityIcons name="map-marker" size={16} color={colors.textSecondary} />
            <Text style={styles.meta} numberOfLines={1}>{(user.timezone.split('/')[1] || user.timezone).replace(/_/g, ' ')}</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Headline */}
        {profile.headline && (
          <View style={styles.section}>
            <Text style={styles.headline}>{profile.headline}</Text>
          </View>
        )}

        {/* Bio */}
        {profile.bio && (
          <View style={styles.section}>
            <Text style={styles.bio}>{profile.bio}</Text>
          </View>
        )}

        {/* Stage & Commitment */}
        <View style={styles.infoGrid}>
          {profile.stage && (
            <View style={styles.infoCard}>
              <MaterialCommunityIcons name="rocket-launch" size={20} color={colors.primary} />
              <Text style={styles.infoLabel}>Stage</Text>
              <Text style={styles.infoValue}>{profile.stage}</Text>
            </View>
          )}
          {profile.commitment_hours && (
            <View style={styles.infoCard}>
              <MaterialCommunityIcons name="clock-outline" size={20} color={colors.accent} />
              <Text style={styles.infoLabel}>Commitment</Text>
              <Text style={styles.infoValue}>{profile.commitment_hours}h/week</Text>
            </View>
          )}
        </View>

        {/* Domains */}
        {profile.domains.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="lightbulb" size={18} color={colors.primary} />
              <Text style={styles.sectionTitle}>Domains</Text>
            </View>
            <View style={styles.chips}>
              {profile.domains.map((domain) => (
                <View key={domain} style={[styles.chip, styles.domainChip]}>
                  <Text style={styles.chipText}>{domain}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Skills */}
        {profile.skills.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="wrench" size={18} color={colors.accent} />
              <Text style={styles.sectionTitle}>Skills</Text>
            </View>
            <View style={styles.chips}>
              {profile.skills.map((skill) => (
                <View key={skill} style={[styles.chip, styles.skillChip]}>
                  <Text style={styles.chipText}>{skill}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    marginHorizontal: spacing.lg,
    marginVertical: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.large,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.background,
    borderBottomWidth: 0,
  },
  avatarContainer: {
    marginRight: spacing.md,
    position: 'relative',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.surface,
    ...shadows.medium,
  },
  avatarText: {
    fontSize: typography.fontSizes.xxl,
    fontFamily: typography.fontFamilies.regular,
    color: colors.text,
  },
  verificationBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.surface,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.background,
  },
  headerInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    fontSize: typography.fontSizes.xl,
    fontFamily: typography.fontFamilies.regular,
    color: colors.text,
    marginBottom: spacing.xs,
    letterSpacing: -0.5,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flexShrink: 1,
  },
  meta: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamilies.regular,
    color: colors.textSecondary,
  },
  separator: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamilies.regular,
    color: colors.textSecondary,
    marginHorizontal: spacing.xs,
  },
  scrollContent: {
    flex: 1,
    padding: spacing.lg,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  sectionTitle: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamilies.regular,
    color: colors.text,
  },
  headline: {
    fontSize: typography.fontSizes.lg,
    fontFamily: typography.fontFamilies.regular,
    color: colors.primary,
    lineHeight: typography.fontSizes.lg * typography.lineHeights.normal,
  },
  bio: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamilies.regular,
    color: colors.textSecondary,
    lineHeight: typography.fontSizes.base * typography.lineHeights.relaxed,
  },
  infoGrid: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  infoCard: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    gap: spacing.xs,
    ...shadows.small,
  },
  infoLabel: {
    fontSize: typography.fontSizes.xs,
    fontFamily: typography.fontFamilies.regular,
    color: colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamilies.regular,
    color: colors.text,
    textTransform: 'capitalize',
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
    fontFamily: typography.fontFamilies.regular,
    color: colors.text,
  },
});

