import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Text, TextInput as RNTextInput, TouchableOpacity } from 'react-native';
import { Snackbar, SegmentedButtons } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { intentSchema, type IntentForm } from '../../utils/schemas';
import { upsertIntent } from '../../lib/api/onboarding';
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
      availability_text: '',
    },
  });

  const onSubmit = async (data: IntentForm) => {
    if (!user) return;

    setLoading(true);
    setError('');

    try {
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
      <ScrollView style={styles.scroll}>
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
                  <SegmentedButtons
                    value={value}
                    onValueChange={onChange}
                    buttons={[
                      { value: 'cofounder', label: 'Cofounder' },
                      { value: 'teammate', label: 'Teammate' },
                      { value: 'mentor', label: 'Mentor' },
                    ]}
                    style={styles.segmented}
                    buttonStyle={styles.segmentedButton}
                    labelStyle={styles.segmentedLabel}
                  />
                )}
              />
            </>
          ) : null}

          <Controller
            control={control}
            name="availability_text"
            render={({ field: { onChange, onBlur, value } }) => (
              <RNTextInput
                placeholder="Availability (optional) - E.g., Available evenings and weekends..."
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
    borderWidth: 2,
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
  segmented: {
    marginBottom: spacing.md,
  },
  segmentedButton: {
    backgroundColor: colors.surface,
  },
  segmentedLabel: {
    fontFamily: typography.fontFamilies.medium,
    fontSize: typography.fontSizes.base,
    color: colors.text,
  },
  button: {
    backgroundColor: colors.accent,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md + 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xl,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: colors.text,
    fontSize: typography.fontSizes.lg,
    fontFamily: typography.fontFamilies.medium,
    fontWeight: typography.fontWeights.semibold,
  },
  snackbar: {
    backgroundColor: colors.error,
  },
});

