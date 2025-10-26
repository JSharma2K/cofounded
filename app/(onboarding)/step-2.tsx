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
  const [userRole, setUserRole] = useState<'cofounder' | 'teammate' | 'mentor' | 'investor'>('cofounder');

  const {
    control,
    handleSubmit,
    formState: { errors },
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
      // Store the user role in the database
      await updateUserRole(user.id, userRole);
      
      // For investors and mentors, set seeking to their role
      const intentData = {
        ...data,
        seeking: (userRole === 'investor' || userRole === 'mentor') ? userRole : data.seeking,
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
                { value: 'cofounder', label: 'Cofounder' },
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
                  onPress={() => setUserRole(role.value as any)}
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

            {userRole === 'cofounder' || userRole === 'teammate' ? (
              <>
                <Text style={styles.label}>
                  I'm seeking a...
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

