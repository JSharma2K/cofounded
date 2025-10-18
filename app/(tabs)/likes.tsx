import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Text as RNText, Dimensions } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSession } from '../../lib/hooks/useSession';
import { supabase } from '../../lib/supabase';
import type { User, Profile } from '../../lib/types';
import { colors, typography, spacing, borderRadius, shadows } from '../../utils/theme';

const { width } = Dimensions.get('window');
const cardWidth = (width - spacing.lg * 3) / 2;

interface LikeWithUser {
  id: string;
  user_id: string;
  target_id: string;
  created_at: string;
  user: User;
  profile: Profile | null;
}

export default function LikesScreen() {
  const router = useRouter();
  const { user } = useSession();
  const [likes, setLikes] = useState<LikeWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadLikes = async () => {
    if (!user) return;

    setLoading(true);
    setError('');

    try {
      // Get swipes where current user is the target (received likes)
      const { data: swipes, error: swipesError } = await supabase
        .from('swipes')
        .select('*')
        .eq('target_id', user.id)
        .eq('direction', 'like')
        .order('created_at', { ascending: false });

      if (swipesError) {
        console.error('Error fetching likes:', swipesError);
        throw swipesError;
      }

      if (!swipes || swipes.length === 0) {
        setLikes([]);
        setLoading(false);
        return;
      }

      // Get user IDs who liked the current user
      const userIds = swipes.map(swipe => swipe.user_id);
      
      // Fetch user data and profiles
      const [usersRes, profilesRes] = await Promise.all([
        supabase.from('users').select('*').in('id', userIds),
        supabase.from('profiles').select('*').in('user_id', userIds),
      ]);

      if (usersRes.error) throw usersRes.error;
      if (profilesRes.error) throw profilesRes.error;

      const usersMap = new Map(usersRes.data?.map((u: User) => [u.id, u]) || []);
      const profilesMap = new Map(profilesRes.data?.map((p: Profile) => [p.user_id, p]) || []);

      // Combine swipe data with user data
      const likesWithUsers: LikeWithUser[] = swipes.map(swipe => ({
        id: swipe.id,
        user_id: swipe.user_id,
        target_id: swipe.target_id,
        created_at: swipe.created_at,
        user: usersMap.get(swipe.user_id)!,
        profile: profilesMap.get(swipe.user_id) || null,
      }));

      setLikes(likesWithUsers);
    } catch (err: any) {
      console.error('Failed to load likes:', err);
      setError(err.message || 'Failed to load likes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLikes();
  }, [user]);

  const handleLikeBack = async (targetUserId: string) => {
    if (!user) return;

    try {
      // Create a like swipe back to the user who liked you
      const { error } = await supabase
        .from('swipes')
        .insert({
          user_id: user.id,
          target_id: targetUserId,
          direction: 'like',
        });

      if (error) throw error;

      // Remove from likes list
      setLikes(prev => prev.filter(like => like.user_id !== targetUserId));
      
      // TODO: Check if this creates a match and handle accordingly
    } catch (err: any) {
      console.error('Failed to like back:', err);
      setError(err.message || 'Failed to like back');
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (likes.length === 0) {
    return (
      <View style={styles.centered}>
        <MaterialCommunityIcons name="account-heart" size={80} color={colors.textTertiary} />
        <Text variant="titleLarge" style={styles.emptyTitle}>
          No likes yet
        </Text>
        <Text variant="bodyMedium" style={styles.emptySubtitle}>
          Keep swiping to get more likes from potential cofounders!
        </Text>
        <TouchableOpacity onPress={loadLikes} style={styles.refreshButton} activeOpacity={0.8}>
          <MaterialCommunityIcons name="refresh" size={20} color={colors.text} />
          <RNText style={styles.refreshText}>Refresh</RNText>
        </TouchableOpacity>
      </View>
    );
  }

  const renderLikeCard = ({ item }: { item: LikeWithUser }) => {
    const initials = item.user.display_name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    return (
      <TouchableOpacity
        style={styles.likeCard}
        onPress={() => handleLikeBack(item.user_id)}
        activeOpacity={0.8}
      >
        <View style={styles.cardHeader}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <RNText style={styles.avatarText}>{initials}</RNText>
            </View>
            <View style={styles.likeIndicator} />
          </View>
          <RNText style={styles.timestamp}>Today</RNText>
        </View>
        
        <View style={styles.cardContent}>
          <RNText style={styles.name}>{item.user.display_name}</RNText>
          <RNText style={styles.title}>{item.profile?.headline || 'Cofounder'}</RNText>
          
          <View style={styles.badges}>
            {item.profile?.stage && (
              <View style={styles.badge}>
                <MaterialCommunityIcons name="rocket-launch" size={12} color={colors.text} />
                <RNText style={styles.badgeText}>{item.profile.stage}</RNText>
              </View>
            )}
            {item.profile?.commitment_hours && (
              <View style={styles.badge}>
                <MaterialCommunityIcons name="clock-outline" size={12} color={colors.text} />
                <RNText style={styles.badgeText}>{item.profile.commitment_hours}h/Wk</RNText>
              </View>
            )}
          </View>
        </View>

        <View style={styles.likeBackButton}>
          <MaterialCommunityIcons name="thumb-up" size={16} color={colors.primary} />
          <RNText style={styles.likeBackText}>Like Back</RNText>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={likes}
        renderItem={renderLikeCard}
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
    fontFamily: typography.fontFamilies.ui,
    color: colors.text,
    marginTop: spacing.lg,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamilies.ui,
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
    fontFamily: typography.fontFamilies.ui,
  },
  gridContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  likeCard: {
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
  likeIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
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
    marginBottom: spacing.sm,
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
  likeBackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
  },
  likeBackText: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamilies.ui,
    color: colors.text,
    fontWeight: '600',
  },
});
