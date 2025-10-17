import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { MatchWithUsers } from '../lib/types';
import { colors, typography, spacing, borderRadius, shadows } from '../utils/theme';

interface MatchListItemProps {
  match: MatchWithUsers;
  currentUserId: string;
  onPress: () => void;
}

export function MatchListItem({ match, currentUserId, onPress }: MatchListItemProps) {
  const otherUser = match.user_a === currentUserId ? match.user_b_data : match.user_a_data;

  if (!otherUser) return null;

  const initials = otherUser.display_name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const matchDate = new Date(match.created_at);
  const now = new Date();
  const diffMs = now.getTime() - matchDate.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  let matchTimeText = '';
  if (diffDays === 0) {
    matchTimeText = 'Today';
  } else if (diffDays === 1) {
    matchTimeText = 'Yesterday';
  } else if (diffDays < 7) {
    matchTimeText = `${diffDays}d ago`;
  } else {
    matchTimeText = matchDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  return (
    <TouchableOpacity onPress={onPress} style={styles.item} activeOpacity={0.7}>
      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <View style={styles.onlineIndicator} />
      </View>
      
      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text style={styles.name} numberOfLines={1}>
            {otherUser.display_name}
          </Text>
          <Text style={styles.matchTime}>{matchTimeText}</Text>
        </View>
        
        {otherUser.profile?.headline ? (
          <Text style={styles.headline} numberOfLines={1}>
            {otherUser.profile.headline}
          </Text>
        ) : (
          <View style={styles.metaRow}>
            <MaterialCommunityIcons name="cake-variant" size={12} color={colors.textTertiary} />
            <Text style={styles.meta}>{otherUser.age_band}</Text>
          </View>
        )}
        
        {otherUser.profile?.stage && (
          <View style={styles.tagRow}>
            <View style={styles.tag}>
              <MaterialCommunityIcons name="rocket-launch" size={12} color={colors.primary} />
              <Text style={styles.tagText}>{otherUser.profile.stage}</Text>
            </View>
            {otherUser.profile?.commitment_hours && (
              <View style={styles.tag}>
                <MaterialCommunityIcons name="clock-outline" size={12} color={colors.accent} />
                <Text style={styles.tagText}>{otherUser.profile.commitment_hours}h/wk</Text>
              </View>
            )}
          </View>
        )}
      </View>
      
      <MaterialCommunityIcons name="chevron-right" size={24} color={colors.textTertiary} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    marginHorizontal: spacing.md,
    marginVertical: spacing.xs,
    borderRadius: borderRadius.lg,
    ...shadows.small,
  },
  avatarContainer: {
    marginRight: spacing.md,
    position: 'relative',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.small,
  },
  avatarText: {
    fontSize: typography.fontSizes.xl,
    fontFamily: typography.fontFamilies.bold,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.success,
    borderWidth: 2,
    borderColor: colors.surface,
  },
  content: {
    flex: 1,
    gap: spacing.xs,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    flex: 1,
    fontSize: typography.fontSizes.lg,
    fontFamily: typography.fontFamilies.bold,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
  },
  matchTime: {
    fontSize: typography.fontSizes.xs,
    color: colors.textTertiary,
    marginLeft: spacing.sm,
  },
  headline: {
    fontSize: typography.fontSizes.sm,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  meta: {
    fontSize: typography.fontSizes.xs,
    color: colors.textTertiary,
  },
  tagRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  tagText: {
    fontSize: typography.fontSizes.xs,
    color: colors.text,
    textTransform: 'capitalize',
  },
});

