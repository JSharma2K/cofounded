import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Text, TextInput as RNTextInput, TouchableOpacity, Modal } from 'react-native';
import { Snackbar } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { expertiseSchema, type ExpertiseForm } from '../../utils/schemas';
import { upsertExpertise } from '../../lib/api/onboarding';
import { useSession } from '../../lib/hooks/useSession';
import { DOMAIN_CATEGORIES } from '../../utils/constants';
import { colors, typography, spacing, borderRadius } from '../../utils/theme';

export default function Step4Screen() {
  const router = useRouter();
  const { user } = useSession();
  const params = useLocalSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userRole, setUserRole] = useState<'mentor' | 'investor'>('mentor');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedExperience, setSelectedExperience] = useState<string | null>(null);
  const [selectedInvestmentType, setSelectedInvestmentType] = useState<string | null>(null);
  const [portfolioSize, setPortfolioSize] = useState<string>('');
  const [portfolioUrl, setPortfolioUrl] = useState<string>('');

  useEffect(() => {
    // Get role from URL parameters or default to mentor
    if (params.role && (params.role === 'mentor' || params.role === 'investor')) {
      setUserRole(params.role as 'mentor' | 'investor');
    }
  }, [params.role]);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ExpertiseForm>({
    resolver: zodResolver(expertiseSchema),
    defaultValues: {
      seeking: 'mentor',
      availability_text: '',
      expertise_areas: [],
    },
  });

  const onSubmit = async (data: ExpertiseForm) => {
    if (!user) return;

    // Validate investor-specific fields
    if (userRole === 'investor') {
      if (!selectedExperience) {
        setError('Please select an investment stage');
        return;
      }
      if (!selectedInvestmentType) {
        setError('Please select an investment type');
        return;
      }
      if (!portfolioSize || portfolioSize.trim() === '') {
        setError('Please enter your portfolio size');
        return;
      }
    }

    // Validate mentor-specific fields
    if (userRole === 'mentor') {
      if (!selectedExperience) {
        setError('Please select your years of experience');
        return;
      }
    }

    setLoading(true);
    setError('');

    try {
      const expertiseData = {
        ...data,
        seeking: userRole,
        experience_level: selectedExperience,
        investment_type: selectedInvestmentType,
        portfolio_size: portfolioSize,
        portfolio_url: portfolioUrl,
      };
      
      await upsertExpertise(user.id, expertiseData);
      router.replace('/(tabs)/feed');
    } catch (err: any) {
      setError(err.message || 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView style={styles.scroll}>
        <View style={styles.content}>
          <Text style={styles.heading}>
            {userRole === 'mentor' ? 'Share Your Expertise' : 'Investment Focus'}
          </Text>

          <Text style={styles.label}>
            {userRole === 'mentor' ? 'What areas can you mentor in?' : 'What sectors do you invest in?'}
          </Text>
          
          <Controller
            control={control}
            name="expertise_areas"
            render={({ field: { onChange, value } }) => (
              <View>
                {/* Category Dropdown Button */}
                <TouchableOpacity
                  style={[styles.dropdownButton, errors.expertise_areas && styles.inputError]}
                  onPress={() => setShowDropdown(true)}
                >
                  <Text style={[
                    styles.dropdownButtonText,
                    !selectedCategory && styles.placeholderText
                  ]}>
                    {selectedCategory || 'Select a category...'}
                  </Text>
                  <Text style={styles.dropdownArrow}>▼</Text>
                </TouchableOpacity>

                {/* Category Dropdown Modal */}
                <Modal
                  visible={showDropdown}
                  transparent={true}
                  animationType="fade"
                  onRequestClose={() => setShowDropdown(false)}
                >
                  <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowDropdown(false)}
                  >
                    <View style={styles.dropdownContainer}>
                      <ScrollView style={styles.dropdownScroll} showsVerticalScrollIndicator={false}>
                        {Object.keys(DOMAIN_CATEGORIES).map((category) => (
                          <TouchableOpacity
                            key={category}
                            style={[
                              styles.dropdownItem,
                              selectedCategory === category && styles.dropdownItemSelected
                            ]}
                            onPress={() => {
                              setSelectedCategory(category);
                              onChange([]); // Clear previous selections when category changes
                              setShowDropdown(false);
                            }}
                          >
                            <Text style={[
                              styles.dropdownItemText,
                              selectedCategory === category && styles.dropdownItemTextSelected
                            ]}>
                              {category}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  </TouchableOpacity>
                </Modal>

                {/* Expertise Area Tags for Selected Category */}
                {selectedCategory && (
                  <>
                    <Text style={styles.subLabel}>
                      {userRole === 'mentor' ? 'Mentoring Areas' : 'Investment Focus'} (select from {selectedCategory})
                    </Text>
                    <View style={styles.chipContainer}>
                      {DOMAIN_CATEGORIES[selectedCategory as keyof typeof DOMAIN_CATEGORIES].map((area) => (
                        <TouchableOpacity
                          key={area}
                          onPress={() => {
                            if (value.includes(area)) {
                              onChange(value.filter((a) => a !== area));
                            } else {
                              onChange([...value, area]);
                            }
                          }}
                          style={[
                            styles.chip,
                            value.includes(area) && styles.chipSelected,
                          ]}
                        >
                          <Text
                            style={[
                              styles.chipText,
                              value.includes(area) && styles.chipTextSelected,
                            ]}
                          >
                            {area}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </>
                )}

                {/* Selected Areas Display */}
                {value.length > 0 && (
                  <View style={styles.selectedContainer}>
                    <Text style={styles.selectedLabel}>
                      Your {userRole === 'mentor' ? 'Mentoring' : 'Investment'} Focus:
                    </Text>
                    <View style={styles.chipContainer}>
                      {value.map((area) => (
                        <View key={area} style={[styles.chip, styles.chipSelected]}>
                          <Text style={[styles.chipText, styles.chipTextSelected]}>
                            {area}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            )}
          />
          {errors.expertise_areas && <Text style={styles.errorText}>{errors.expertise_areas.message}</Text>}

          <Text style={styles.label}>
            {userRole === 'mentor' ? 'Years of Experience *' : 'Which stage(s) of funding do you typically invest in? *'}
          </Text>
          <View style={styles.roleContainer}>
            {(userRole === 'mentor' ? [
              { value: '5-10', label: '5-10 years' },
              { value: '10-15', label: '10-15 years' },
              { value: '15+', label: '15+ years' },
            ] : [
              { value: 'pre-seed', label: 'Pre-seed' },
              { value: 'seed', label: 'Seed' },
              { value: 'series-a', label: 'Series A' },
              { value: 'growth', label: 'Growth' },
            ]).map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.areaButton,
                  selectedExperience === option.value && styles.areaButtonSelected,
                ]}
                onPress={() => {
                  setSelectedExperience(option.value);
                }}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.areaButtonText,
                  selectedExperience === option.value && styles.areaButtonTextSelected,
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {userRole === 'investor' && (
            <>
              <Text style={styles.label}>Investment Type *</Text>
              <View style={styles.roleContainer}>
                {[
                  { value: 'angel', label: 'Angel' },
                  { value: 'vc', label: 'VC' },
                  { value: 'family-office', label: 'Family Office' },
                  { value: 'corporate-vc', label: 'Corporate VC' },
                  { value: 'fund-manager', label: 'Fund Manager' },
                ].map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.areaButton,
                      selectedInvestmentType === option.value && styles.areaButtonSelected,
                    ]}
                    onPress={() => {
                      setSelectedInvestmentType(option.value);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      styles.areaButtonText,
                      selectedInvestmentType === option.value && styles.areaButtonTextSelected,
                    ]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Portfolio Size *</Text>
              <RNTextInput
                placeholder="Number of active investments"
                placeholderTextColor={colors.textTertiary}
                value={portfolioSize}
                onChangeText={setPortfolioSize}
                style={styles.input}
                keyboardType="numeric"
              />

              <Text style={styles.label}>Portfolio Link (Optional)</Text>
              <RNTextInput
                placeholder="https://your-portfolio-website.com"
                placeholderTextColor={colors.textTertiary}
                value={portfolioUrl}
                onChangeText={setPortfolioUrl}
                style={[styles.input, styles.inputSmall]}
                keyboardType="url"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </>
          )}

          <Text style={styles.label}>
            {userRole === 'mentor' ? 'Availability' : 'Investment Range'}
          </Text>
          <Controller
            control={control}
            name="availability_text"
            render={({ field: { onChange, onBlur, value } }) => (
              <RNTextInput
                placeholder={userRole === 'mentor' ? 'How much time can you dedicate to mentoring?' : 'What is your typical investment range?'}
                placeholderTextColor={colors.textTertiary}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                style={[
                  styles.input,
                  errors.availability_text && styles.inputError,
                ]}
                multiline
                numberOfLines={3}
                fontFamily={typography.fontFamilies.regular}
              />
            )}
          />
          {errors.availability_text && (
            <Text style={styles.errorText}>{errors.availability_text.message}</Text>
          )}

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSubmit(onSubmit)}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Saving...' : 'Complete Setup'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Snackbar visible={!!error} onDismiss={() => setError('')} duration={4000} style={styles.snackbar}>
        {error}
      </Snackbar>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
  },
  heading: {
    fontSize: typography.fontSizes.xxl,
    fontFamily: typography.fontFamilies.regular,
    fontWeight: typography.fontWeights.medium,
    color: colors.text,
    marginBottom: spacing.xl,
  },
  label: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamilies.medium,
    fontWeight: typography.fontWeights.medium,
    color: colors.textSecondary,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  roleContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  areaButton: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    minWidth: 80,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.text,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  areaButtonText: {
    color: colors.textSecondary,
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamilies.regular,
    textAlign: 'center',
  },
  areaButtonSelected: {
    borderColor: colors.primary,
    borderWidth: 1,
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 8,
  },
  areaButtonTextSelected: {
    color: colors.textSecondary,
    fontWeight: '600',
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamilies.regular, // Josefin Light for input text
    color: colors.text,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  inputSmall: {
    minHeight: 50,
    textAlignVertical: 'center',
  },
  inputError: {
    borderColor: colors.error,
  },
  errorText: {
    color: colors.error,
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamilies.regular,
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: colors.text,
    fontSize: typography.fontSizes.lg,
    fontFamily: typography.fontFamilies.regular,
  },
  snackbar: {
    backgroundColor: colors.error,
  },
  // Dropdown styles
  dropdownButton: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  dropdownButtonText: {
    color: colors.text,
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamilies.regular,
    flex: 1,
  },
  placeholderText: {
    color: colors.textTertiary,
  },
  dropdownArrow: {
    color: colors.textSecondary,
    fontSize: typography.fontSizes.sm,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownContainer: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    marginHorizontal: spacing.lg,
    maxHeight: 400,
    width: '80%',
    borderWidth: 1,
    borderColor: colors.border,
  },
  dropdownScroll: {
    maxHeight: 400,
  },
  dropdownItem: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  dropdownItemSelected: {
    backgroundColor: colors.primary + '20',
  },
  dropdownItemText: {
    color: colors.text,
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamilies.regular,
  },
  dropdownItemTextSelected: {
    color: colors.primary,
    fontWeight: '500',
  },
  subLabel: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamilies.regular,
    color: colors.textSecondary,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  selectedContainer: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  selectedLabel: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamilies.regular,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  chip: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  chipSelected: {
    backgroundColor: colors.surface,
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
  },
  chipText: {
    color: colors.textSecondary,
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamilies.regular,
  },
  chipTextSelected: {
    color: colors.text,
  },
  inputError: {
    borderColor: colors.error,
  },
  errorText: {
    color: colors.error,
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamilies.regular,
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
});
