import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Text, TextInput as RNTextInput, TouchableOpacity } from 'react-native';
import { Snackbar, SegmentedButtons } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { intentSchema, type IntentForm } from '../../utils/schemas';
import { upsertIntent, updateUserRole } from '../../lib/api/onboarding';
import { useSession } from '../../lib/hooks/useSession';
import { colors, typography, spacing, borderRadius } from '../../utils/theme';

export default function Step3Screen() {
  const router = useRouter();
  const { user } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userRole, setUserRole] = useState<'founder' | 'teammate' | 'mentor' | 'investor'>('founder');
  const [commitmentLevel, setCommitmentLevel] = useState<'teammate' | 'cofounder'>('teammate');

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<IntentForm>({
    resolver: zodResolver(intentSchema),
    defaultValues: {
      seeking: 'cofounder',
    },
  });

  const onSubmit = async (data: IntentForm) => {
    if (!user) return;

    setLoading(true);
    setError('');

    try {
      // Determine the actual role to save:
      // If user selected "Teammate" as joining role, save their commitment level (teammate or cofounder)
      // Otherwise, save the selected role
      const roleToSave = userRole === 'teammate' ? commitmentLevel : userRole;
      
      // Store the user role in the database
      await updateUserRole(user.id, roleToSave);
      
      // Determine the seeking value:
      // - Teammates, Mentors, and Investors all seek 'founder'
      // - Founders seek what they selected (cofounder, teammate, mentor, investor)
      let seekingValue = data.seeking;
      if (userRole === 'teammate' || userRole === 'mentor' || userRole === 'investor') {
        seekingValue = 'founder';
      }
      
      const intentData = {
        ...data,
        seeking: seekingValue,
      };
      
      await upsertIntent(user.id, intentData);
      
      // Navigate based on user role
      if (userRole === 'investor' || userRole === 'mentor') {
        router.push(`/(onboarding)/step-4?role=${userRole}`);
      } else {
        router.push('/(onboarding)/step-3');
      }
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
    >
      <View style={styles.scroll}>
        <ScrollView style={styles.scrollView}>
          <View style={styles.content}>
            <Text style={styles.heading}>
              What are you looking for?
            </Text>

            <Text style={styles.label}>
              What are you joining the app as?
            </Text>
            <View style={styles.roleContainer}>
              {[
                { value: 'founder', label: 'Founder' },
                { value: 'teammate', label: 'Teammate' },
                { value: 'mentor', label: 'Mentor' },
                { value: 'investor', label: 'Investor' },
              ].map((role) => (
                <TouchableOpacity
                  key={role.value}
                  style={[
                    styles.roleButton,
                    userRole === role.value && styles.roleButtonSelected,
                  ]}
                  onPress={() => {
                    setUserRole(role.value as any);
                    // Set default seeking value based on role
                    if (role.value === 'teammate') {
                      setValue('seeking', 'teammate');
                    } else if (role.value === 'founder') {
                      setValue('seeking', 'cofounder');
                    }
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.roleButtonText,
                    userRole === role.value && styles.roleButtonTextSelected,
                  ]}>
                    {role.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {userRole === 'teammate' ? (
              <>
                <Text style={styles.label}>
                  Are you joining as a teammate or co-founder?
                </Text>
                <View style={styles.commitmentContainer}>
                  <TouchableOpacity
                    style={[
                      styles.commitmentCard,
                      commitmentLevel === 'teammate' && styles.commitmentCardSelected,
                    ]}
                    onPress={() => {
                      setCommitmentLevel('teammate');
                      setValue('seeking', 'founder');
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      styles.commitmentTitle,
                      commitmentLevel === 'teammate' && styles.commitmentTitleSelected,
                    ]}>
                      Teammate
                    </Text>
                    <Text style={styles.commitmentDescription}>
                      Choose this if you want to contribute with limited hours and supporting responsibilities within a collaborative team.
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.commitmentCard,
                      commitmentLevel === 'cofounder' && styles.commitmentCardSelected,
                    ]}
                    onPress={() => {
                      setCommitmentLevel('cofounder');
                      setValue('seeking', 'founder');
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      styles.commitmentTitle,
                      commitmentLevel === 'cofounder' && styles.commitmentTitleSelected,
                    ]}>
                      Co-founder
                    </Text>
                    <Text style={styles.commitmentDescription}>
                      Select this if you don't have a founding idea but have high availability and are ready for shared ownership and long-term commitment to drive the idea forward.
                    </Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.label}>
                  I'm seeking a...
                </Text>
                <Text style={styles.helperText}>
                  This will set your initial feed filters. You can change these anytime.
                </Text>
                <View style={styles.roleContainer}>
                  <View style={[styles.roleButton, styles.roleButtonSelected]}>
                    <Text style={[styles.roleButtonText, styles.roleButtonTextSelected]}>
                      Founder
                    </Text>
                  </View>
                </View>
              </>
            ) : userRole === 'founder' ? (
              <>
                <Text style={styles.label}>
                  I'm seeking a...
                </Text>
                <Text style={styles.helperText}>
                  This will set your initial feed filters. You can change these anytime.
                </Text>
                <Controller
                  control={control}
                  name="seeking"
                  render={({ field: { onChange, value } }) => (
                    <View style={styles.roleContainer}>
                      {[
                        { value: 'cofounder', label: 'Cofounder' },
                        { value: 'teammate', label: 'Teammate' },
                        { value: 'mentor', label: 'Mentor' },
                        { value: 'investor', label: 'Investor' },
                      ].map((option) => (
                        <TouchableOpacity
                          key={option.value}
                          style={[
                            styles.roleButton,
                            value === option.value && styles.roleButtonSelected,
                          ]}
                          onPress={() => onChange(option.value)}
                          activeOpacity={0.7}
                        >
                          <Text style={[
                            styles.roleButtonText,
                            value === option.value && styles.roleButtonTextSelected,
                          ]}>
                            {option.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                />
              </>
            ) : (userRole === 'mentor' || userRole === 'investor') ? (
              <>
                <Text style={styles.label}>
                  I'm seeking a...
                </Text>
                <Text style={styles.helperText}>
                  This will set your initial feed filters. You can change these anytime.
                </Text>
                <View style={styles.roleContainer}>
                  <View style={[styles.roleButton, styles.roleButtonSelected]}>
                    <Text style={[styles.roleButtonText, styles.roleButtonTextSelected]}>
                      Founder
                    </Text>
                  </View>
                </View>
              </>
            ) : null}
          </View>
        </ScrollView>
        
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

      <Snackbar visible={!!error} onDismiss={() => setError('')} duration={4000}>
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
  scrollView: {
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
  helperText: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamilies.regular,
    color: colors.textTertiary,
    marginBottom: spacing.md,
    marginTop: -spacing.xs,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: typography.fontSizes.base,
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
    color: colors.text,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 100,
    textAlignVertical: 'top',
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
  roleContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  roleButton: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    minWidth: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleButtonSelected: {
    backgroundColor: colors.surface,
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
  },
  roleButtonText: {
    color: colors.textSecondary,
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamilies.regular,
    textAlign: 'center',
  },
  roleButtonTextSelected: {
    color: colors.primary,
    fontWeight: '500',
  },
  commitmentContainer: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  commitmentCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 2,
    borderColor: colors.border,
  },
  commitmentCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.surface,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  commitmentTitle: {
    fontSize: typography.fontSizes.lg,
    fontFamily: typography.fontFamilies.regular,
    fontWeight: typography.fontWeights.semibold,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  commitmentTitleSelected: {
    color: colors.primary,
  },
  commitmentDescription: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamilies.regular,
    color: colors.textTertiary,
    lineHeight: 20,
  },
  button: {
    backgroundColor: colors.primary, // #E89B8E - Consistent coral theme color
    borderRadius: 25, // Pill shape
    paddingVertical: spacing.md + 2,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    marginTop: spacing.md,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF', // White text for coral background
    fontSize: typography.fontSizes.lg,
    fontFamily: typography.fontFamilies.medium,
    fontWeight: typography.fontWeights.semibold,
  },
  snackbar: {
    backgroundColor: colors.error,
  },
});

