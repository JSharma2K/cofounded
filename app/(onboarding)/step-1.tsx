import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Text, TextInput as RNTextInput, TouchableOpacity } from 'react-native';
import { Snackbar } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
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
  const [focusedField, setFocusedField] = useState<null | 'display_name' | 'timezone' | 'age'>(null);
  const [age, setAge] = useState<number>(23);
  const [ageText, setAgeText] = useState<string>('23');

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<UserInfoForm>({
    resolver: zodResolver(userInfoSchema),
    defaultValues: {
      display_name: '',
      age: 23,
      timezone: Localization.getCalendars()[0]?.timeZone || 'UTC',
      languages: ['English'],
    },
  });

  const onSubmit = async (data: UserInfoForm) => {
    if (!user) return;

    setLoading(true);
    setError('');

    try {
      await updateUserInfo(user.id, { ...data, age });
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
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <View style={styles.scroll}>
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
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
                onFocus={() => setFocusedField('display_name')}
                onBlur={() => {
                  onBlur();
                  setFocusedField(null);
                }}
                style={[
                  styles.input,
                  focusedField === 'display_name' && styles.inputFocused,
                  errors.display_name && styles.inputError,
                ]}
              />
            )}
          />
          {errors.display_name && (
            <Text style={styles.errorText}>{errors.display_name.message}</Text>
          )}

          <Text style={styles.label}>Age</Text>
          <View style={styles.ageRow}>
            <TouchableOpacity
              accessibilityLabel="Decrease age"
              onPress={() => {
                setAge((a) => {
                  const next = Math.max(0, a - 1);
                  setAgeText(String(next));
                  return next;
                });
              }}
              style={styles.ageButton}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="minus" size={22} color={colors.primary} />
            </TouchableOpacity>

            <View style={styles.ageValueContainer}>
              <RNTextInput
                value={ageText}
                onChangeText={(txt) => {
                  const cleaned = txt.replace(/[^0-9]/g, '');
                  // Allow empty while typing
                  setAgeText(cleaned);
                }}
                onFocus={() => setFocusedField('age')}
                onBlur={() => {
                  setFocusedField(null);
                  if (ageText === '') {
                    // Restore previous valid value
                    setAgeText(String(age));
                    return;
                  }
                  const num = Math.min(100, Math.max(0, parseInt(ageText, 10)));
                  setAge(num);
                  setAgeText(String(num));
                }}
                keyboardType="number-pad"
                maxLength={2}
                style={[styles.ageInput, focusedField === 'age' && styles.inputFocused]}
                placeholder="Age"
                placeholderTextColor={colors.textTertiary}
              />
            </View>

            <TouchableOpacity
              accessibilityLabel="Increase age"
              onPress={() => {
                setAge((a) => {
                  const next = Math.min(100, a + 1);
                  setAgeText(String(next));
                  return next;
                });
              }}
              style={styles.ageButton}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="plus" size={22} color={colors.primary} />
            </TouchableOpacity>
          </View>

          <Controller
            control={control}
            name="timezone"
            render={({ field: { onChange, onBlur, value } }) => (
              <RNTextInput
                placeholder="Timezone"
                placeholderTextColor={colors.textTertiary}
                value={value}
                onChangeText={onChange}
                onFocus={() => setFocusedField('timezone')}
                onBlur={() => {
                  onBlur();
                  setFocusedField(null);
                }}
                style={[
                  styles.input,
                  focusedField === 'timezone' && styles.inputFocused,
                  errors.timezone && styles.inputError,
                ]}
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
                    activeOpacity={0.7}
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
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
  inputFocused: {
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
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
  ageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.lg,
    marginBottom: spacing.md,
  },
  ageButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ageValueContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  ageInput: {
    width: '100%',
    textAlign: 'center',
    fontSize: typography.fontSizes.lg,
    fontFamily: typography.fontFamilies.regular,
    color: colors.text,
    paddingVertical: spacing.xs,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
    justifyContent: 'flex-start',
  },
  chip: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.xs,
    width: 85, // Increased width to fit longer names
    height: 32, // Fixed height for consistent size
    alignItems: 'center',
    justifyContent: 'center',
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
    fontSize: 11, // Slightly smaller to fit better
    fontFamily: typography.fontFamilies.regular,
    textAlign: 'center',
  },
  chipTextSelected: {
    color: colors.primary, // Coral text when selected
    fontWeight: '500',
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm, // Reduced from spacing.lg to move button higher
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
