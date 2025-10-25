import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Text, TextInput as RNTextInput, TouchableOpacity } from 'react-native';
import { Snackbar } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { intentSchema, type IntentForm } from '../../utils/schemas';
import { upsertIntent } from '../../lib/api/onboarding';
import { useSession } from '../../lib/hooks/useSession';
import { colors, typography, spacing, borderRadius } from '../../utils/theme';

export default function Step4Screen() {
  const router = useRouter();
  const { user } = useSession();
  const params = useLocalSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userRole, setUserRole] = useState<'mentor' | 'investor'>('mentor');

  useEffect(() => {
    // Get role from URL parameters or default to mentor
    if (params.role && (params.role === 'mentor' || params.role === 'investor')) {
      setUserRole(params.role as 'mentor' | 'investor');
    }
  }, [params.role]);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<IntentForm>({
    resolver: zodResolver(intentSchema),
    defaultValues: {
      seeking: 'mentor',
      availability_text: '',
    },
  });

  const onSubmit = async (data: IntentForm) => {
    if (!user) return;

    setLoading(true);
    setError('');

    try {
      const intentData = {
        ...data,
        seeking: userRole,
      };
      
      await upsertIntent(user.id, intentData);
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
          <View style={styles.roleContainer}>
            {(userRole === 'mentor' ? [
              { value: 'tech', label: 'Technology' },
              { value: 'business', label: 'Business Strategy' },
              { value: 'marketing', label: 'Marketing' },
              { value: 'finance', label: 'Finance' },
              { value: 'product', label: 'Product Management' },
              { value: 'operations', label: 'Operations' },
            ] : [
              { value: 'fintech', label: 'FinTech' },
              { value: 'healthtech', label: 'HealthTech' },
              { value: 'edtech', label: 'EdTech' },
              { value: 'ecommerce', label: 'E-commerce' },
              { value: 'saas', label: 'SaaS' },
              { value: 'ai', label: 'AI/ML' },
            ]).map((area) => (
              <TouchableOpacity
                key={area.value}
                style={[
                  styles.areaButton,
                  // Add selection logic here
                ]}
                onPress={() => {
                  // Handle area selection
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.areaButtonText}>
                  {area.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>
            {userRole === 'mentor' ? 'Years of Experience' : 'Investment Stage'}
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
                  // Add selection logic here
                ]}
                onPress={() => {
                  // Handle option selection
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.areaButtonText}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

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
  },
  areaButtonText: {
    color: colors.textSecondary,
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamilies.regular,
    textAlign: 'center',
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
});
