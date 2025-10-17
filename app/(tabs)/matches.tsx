import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Text as RNText } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSession } from '../../lib/hooks/useSession';
import { getMatches, getOtherUser } from '../../lib/api/matches';
import { MatchListItem } from '../../components/MatchListItem';
import type { MatchWithUsers } from '../../lib/types';
import { colors, typography, spacing, borderRadius, shadows } from '../../utils/theme';

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
          No matches yet
        </Text>
        <Text variant="bodyMedium" style={styles.emptySubtitle}>
          Keep swiping to find your perfect cofounder match!
        </Text>
        <TouchableOpacity onPress={loadMatches} style={styles.refreshButton} activeOpacity={0.8}>
          <MaterialCommunityIcons name="refresh" size={20} color={colors.text} />
          <RNText style={styles.refreshText}>Refresh</RNText>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <RNText style={styles.headerTitle}>Your Matches</RNText>
        <RNText style={styles.headerSubtitle}>{matches.length} {matches.length === 1 ? 'match' : 'matches'}</RNText>
      </View>
      <FlatList
        data={matches}
        renderItem={({ item }) => (
          <MatchListItem
            match={item}
            currentUserId={user?.id || ''}
            onPress={() => router.push(`/(tabs)/chat/${item.id}`)}
          />
        )}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
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
  header: {
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: typography.fontSizes.xxl,
    fontFamily: typography.fontFamilies.bold,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    fontSize: typography.fontSizes.sm,
    color: colors.textSecondary,
  },
  listContent: {
    paddingVertical: spacing.md,
    paddingBottom: spacing.xl,
  },
});

