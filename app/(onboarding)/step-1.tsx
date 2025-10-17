import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Text, TextInput as RNTextInput, TouchableOpacity } from 'react-native';
import { Snackbar, SegmentedButtons } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { userInfoSchema, type UserInfoForm } from '../../utils/schemas';
import { updateUserInfo } from '../../lib/api/onboarding';
import { useSession } from '../../lib/hooks/useSession';
import { LANGUAGES } from '../../utils/constants';
import { colors, typography, spacing, borderRadius } from '../../utils/theme';
import * as Localization from 'expo-localization';

export default function Step1Screen() {
  const router = useRouter();
  const { user } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<UserInfoForm>({
    resolver: zodResolver(userInfoSchema),
    defaultValues: {
      display_name: '',
      age_band: '19-22',
      timezone: Localization.getCalendars()[0]?.timeZone || 'UTC',
      languages: ['English'],
    },
  });

  const onSubmit = async (data: UserInfoForm) => {
    if (!user) return;

    setLoading(true);
    setError('');

    try {
      await updateUserInfo(user.id, data);
      router.push('/(onboarding)/step-2');
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
          <Text style={styles.heading}>Tell us about yourself</Text>

          <Controller
            control={control}
            name="display_name"
            render={({ field: { onChange, onBlur, value } }) => (
              <RNTextInput
                placeholder="Display Name"
                placeholderTextColor={colors.textTertiary}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                style={[styles.input, errors.display_name && styles.inputError]}
              />
            )}
          />
          {errors.display_name && (
            <Text style={styles.errorText}>{errors.display_name.message}</Text>
          )}

          <Text style={styles.label}>Age Range</Text>
          <Controller
            control={control}
            name="age_band"
            render={({ field: { onChange, value } }) => (
              <SegmentedButtons
                value={value}
                onValueChange={onChange}
                buttons={[
                  { value: '16-18', label: '16-18' },
                  { value: '19-22', label: '19-22' },
                  { value: '23-26', label: '23-26' },
                  { value: '27+', label: '27+' },
                ]}
                style={styles.segmented}
              />
            )}
          />

          <Controller
            control={control}
            name="timezone"
            render={({ field: { onChange, onBlur, value } }) => (
              <RNTextInput
                placeholder="Timezone"
                placeholderTextColor={colors.textTertiary}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                style={[styles.input, errors.timezone && styles.inputError]}
              />
            )}
          />

          <Text style={styles.label}>Languages (select at least one)</Text>
          <Controller
            control={control}
            name="languages"
            render={({ field: { onChange, value } }) => (
              <View style={styles.chipContainer}>
                {LANGUAGES.map((lang) => (
                  <TouchableOpacity
                    key={lang}
                    onPress={() => {
                      if (value.includes(lang)) {
                        onChange(value.filter((l) => l !== lang));
                      } else {
                        onChange([...value, lang]);
                      }
                    }}
                    style={[
                      styles.chip,
                      value.includes(lang) && styles.chipSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        value.includes(lang) && styles.chipTextSelected,
                      ]}
                    >
                      {lang}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          />
          {errors.languages && (
            <Text style={styles.errorText}>{errors.languages.message}</Text>
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
  content: {
    padding: spacing.lg,
  },
  heading: {
    fontSize: typography.fontSizes.xxl,
    fontFamily: typography.fontFamilies.bold,
    fontWeight: typography.fontWeights.bold,
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
  inputError: {
    borderColor: colors.error,
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
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
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
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  chipText: {
    color: colors.textSecondary,
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamilies.medium,
  },
  chipTextSelected: {
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
