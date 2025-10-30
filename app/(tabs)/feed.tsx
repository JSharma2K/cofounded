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

type SeekingFilter = 'all' | 'cofounder' | 'mentor' | 'investor';

export default function FeedScreen() {
  const router = useRouter();
  const { user } = useSession();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [allCandidates, setAllCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [matchedCandidate, setMatchedCandidate] = useState<Candidate | null>(null);
  const [swipeLoading, setSwipeLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter states
  const [maxAge, setMaxAge] = useState<number | null>(null);
  const [seekingFilter, setSeekingFilter] = useState<SeekingFilter>('all');
  
  // Animation values
  const swipeAnimation = useState(new Animated.Value(0))[0];
  const fadeAnimation = useState(new Animated.Value(1))[0];

  const applyFilters = (data: Candidate[]) => {
    let filtered = [...data];

    // Apply age filter
    if (maxAge !== null) {
      filtered = filtered.filter(candidate => {
        const ageBand = candidate.user.age_band;
        if (ageBand === '18-22') return 22 <= maxAge;
        if (ageBand === '23-26') return 26 <= maxAge;
        if (ageBand === '27+') return maxAge >= 27;
        return true;
      });
    }

    // Apply seeking filter
    if (seekingFilter !== 'all') {
      filtered = filtered.filter(candidate => 
        candidate.intent?.seeking === seekingFilter
      );
    }

    return filtered;
  };

  const loadCandidates = async () => {
    if (!user) return;

    setLoading(true);
    setError('');

    try {
      const data = await getCandidates(50);
      setAllCandidates(data);
      setCandidates(applyFilters(data));
    } catch (err: any) {
      setError(err.message || 'Failed to load candidates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCandidates();
  }, [user]);

  // Reapply filters when filter settings change
  useEffect(() => {
    setCandidates(applyFilters(allCandidates));
  }, [maxAge, seekingFilter]);

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
          {/* Filter Button */}
          <View style={styles.header}>
            <TouchableOpacity 
              onPress={() => setShowFilters(true)}
              style={styles.filterButton}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="filter-variant" size={20} color={colors.text} />
              <RNText style={styles.filterButtonText}>Filters</RNText>
              {(maxAge !== null || seekingFilter !== 'all') && (
                <View style={styles.filterBadge} />
              )}
            </TouchableOpacity>
          </View>

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

      {/* Filter Modal */}
      <Modal
        visible={showFilters}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFilters(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, styles.filterModal]}>
            <View style={styles.filterHeader}>
              <RNText style={styles.filterTitle}>Filters</RNText>
              <TouchableOpacity onPress={() => setShowFilters(false)} activeOpacity={0.8}>
                <MaterialCommunityIcons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            {/* Age Filter */}
            <View style={styles.filterSection}>
              <RNText style={styles.filterSectionTitle}>Maximum Age</RNText>
              <View style={styles.ageButtons}>
                {[null, 25, 30, 35, 40, 50].map((age) => (
                  <TouchableOpacity
                    key={age || 'any'}
                    style={[
                      styles.ageButton,
                      maxAge === age && styles.ageButtonActive
                    ]}
                    onPress={() => setMaxAge(age)}
                    activeOpacity={0.8}
                  >
                    <RNText style={[
                      styles.ageButtonText,
                      maxAge === age && styles.ageButtonTextActive
                    ]}>
                      {age ? `${age}` : 'Any'}
                    </RNText>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Seeking Filter */}
            <View style={styles.filterSection}>
              <RNText style={styles.filterSectionTitle}>Looking For</RNText>
              <View style={styles.seekingButtons}>
                {[
                  { value: 'all', label: 'All', icon: 'account-group' },
                  { value: 'cofounder', label: 'Cofounders', icon: 'account-multiple' },
                  { value: 'mentor', label: 'Mentors', icon: 'school' },
                  { value: 'investor', label: 'Investors', icon: 'cash-multiple' },
                ].map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.seekingButton,
                      seekingFilter === option.value && styles.seekingButtonActive
                    ]}
                    onPress={() => setSeekingFilter(option.value as SeekingFilter)}
                    activeOpacity={0.8}
                  >
                    <MaterialCommunityIcons 
                      name={option.icon as any} 
                      size={20} 
                      color={seekingFilter === option.value ? colors.text : colors.textSecondary} 
                    />
                    <RNText style={[
                      styles.seekingButtonText,
                      seekingFilter === option.value && styles.seekingButtonTextActive
                    ]}>
                      {option.label}
                    </RNText>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Clear Filters */}
            <TouchableOpacity
              style={styles.clearFiltersButton}
              onPress={() => {
                setMaxAge(null);
                setSeekingFilter('all');
              }}
              activeOpacity={0.8}
            >
              <RNText style={styles.clearFiltersText}>Clear All Filters</RNText>
            </TouchableOpacity>

            {/* Apply Button */}
            <TouchableOpacity
              style={styles.applyButton}
              onPress={() => setShowFilters(false)}
              activeOpacity={0.8}
            >
              <RNText style={styles.applyButtonText}>Apply Filters</RNText>
            </TouchableOpacity>
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
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    ...shadows.small,
  },
  filterButtonText: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamilies.regular,
    color: colors.text,
  },
  filterBadge: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  filterModal: {
    maxHeight: '80%',
    width: '90%',
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  filterTitle: {
    fontSize: typography.fontSizes.xxl,
    fontFamily: typography.fontFamilies.regular,
    color: colors.text,
  },
  filterSection: {
    marginBottom: spacing.xl,
  },
  filterSectionTitle: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamilies.regular,
    color: colors.text,
    marginBottom: spacing.md,
  },
  ageButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  ageButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  ageButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  ageButtonText: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamilies.regular,
    color: colors.textSecondary,
  },
  ageButtonTextActive: {
    color: colors.text,
  },
  seekingButtons: {
    gap: spacing.sm,
  },
  seekingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  seekingButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  seekingButtonText: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamilies.regular,
    color: colors.textSecondary,
  },
  seekingButtonTextActive: {
    color: colors.text,
  },
  clearFiltersButton: {
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  clearFiltersText: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamilies.regular,
    color: colors.textSecondary,
  },
  applyButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginTop: spacing.md,
    ...shadows.medium,
  },
  applyButtonText: {
    fontSize: typography.fontSizes.lg,
    fontFamily: typography.fontFamilies.regular,
    color: colors.text,
  },
});

