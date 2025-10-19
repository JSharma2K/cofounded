import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Text as RNText, Dimensions } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { useSession } from '../../lib/hooks/useSession';
import { getMatches, getOtherUser } from '../../lib/api/matches';
import type { MatchWithUsers } from '../../lib/types';
import { colors, typography, spacing, borderRadius, shadows } from '../../utils/theme';

const { width } = Dimensions.get('window');
const cardWidth = (width - spacing.lg * 3) / 2;

export default function MatchesScreen() {
  const router = useRouter();
  const { user } = useSession();
  const [matches, setMatches] = useState<MatchWithUsers[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  console.log('[MatchesScreen] User:', user?.id, 'Loading:', loading, 'Matches:', matches.length);

  const loadMatches = async () => {
    console.log('[MatchesScreen] loadMatches called, user:', user?.id);
    if (!user) {
      console.log('[MatchesScreen] No user, skipping load');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = await getMatches(user.id);
      console.log('Matches loaded:', data.length, data);
      setMatches(data);
    } catch (err: any) {
      console.error('Failed to load matches:', err);
      setError(err.message || 'Failed to load matches');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMatches();
  }, [user]);

  // Refresh matches when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      if (user) {
        loadMatches();
      }
    }, [user])
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (matches.length === 0) {
    return (
      <View style={styles.centered}>
        <MaterialCommunityIcons name="heart-outline" size={80} color={colors.textTertiary} />
        <Text variant="titleLarge" style={styles.emptyTitle}>
          No connections yet
        </Text>
        <Text variant="bodyMedium" style={styles.emptySubtitle}>
          Keep swiping to find your perfect cofounder connection!
        </Text>
        <TouchableOpacity onPress={loadMatches} style={styles.refreshButton} activeOpacity={0.8}>
          <MaterialCommunityIcons name="refresh" size={20} color={colors.text} />
          <RNText style={styles.refreshText}>Refresh</RNText>
        </TouchableOpacity>
      </View>
    );
  }

  const renderMatchCard = ({ item }: { item: MatchWithUsers }) => {
    // Check if user data exists
    if (!item.user_a_data || !item.user_b_data) {
      console.log('Missing user data in match item');
      return null;
    }
    
    const otherUser = item.user_a === user?.id ? item.user_b_data : item.user_a_data;
    const otherProfile = otherUser?.profile;
    
    if (!otherUser) {
      console.log('Other user data is null');
      return null;
    }
    
    const initials = otherUser.display_name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    return (
      <TouchableOpacity
        style={styles.matchCard}
        onPress={() => router.push(`/(tabs)/chat/${item.id}`)}
        activeOpacity={0.8}
      >
        <View style={styles.cardHeader}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <RNText style={styles.avatarText}>{initials}</RNText>
            </View>
            <View style={styles.onlineIndicator} />
          </View>
          <RNText style={styles.timestamp}>Today</RNText>
        </View>
        
        <View style={styles.cardContent}>
          <RNText style={styles.name}>{otherUser.display_name}</RNText>
          <RNText style={styles.title}>{otherProfile?.headline || 'Cofounder'}</RNText>
          
          <View style={styles.badges}>
            {otherProfile?.stage && (
              <View style={styles.badge}>
                <MaterialCommunityIcons name="rocket-launch" size={12} color={colors.text} />
                <RNText style={styles.badgeText}>{otherProfile.stage}</RNText>
              </View>
            )}
            {otherProfile?.commitment_hours && (
              <View style={styles.badge}>
                <MaterialCommunityIcons name="clock-outline" size={12} color={colors.text} />
                <RNText style={styles.badgeText}>{otherProfile.commitment_hours}h/Wk</RNText>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={matches}
        renderItem={renderMatchCard}
        keyExtractor={(item) => String(item.id)}
        numColumns={2}
        contentContainerStyle={styles.gridContent}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
      />
    </View>
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
    padding: spacing.xl,
    backgroundColor: colors.background,
    gap: spacing.lg,
  },
  emptyTitle: {
    fontSize: typography.fontSizes.xxl,
    fontFamily: typography.fontFamilies.bold,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
    marginTop: spacing.lg,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: typography.fontSizes.base,
    color: colors.textSecondary,
    textAlign: 'center',
    maxWidth: 280,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.full,
    gap: spacing.sm,
    marginTop: spacing.lg,
    ...shadows.medium,
  },
  refreshText: {
    color: colors.text,
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamilies.bold,
    fontWeight: typography.fontWeights.bold,
  },
  gridContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  matchCard: {
    width: cardWidth,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.medium,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamilies.ui,
    color: colors.text,
    fontWeight: '600',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.success,
    borderWidth: 2,
    borderColor: colors.surface,
  },
  timestamp: {
    fontSize: typography.fontSizes.xs,
    fontFamily: typography.fontFamilies.ui,
    color: colors.textSecondary,
  },
  cardContent: {
    flex: 1,
  },
  name: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamilies.ui,
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamilies.ui,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    gap: spacing.xs,
  },
  badgeText: {
    fontSize: typography.fontSizes.xs,
    fontFamily: typography.fontFamilies.ui,
    color: colors.text,
  },
});

