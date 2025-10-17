import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Text, TextInput as RNTextInput, TouchableOpacity } from 'react-native';
import { Snackbar, SegmentedButtons } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { profileSchema, type ProfileForm } from '../../utils/schemas';
import { upsertProfile } from '../../lib/api/onboarding';
import { useSession } from '../../lib/hooks/useSession';
import { DOMAINS, SKILLS } from '../../utils/constants';
import { colors, typography, spacing, borderRadius } from '../../utils/theme';

export default function Step2Screen() {
  const router = useRouter();
  const { user } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      headline: '',
      bio: '',
      domains: [],
      skills: [],
      stage: 'idea',
      commitment_hours: 20,
    },
  });

  const onSubmit = async (data: ProfileForm) => {
    if (!user) return;

    setLoading(true);
    setError('');

    try {
      await upsertProfile(user.id, data);
      router.push('/(onboarding)/step-3');
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
      <ScrollView 
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <Text style={styles.heading}>Build your profile</Text>

          <Controller
            control={control}
            name="headline"
            render={({ field: { onChange, onBlur, value } }) => (
              <RNTextInput
                placeholder="Headline (optional) - e.g., Full-stack engineer looking for AI cofounder"
                placeholderTextColor={colors.textTertiary}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                style={[styles.input, errors.headline && styles.inputError]}
              />
            )}
          />
          {errors.headline && (
            <Text style={styles.errorText}>{errors.headline.message}</Text>
          )}

          <Controller
            control={control}
            name="bio"
            render={({ field: { onChange, onBlur, value } }) => (
              <RNTextInput
                placeholder="Bio (optional) - Tell us about yourself..."
                placeholderTextColor={colors.textTertiary}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                multiline
                numberOfLines={4}
                style={[styles.inputMultiline, errors.bio && styles.inputError]}
              />
            )}
          />
          {errors.bio && (
            <Text style={styles.errorText}>{errors.bio.message}</Text>
          )}

          <Text style={styles.label}>Domains (select at least one)</Text>
          <Controller
            control={control}
            name="domains"
            render={({ field: { onChange, value } }) => (
              <View style={styles.chipContainer}>
                {DOMAINS.map((domain) => (
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
            )}
          />
          {errors.domains && <Text style={styles.errorText}>{errors.domains.message}</Text>}

          <Text style={styles.label}>Skills (select at least one)</Text>
          <Controller
            control={control}
            name="skills"
            render={({ field: { onChange, value } }) => (
              <View style={styles.chipContainer}>
                {SKILLS.map((skill) => (
                  <TouchableOpacity
                    key={skill}
                    onPress={() => {
                      if (value.includes(skill)) {
                        onChange(value.filter((s) => s !== skill));
                      } else {
                        onChange([...value, skill]);
                      }
                    }}
                    style={[
                      styles.chip,
                      value.includes(skill) && styles.chipSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        value.includes(skill) && styles.chipTextSelected,
                      ]}
                    >
                      {skill}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          />
          {errors.skills && <Text style={styles.errorText}>{errors.skills.message}</Text>}

          <Text style={styles.label}>Current Stage</Text>
          <Controller
            control={control}
            name="stage"
            render={({ field: { onChange, value } }) => (
              <SegmentedButtons
                value={value}
                onValueChange={onChange}
                buttons={[
                  { value: 'idea', label: 'Idea' },
                  { value: 'prototype', label: 'Prototype' },
                  { value: 'launched', label: 'Launched' },
                ]}
                style={styles.segmented}
              />
            )}
          />

          <Text style={styles.label}>Weekly Commitment</Text>
          <Controller
            control={control}
            name="commitment_hours"
            render={({ field: { onChange, onBlur, value } }) => (
              <RNTextInput
                placeholder="Hours per week you can commit (e.g., 10, 20, 40)"
                placeholderTextColor={colors.textTertiary}
                value={String(value)}
                onChangeText={(text) => onChange(parseInt(text) || 0)}
                onBlur={onBlur}
                keyboardType="number-pad"
                style={[styles.input, errors.commitment_hours && styles.inputError]}
              />
            )}
          />
          {errors.commitment_hours && (
            <Text style={styles.errorText}>{errors.commitment_hours.message}</Text>
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

