import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, TouchableOpacity, Text as RNText, Modal, Animated } from 'react-native';
import { Text, Snackbar } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSession } from '../../lib/hooks/useSession';
import { getCandidates, swipe } from '../../lib/api/candidates';
import { CandidateCard } from '../../components/CandidateCard';
import type { Candidate } from '../../lib/types';
import { colors, typography, spacing, borderRadius, shadows } from '../../utils/theme';

export default function FeedScreen() {
  const router = useRouter();
  const { user } = useSession();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [matchedCandidate, setMatchedCandidate] = useState<Candidate | null>(null);
  const [swipeLoading, setSwipeLoading] = useState(false);
  
  // Animation values
  const swipeAnimation = useState(new Animated.Value(0))[0];
  const fadeAnimation = useState(new Animated.Value(1))[0];

  const loadCandidates = async () => {
    if (!user) return;

    setLoading(true);
    setError('');

    try {
      const data = await getCandidates(50);
      setCandidates(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load candidates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCandidates();
  }, [user]);

  const handleSwipe = async (targetId: string, direction: 'like' | 'pass') => {
    setSwipeLoading(true);
    setError('');

    try {
      // Animate card swipe
      const targetX = direction === 'like' ? 400 : -400; // Right for like, left for pass
      
      Animated.parallel([
        Animated.timing(swipeAnimation, {
          toValue: targetX,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnimation, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Wait for animation before making the API call
      await new Promise(resolve => setTimeout(resolve, 300));

      const result = await swipe(targetId, direction);
      
      // Remove from list and reset animations
      setCandidates((prev) => prev.filter((c) => c.user.id !== targetId));
      swipeAnimation.setValue(0);
      fadeAnimation.setValue(1);

      // Check for match
      if (direction === 'like' && result.match) {
        const matched = candidates.find((c) => c.user.id === targetId);
        setMatchedCandidate(matched || null);
        setShowMatchModal(true);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to swipe');
      // Reset animations on error
      swipeAnimation.setValue(0);
      fadeAnimation.setValue(1);
    } finally {
      setSwipeLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (candidates.length === 0) {
    return (
      <View style={styles.centered}>
        <MaterialCommunityIcons name="account-search" size={80} color={colors.textTertiary} />
        <Text variant="titleLarge" style={styles.emptyTitle}>
          No more candidates
        </Text>
        <Text variant="bodyMedium" style={styles.emptySubtitle}>
          Check back later for new potential cofounders
        </Text>
        <TouchableOpacity onPress={loadCandidates} style={styles.refreshButton} activeOpacity={0.8}>
          <MaterialCommunityIcons name="refresh" size={20} color={colors.text} />
          <RNText style={styles.refreshButtonText}>Refresh</RNText>
        </TouchableOpacity>
      </View>
    );
  }

  const currentCandidate = candidates[0];

      return (
        <View style={styles.container}>
          <Animated.View 
            style={[
              styles.cardContainer,
              {
                transform: [{ translateX: swipeAnimation }],
                opacity: fadeAnimation,
              }
            ]}
          >
            <CandidateCard candidate={currentCandidate} />
          </Animated.View>

          {/* Buttons positioned below card */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              onPress={() => handleSwipe(currentCandidate.user.id, 'pass')}
              disabled={swipeLoading}
              style={[styles.actionButton, styles.passButton, swipeLoading && styles.actionButtonDisabled]}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="close" size={24} color={colors.text} />
              <RNText style={styles.actionButtonText}>Pass</RNText>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleSwipe(currentCandidate.user.id, 'like')}
              disabled={swipeLoading}
              style={[styles.actionButton, styles.likeButton, swipeLoading && styles.actionButtonDisabled]}
              activeOpacity={0.8}
            >
              {swipeLoading ? (
                <ActivityIndicator color={colors.text} size="small" />
              ) : (
                <>
                    <MaterialCommunityIcons name="thumb-up" size={24} color={colors.text} />
                  <RNText style={styles.actionButtonText}>Like</RNText>
                </>
              )}
            </TouchableOpacity>
          </View>

      <Snackbar visible={!!error} onDismiss={() => setError('')} duration={4000} style={styles.errorSnackbar}>
        {error}
      </Snackbar>

      {/* Match Modal */}
      <Modal
        visible={showMatchModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMatchModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <MaterialCommunityIcons name="thumb-up" size={80} color={colors.primary} />
            
            <RNText style={styles.modalTitle}>It's a Match!</RNText>
            <RNText style={styles.modalSubtitle}>
              You and {matchedCandidate?.user.display_name || 'someone'} liked each other
            </RNText>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButtonSecondary}
                onPress={() => setShowMatchModal(false)}
                activeOpacity={0.8}
              >
                <RNText style={styles.modalButtonSecondaryText}>Keep Swiping</RNText>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalButtonPrimary}
                onPress={() => {
                  setShowMatchModal(false);
                  router.push('/(tabs)/matches');
                }}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons name="message" size={20} color={colors.text} />
                <RNText style={styles.modalButtonPrimaryText}>Send Message</RNText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.full,
    gap: spacing.sm,
    marginTop: spacing.lg,
    ...shadows.medium,
  },
  refreshButtonText: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamilies.ui,
    color: colors.text,
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: spacing.lg,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: 'transparent',
  },
  actionButton: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
    minWidth: 100,
    ...shadows.medium,
  },
  passButton: {
    backgroundColor: colors.surfaceLight,
  },
  likeButton: {
    backgroundColor: colors.primary,
  },
  actionButtonDisabled: {
    opacity: 0.5,
  },
  actionButtonText: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamilies.ui,
    color: colors.text,
    fontWeight: '600',
  },
  errorSnackbar: {
    backgroundColor: colors.error,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.xl * 2,
    alignItems: 'center',
    marginHorizontal: spacing.xl,
    maxWidth: 400,
    width: '90%',
    ...shadows.large,
  },
  modalTitle: {
    fontSize: typography.fontSizes.display,
    fontFamily: typography.fontFamilies.ui,
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  modalSubtitle: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamilies.ui,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: typography.fontSizes.base * typography.lineHeights.normal,
  },
  modalButtons: {
    flexDirection: 'column',
    gap: spacing.md,
    width: '100%',
  },
  modalButtonPrimary: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
    paddingVertical: spacing.md + 2,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    ...shadows.medium,
  },
  modalButtonPrimaryText: {
    fontSize: typography.fontSizes.lg,
    fontFamily: typography.fontFamilies.ui,
    color: colors.text,
  },
  modalButtonSecondary: {
    backgroundColor: 'transparent',
    borderRadius: borderRadius.full,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalButtonSecondaryText: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamilies.ui,
    color: colors.textSecondary,
  },
});

