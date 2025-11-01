import React from 'react';
import { View, StyleSheet, Text, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { Candidate } from '../lib/types';
import { colors, typography, spacing, borderRadius, shadows } from '../utils/theme';

interface CandidateCardProps {
  candidate: Candidate;
}

export function CandidateCard({ candidate }: CandidateCardProps) {
  const { user, profile, intent } = candidate;

  const initials = user.display_name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const getRoleLabel = (seeking?: string) => {
    switch (seeking) {
      case 'founder': return 'Founder';
      case 'cofounder': return 'Cofounder';
      case 'teammate': return 'Teammate';
      case 'mentor': return 'Mentor';
      case 'investor': return 'Investor';
      default: return 'User';
    }
  };

  const getRoleIcon = (seeking?: string) => {
    switch (seeking) {
      case 'founder': return 'account';
      case 'cofounder': return 'account-multiple';
      case 'teammate': return 'account-group';
      case 'mentor': return 'school';
      case 'investor': return 'cash-multiple';
      default: return 'account';
    }
  };

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
          <View style={styles.nameRow}>
            <Text style={styles.name}>{user.display_name}</Text>
            {intent?.seeking && (
              <View style={styles.roleBadge}>
                <MaterialCommunityIcons 
                  name={getRoleIcon(intent.seeking) as any} 
                  size={12} 
                  color={colors.primary} 
                />
                <Text style={styles.roleText}>{getRoleLabel(intent.seeking)}</Text>
              </View>
            )}
          </View>
          <View style={styles.metaRow}>
            <MaterialCommunityIcons name="cake-variant" size={16} color={colors.textSecondary} />
            <Text style={styles.meta}>{user.age_band}</Text>
            <Text style={styles.separator}>•</Text>
            <MaterialCommunityIcons name="map-marker" size={16} color={colors.textSecondary} />
            <Text style={styles.meta} numberOfLines={1}>{(user.timezone.split('/')[1] || user.timezone).replace(/_/g, ' ')}</Text>
          </View>
        </View>
      </View>

      <ScrollView 
        style={styles.scrollContent} 
        contentContainerStyle={styles.scrollContentContainer}
        showsVerticalScrollIndicator={false}
      >
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

        {/* Intent Section */}
        {intent && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="target" size={18} color={colors.success} />
              <Text style={styles.sectionTitle}>
                {intent.seeking === 'investor' ? 'Investment Focus' : 
                 intent.seeking === 'mentor' ? 'Mentorship' : 
                 'Looking For'}
              </Text>
            </View>

            {/* Role Badge */}
            <View style={styles.roleBadge}>
              <MaterialCommunityIcons 
                name={intent.seeking === 'investor' ? 'cash-multiple' : 
                     intent.seeking === 'mentor' ? 'school' : 
                     'account-search'} 
                size={16} 
                color={colors.primary} 
              />
              <Text style={styles.roleText}>{intent.seeking}</Text>
            </View>

            {/* Expertise Areas */}
            {intent.expertise_areas && intent.expertise_areas.length > 0 && (
              <View style={styles.subsection}>
                <Text style={styles.subsectionLabel}>
                  {intent.seeking === 'investor' ? 'Investment Sectors' : 'Expertise'}
                </Text>
                <View style={styles.chips}>
                  {intent.expertise_areas.map((area) => (
                    <View key={area} style={[styles.chip, styles.expertiseChip]}>
                      <Text style={styles.chipText}>{area}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Experience Level */}
            {intent.experience_level && (
              <View style={styles.intentDetail}>
                <MaterialCommunityIcons 
                  name={intent.seeking === 'investor' ? 'trending-up' : 'medal'} 
                  size={16} 
                  color={colors.accent} 
                />
                <Text style={styles.intentLabel}>
                  {intent.seeking === 'investor' ? 'Stage:' : 'Experience:'}
                </Text>
                <Text style={styles.intentValue}>
                  {intent.experience_level === 'pre-seed' ? 'Pre-seed' :
                   intent.experience_level === 'seed' ? 'Seed' :
                   intent.experience_level === 'series-a' ? 'Series A' :
                   intent.experience_level === 'growth' ? 'Growth' :
                   intent.experience_level === '5-10' ? '5-10 years' :
                   intent.experience_level === '10-15' ? '10-15 years' :
                   intent.experience_level === '15+' ? '15+ years' :
                   intent.experience_level}
                </Text>
              </View>
            )}

            {/* Investment Type (Investors only) */}
            {intent.investment_type && (
              <View style={styles.intentDetail}>
                <MaterialCommunityIcons name="briefcase" size={16} color={colors.accent} />
                <Text style={styles.intentLabel}>Type:</Text>
                <Text style={styles.intentValue}>
                  {intent.investment_type === 'angel' ? 'Angel' :
                   intent.investment_type === 'vc' ? 'VC' :
                   intent.investment_type === 'family-office' ? 'Family Office' :
                   intent.investment_type === 'corporate-vc' ? 'Corporate VC' :
                   intent.investment_type === 'fund-manager' ? 'Fund Manager' :
                   intent.investment_type}
                </Text>
              </View>
            )}

            {/* Portfolio Size (Investors only) */}
            {intent.portfolio_size && (
              <View style={styles.intentDetail}>
                <MaterialCommunityIcons name="chart-line" size={16} color={colors.accent} />
                <Text style={styles.intentLabel}>Portfolio:</Text>
                <Text style={styles.intentValue}>{intent.portfolio_size} investments</Text>
              </View>
            )}

            {/* Availability */}
            {intent.availability_text && (
              <View style={styles.availabilityCard}>
                <MaterialCommunityIcons name="calendar-clock" size={16} color={colors.primary} />
                <Text style={styles.availabilityText}>{intent.availability_text}</Text>
              </View>
            )}
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
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  name: {
    fontSize: typography.fontSizes.xl,
    fontFamily: typography.fontFamilies.regular,
    color: colors.text,
    letterSpacing: -0.5,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.primary + '20',
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  roleText: {
    fontSize: typography.fontSizes.xs,
    fontFamily: typography.fontFamilies.regular,
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
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
  },
  scrollContentContainer: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
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
  expertiseChip: {
    backgroundColor: `${colors.success}33`,
    borderWidth: 1,
    borderColor: colors.success,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: `${colors.primary}22`,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  roleText: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamilies.regular,
    color: colors.primary,
    textTransform: 'capitalize',
  },
  subsection: {
    marginBottom: spacing.md,
  },
  subsectionLabel: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamilies.regular,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  intentDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
    backgroundColor: colors.background,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
  },
  intentLabel: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamilies.regular,
    color: colors.textTertiary,
  },
  intentValue: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamilies.regular,
    color: colors.text,
  },
  availabilityCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: `${colors.primary}11`,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: `${colors.primary}33`,
    marginTop: spacing.sm,
  },
  availabilityText: {
    flex: 1,
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamilies.regular,
    color: colors.textSecondary,
    lineHeight: typography.fontSizes.sm * typography.lineHeights.relaxed,
  },
});

