import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Text as RNText, Dimensions, Animated } from 'react-native';
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
  const [matchSuccess, setMatchSuccess] = useState<string | null>(null);
  const [showMatchAnimation, setShowMatchAnimation] = useState(false);
  const [matchAnimation] = useState(new Animated.Value(0));
  const [heartScale] = useState(new Animated.Value(1));
  const [heartRotation] = useState(new Animated.Value(0));

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
      const userIds = swipes.map(swipe => swipe.swiper_id);
      
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
      const likesWithUsers: LikeWithUser[] = swipes
        .map(swipe => {
          const user = usersMap.get(swipe.swiper_id);
          if (!user) {
            console.warn('User not found for swiper_id:', swipe.swiper_id);
            return null;
          }
          
          return {
            id: swipe.id,
            user_id: swipe.swiper_id,
            target_id: swipe.target_id,
            created_at: swipe.created_at,
            user: user,
            profile: profilesMap.get(swipe.swiper_id) || null,
          };
        })
        .filter((item): item is LikeWithUser => item !== null);

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

  const triggerMatchAnimation = () => {
    console.log('=== ANIMATION TRIGGER START ===');
    console.log('Current showMatchAnimation state:', showMatchAnimation);
    console.log('Setting showMatchAnimation to true');
    
    setShowMatchAnimation(true);
    console.log('showMatchAnimation set to true');
    
    // Reset animation values
    console.log('Resetting animation values');
    matchAnimation.setValue(0);
    heartScale.setValue(1);
    heartRotation.setValue(0);
    
    // Animate the match overlay
    Animated.parallel([
      Animated.timing(matchAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.timing(heartScale, {
          toValue: 1.3,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(heartScale, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(heartRotation, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Hide animation after 3 seconds to ensure it's visible
      setTimeout(() => {
        setShowMatchAnimation(false);
        router.push('/(tabs)/matches');
      }, 3000);
    });
  };

  const handleLikeBack = async (targetUserId: string) => {
    if (!user) return;

    console.log('=== LIKE BACK START ===');
    console.log('Target user ID:', targetUserId);
    console.log('Current user ID:', user.id);
    console.log('Current likes count:', likes.length);

    try {
      // Check if you've already swiped on this user
      const { data: existingSwipe, error: checkError } = await supabase
        .from('swipes')
        .select('id, direction')
        .eq('swiper_id', user.id)
        .eq('target_id', targetUserId)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      // If no existing swipe, create one
      if (!existingSwipe) {
        const { error: swipeError } = await supabase
          .from('swipes')
          .insert({
            swiper_id: user.id,
            target_id: targetUserId,
            direction: 'like',
          });

        if (swipeError) throw swipeError;
      } else if (existingSwipe.direction === 'pass') {
        // If you previously passed, update to like
        const { error: updateError } = await supabase
          .from('swipes')
          .update({ direction: 'like' })
          .eq('id', existingSwipe.id);

        if (updateError) throw updateError;
      }
      // If already liked, continue with match creation

      // Check if this creates a match (both users liked each other)
      const { data: existingMatch, error: matchCheckError } = await supabase
        .from('matches')
        .select('id')
        .or(`and(user_a.eq.${user.id},user_b.eq.${targetUserId}),and(user_a.eq.${targetUserId},user_b.eq.${user.id})`)
        .single();

      if (matchCheckError && matchCheckError.code !== 'PGRST116') {
        throw matchCheckError;
      }

      // If no existing match, create one
      if (!existingMatch) {
        console.log('Creating new match between', user.id, 'and', targetUserId);
        const { error: matchError } = await supabase
          .from('matches')
          .insert({
            user_a: user.id,
            user_b: targetUserId,
            reason: { type: 'mutual_like' }
          });

        if (matchError) {
          console.error('Match creation error:', matchError);
          throw matchError;
        }
        console.log('Match created successfully');
      } else {
        console.log('Match already exists');
      }

      // Remove from likes list
      console.log('Removing user from likes list:', targetUserId);
      setLikes(prev => {
        const newLikes = prev.filter(like => like.user_id !== targetUserId);
        console.log('Likes after removal:', newLikes.length);
        return newLikes;
      });
      
      console.log('About to trigger match animation for user:', targetUserId);
      console.log('Current showMatchAnimation state:', showMatchAnimation);
      
      // Small delay to ensure state is set before animation
      setTimeout(() => {
        triggerMatchAnimation();
      }, 100);
      
      console.log('=== LIKE BACK END ===');
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
        <View style={styles.emptyIconContainer}>
          <MaterialCommunityIcons name="thumb-up" size={80} color={colors.background} />
          <View style={styles.emptyIconOutline}>
            <MaterialCommunityIcons name="thumb-up-outline" size={80} color={colors.primary} />
          </View>
        </View>
        <RNText style={styles.emptyTitle}>
          No likes yet
        </RNText>
        <RNText style={styles.emptySubtitle}>
          Keep swiping to get more likes from potential cofounders!
        </RNText>
        <TouchableOpacity onPress={loadLikes} style={styles.refreshButton} activeOpacity={0.8}>
          <MaterialCommunityIcons name="refresh" size={20} color={colors.text} />
          <RNText style={styles.refreshText}>Refresh</RNText>
        </TouchableOpacity>
      </View>
    );
  }

  const renderLikeCard = ({ item }: { item: LikeWithUser }) => {
    if (!item.user || !item.user.display_name) {
      console.warn('Missing user data for item:', item);
      return null;
    }
    
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

  console.log('Render - showMatchAnimation:', showMatchAnimation);
  console.log('Render - likes count:', likes.length);
  
  return (
    <View style={styles.container}>
      {showMatchAnimation && (
        <Animated.View 
          style={[
            styles.matchAnimationOverlay,
            {
              opacity: matchAnimation,
              transform: [
                {
                  scale: matchAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.matchAnimationContent}>
            <Animated.View
              style={[
                styles.matchHeart,
                {
                  transform: [
                    { scale: heartScale },
                    {
                      rotate: heartRotation.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0deg', '360deg'],
                      }),
                    },
                  ],
                },
              ]}
            >
              <MaterialCommunityIcons name="thumb-up" size={80} color={colors.primary} />
            </Animated.View>
            <RNText style={styles.matchAnimationTitle}>It's a Match!</RNText>
            <RNText style={styles.matchAnimationSubtitle}>You both liked each other</RNText>
          </View>
        </Animated.View>
      )}
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
  emptyIconContainer: {
    position: 'relative',
    width: 80,
    height: 80,
  },
  emptyIconOutline: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  emptyTitle: {
    fontSize: typography.fontSizes.xxl,
    fontFamily: typography.fontFamilies.regular,
    color: colors.text,
    marginTop: spacing.lg,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamilies.regular,
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
  matchSuccess: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    margin: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
  },
  matchSuccessText: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamilies.ui,
    color: colors.text,
    fontWeight: '600',
  },
  matchAnimationOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  matchAnimationContent: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  matchHeart: {
    marginBottom: spacing.lg,
  },
  matchAnimationTitle: {
    fontSize: typography.fontSizes.xxl,
    fontFamily: typography.fontFamilies.ui,
    color: colors.text,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  matchAnimationSubtitle: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamilies.ui,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
