import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Text, TextInput as RNTextInput, TouchableOpacity, Modal, ActivityIndicator } from 'react-native';
import { Snackbar, SegmentedButtons } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { profileSchema, type ProfileForm } from '../../utils/schemas';
import { upsertProfile } from '../../lib/api/onboarding';
import { useSession } from '../../lib/hooks/useSession';
import { DOMAIN_CATEGORIES } from '../../utils/constants';
import { colors, typography, spacing, borderRadius } from '../../utils/theme';
import { supabase } from '../../lib/supabase';

export default function Step2Screen() {
  const router = useRouter();
  const { user } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [focused, setFocused] = useState<null | 'headline' | 'bio' | 'commitment'>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedBusinessCategory, setSelectedBusinessCategory] = useState<string | null>(null);
  const [showBusinessDropdown, setShowBusinessDropdown] = useState(false);
  const [showSkillsDropdown, setShowSkillsDropdown] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [fetchingRole, setFetchingRole] = useState(true);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      headline: '',
      bio: '',
      business_domains: [],
      domains: [],
      skills: [],
      stage: 'idea',
      commitment_hours: 20,
      availability_text: '',
    },
  });

  // Fetch user's role to determine which fields to show
  useEffect(() => {
    async function fetchUserRole() {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('users')
          .select('user_role')
          .eq('id', user.id)
          .single();
        
        if (error) throw error;
        const role = data?.user_role || null;
        setUserRole(role);
        
        // Set default hours based on role
        if (role === 'cofounder') {
          setValue('commitment_hours', 50);
        } else if (role === 'teammate') {
          setValue('commitment_hours', 20);
        } else if (role === 'founder') {
          setValue('commitment_hours', 20);
        }
      } catch (err) {
        console.error('Error fetching user role:', err);
      } finally {
        setFetchingRole(false);
      }
    }
    
    fetchUserRole();
  }, [user, setValue]);

  const onSubmit = async (data: ProfileForm) => {
    if (!user) return;

    // Validate cofounder hours (must be at least 50)
    if (userRole === 'cofounder' && data.commitment_hours < 50) {
      setError('Co-founders must commit at least 50 hours per week');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await upsertProfile(user.id, data);
      router.replace('/(tabs)/feed');
    } catch (err: any) {
      setError(err.message || 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  if (fetchingRole) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const isFounder = userRole === 'founder';
  const isTeammateOrCofounder = userRole === 'teammate' || userRole === 'cofounder';

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <Text style={styles.heading}>Build your profile</Text>

          {isFounder && (
            <>
              <Text style={styles.label}>Your Business Domain</Text>
          <Controller
            control={control}
            name="business_domains"
            render={({ field: { onChange, value } }) => (
              <View>
                <TouchableOpacity
                  style={styles.customPicker}
                  onPress={() => setShowBusinessDropdown(true)}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.customPickerText,
                    !selectedBusinessCategory && styles.customPickerPlaceholder
                  ]}>
                    {selectedBusinessCategory || 'Select a business category...'}
                  </Text>
                  <Text style={styles.customPickerIcon}>▼</Text>
                </TouchableOpacity>

                <Modal
                  visible={showBusinessDropdown}
                  transparent={true}
                  animationType="fade"
                  onRequestClose={() => setShowBusinessDropdown(false)}
                >
                  <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowBusinessDropdown(false)}
                  >
                    <View style={styles.dropdownContainer}>
                      <ScrollView style={styles.dropdownScroll} showsVerticalScrollIndicator={false}>
                        {Object.keys(DOMAIN_CATEGORIES).map((category) => (
                          <TouchableOpacity
                            key={category}
                            style={[
                              styles.dropdownItem,
                              selectedBusinessCategory === category && styles.dropdownItemSelected
                            ]}
                            onPress={() => {
                              setSelectedBusinessCategory(category);
                              onChange([]); // Clear previous selections when category changes
                              setShowBusinessDropdown(false);
                            }}
                          >
                            <Text style={[
                              styles.dropdownItemText,
                              selectedBusinessCategory === category && styles.dropdownItemTextSelected
                            ]}>
                              {category}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  </TouchableOpacity>
                </Modal>

                {/* Business Domain Tags for Selected Category */}
                {selectedBusinessCategory && (
                  <>
                    <Text style={styles.subLabel}>Business Focus Areas (select from {selectedBusinessCategory})</Text>
                    <View style={styles.chipContainer}>
                      {DOMAIN_CATEGORIES[selectedBusinessCategory as keyof typeof DOMAIN_CATEGORIES].map((domain) => (
                        <TouchableOpacity
                          key={domain}
                          onPress={() => {
                            if (value.includes(domain)) {
                              onChange(value.filter((d) => d !== domain));
                            } else {
                              onChange([...value, domain]);
                            }
                          }}
                          style={[
                            styles.chip,
                            value.includes(domain) && styles.chipSelected,
                          ]}
                        >
                          <Text
                            style={[
                              styles.chipText,
                              value.includes(domain) && styles.chipTextSelected,
                            ]}
                          >
                            {domain}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </>
                )}

                {/* Selected Business Domains Display */}
                {value.length > 0 && (
                  <View style={styles.selectedContainer}>
                    <Text style={styles.selectedLabel}>Your Business Focus:</Text>
                    <View style={styles.chipContainer}>
                      {value.map((domain) => (
                        <View key={domain} style={[styles.chip, styles.chipSelected]}>
                          <Text style={[styles.chipText, styles.chipTextSelected]}>
                            {domain}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            )}
          />
          {errors.business_domains && <Text style={styles.errorText}>{errors.business_domains.message}</Text>}

              <Text style={styles.label}>Current Stage</Text>
          <Controller
            control={control}
            name="stage"
            render={({ field: { onChange, value } }) => (
              <View style={[styles.segmented, styles.stageRow]}>
                {[
                  { value: 'idea', label: 'Idea' },
                  { value: 'prototype', label: 'Prototype' },
                  { value: 'launched', label: 'Launched' },
                ].map((btn) => (
                  <TouchableOpacity
                    key={btn.value}
                    onPress={() => onChange(btn.value as any)}
                    style={[
                      styles.stageChip,
                      value === btn.value && styles.stageChipSelected,
                    ]}
                    activeOpacity={0.85}
                  >
                    <Text
                      style={[
                        styles.stageChipText,
                        value === btn.value && styles.stageChipTextSelected,
                      ]}
                    >
                      {btn.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          />
          {errors.stage && <Text style={styles.errorText}>{errors.stage.message}</Text>}
            </>
          )}

          <Text style={styles.label}>
            {isFounder ? 'Describe Your Business' : 'About You'}
          </Text>
          <Controller
            control={control}
            name="headline"
            render={({ field: { onChange, onBlur, value } }) => (
              <View>
                <RNTextInput
                  placeholder={
                    isFounder
                      ? "What is your business idea or startup about? Describe your vision, target market, and what makes your idea unique..."
                      : "Tell us about your professional background, key skills, and what you bring to a team..."
                  }
                  placeholderTextColor={colors.textTertiary}
                  value={value}
                  onChangeText={onChange}
                  onFocus={() => setFocused('headline')}
                  onBlur={() => setFocused(null)}
                  multiline
                  numberOfLines={6}
                  textAlignVertical="top"
                  style={[styles.inputMultiline, focused === 'headline' && styles.inputFocused, errors.headline && styles.inputError]}
                />
                <Text style={styles.characterCount}>
                  {value?.length || 0}/2500 characters
                </Text>
              </View>
            )}
          />
          {errors.headline && (
            <Text style={styles.errorText}>{errors.headline.message}</Text>
          )}

          <Text style={styles.label}>Your Skills & Expertise</Text>
          <Controller
            control={control}
            name="domains"
            render={({ field: { onChange, value } }) => (
              <View>
                <TouchableOpacity
                  style={styles.customPicker}
                  onPress={() => setShowSkillsDropdown(true)}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.customPickerText,
                    !selectedCategory && styles.customPickerPlaceholder
                  ]}>
                    {selectedCategory || 'Select a skills category...'}
                  </Text>
                  <Text style={styles.customPickerIcon}>▼</Text>
                </TouchableOpacity>

                <Modal
                  visible={showSkillsDropdown}
                  transparent={true}
                  animationType="fade"
                  onRequestClose={() => setShowSkillsDropdown(false)}
                >
                  <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowSkillsDropdown(false)}
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
                              setValue('skills', []); // Also clear skills
                              setShowSkillsDropdown(false);
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

                {/* Domain Tags for Selected Category */}
                {selectedCategory && (
                  <>
                    <Text style={styles.subLabel}>Your Specific Skills (select from {selectedCategory})</Text>
                    <View style={styles.chipContainer}>
                      {DOMAIN_CATEGORIES[selectedCategory as keyof typeof DOMAIN_CATEGORIES].map((domain) => (
                        <TouchableOpacity
                          key={domain}
                          onPress={() => {
                            if (value.includes(domain)) {
                              const newValue = value.filter((d) => d !== domain);
                              onChange(newValue);
                              setValue('skills', newValue); // Also update skills
                            } else {
                              const newValue = [...value, domain];
                              onChange(newValue);
                              setValue('skills', newValue); // Also update skills
                            }
                          }}
                          style={[
                            styles.chip,
                            value.includes(domain) && styles.chipSelected,
                          ]}
                        >
                          <Text
                            style={[
                              styles.chipText,
                              value.includes(domain) && styles.chipTextSelected,
                            ]}
                          >
                            {domain}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </>
                )}

                {/* Selected Domains Display */}
                {value.length > 0 && (
                  <View style={styles.selectedContainer}>
                    <Text style={styles.selectedLabel}>Your Selected Skills:</Text>
                    <View style={styles.chipContainer}>
                      {value.map((domain) => (
                        <View key={domain} style={[styles.chip, styles.chipSelected]}>
                          <Text style={[styles.chipText, styles.chipTextSelected]}>
                            {domain}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            )}
          />
          {errors.domains && <Text style={styles.errorText}>{errors.domains.message}</Text>}

          <Text style={styles.label}>Bio</Text>
          <Controller
            control={control}
            name="bio"
            render={({ field: { onChange, onBlur, value } }) => (
              <RNTextInput
                placeholder="Bio (optional) - Tell us about yourself..."
                placeholderTextColor={colors.textTertiary}
                value={value}
                onChangeText={onChange}
                onFocus={() => setFocused('bio')}
                onBlur={() => setFocused(null)}
                multiline
                numberOfLines={4}
                style={[styles.inputMultiline, focused === 'bio' && styles.inputFocused, errors.bio && styles.inputError]}
              />
            )}
          />
          {errors.bio && (
            <Text style={styles.errorText}>{errors.bio.message}</Text>
          )}

          <Text style={styles.label}>
            {isTeammateOrCofounder ? 'Weekly Availability (Hours)' : 'Weekly Commitment'}
          </Text>
          {userRole === 'cofounder' && (
            <Text style={styles.subLabel}>
              Co-founders must commit at least 50 hours per week
            </Text>
          )}
          <Controller
            control={control}
            name="commitment_hours"
            render={({ field: { onChange, value } }) => (
              <View>
                <RNTextInput
                  value={String(value)}
                  onChangeText={(text) => {
                    if (text === '') {
                      onChange(0);
                      return;
                    }
                    const num = parseInt(text, 10);
                    if (!isNaN(num)) {
                      onChange(num);
                    }
                  }}
                  onFocus={() => setFocused('commitment')}
                  onBlur={() => setFocused(null)}
                  keyboardType="number-pad"
                  placeholder="Enter hours per week"
                  placeholderTextColor={colors.textTertiary}
                  style={[
                    styles.hoursInput,
                    focused === 'commitment' && styles.inputFocused,
                    errors.commitment_hours && styles.inputError
                  ]}
                />
              </View>
            )}
          />
          {errors.commitment_hours && (
            <Text style={styles.errorText}>{errors.commitment_hours.message}</Text>
          )}

          <Text style={styles.label}>Availability Details (Optional)</Text>
          <Controller
            control={control}
            name="availability_text"
            render={({ field: { onChange, onBlur, value } }) => (
              <RNTextInput
                placeholder="E.g., Available evenings and weekends, flexible schedule, etc."
                placeholderTextColor={colors.textTertiary}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                multiline
                numberOfLines={3}
                style={[styles.inputMultiline, errors.availability_text && styles.inputError]}
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
              {loading ? 'Saving...' : 'Continue'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Snackbar
        visible={!!error}
        onDismiss={() => setError('')}
        duration={4000}
        style={styles.snackbar}
      >
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
  scrollContent: {
    paddingBottom: spacing.xl * 2,
  },
  content: {
    padding: spacing.lg,
  },
  heading: {
    fontSize: typography.fontSizes.xxl,
    fontFamily: typography.fontFamilies.regular,
    color: colors.text,
    marginBottom: spacing.xl,
  },
  label: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamilies.regular,
    color: colors.textSecondary,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  subLabel: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamilies.regular,
    color: colors.textTertiary,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamilies.regular,
    color: colors.text,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  inputMultiline: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamilies.regular,
    color: colors.text,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  hoursInput: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamilies.regular,
    color: colors.text,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  inputError: {
    borderColor: colors.error,
  },
  inputFocused: {
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
  },
  errorText: {
    color: colors.error,
    fontSize: typography.fontSizes.sm,
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  segmented: {
    marginBottom: spacing.md,
  },
  stageRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  stageChip: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  stageChipSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.surface,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
  },
  stageChipText: {
    color: colors.textSecondary,
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamilies.regular,
  },
  stageChipTextSelected: {
    color: colors.text,
  },
  customPicker: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 50,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  customPickerText: {
    color: colors.text,
    fontSize: typography.fontSizes.md,
    fontFamily: typography.fontFamilies.regular,
    flex: 1,
  },
  customPickerPlaceholder: {
    color: colors.textSecondary,
  },
  customPickerIcon: {
    color: colors.textSecondary,
    fontSize: typography.fontSizes.sm,
    marginLeft: spacing.sm,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  dropdownContainer: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    maxHeight: 300,
    width: '100%',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  dropdownScroll: {
    maxHeight: 300,
  },
  dropdownItem: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  dropdownItemSelected: {
    backgroundColor: colors.primary + '20',
  },
  dropdownItemText: {
    color: colors.text,
    fontSize: typography.fontSizes.md,
    fontFamily: typography.fontFamilies.regular,
  },
  dropdownItemTextSelected: {
    color: colors.primary,
    fontFamily: typography.fontFamilies.medium,
  },
  characterCount: {
    color: colors.textSecondary,
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamilies.regular,
    textAlign: 'right',
    marginTop: spacing.xs,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  categoryChip: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.xs,
  },
  categoryChipSelected: {
    backgroundColor: colors.surface,
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
  },
  categoryChipText: {
    color: colors.textSecondary,
    fontSize: typography.fontSizes.xs,
    fontFamily: typography.fontFamilies.regular,
  },
  categoryChipTextSelected: {
    color: colors.text,
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
  button: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xl,
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
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

