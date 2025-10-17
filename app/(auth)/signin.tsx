import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, Text, TextInput as RNTextInput, TouchableOpacity, StatusBar } from 'react-native';
import { Snackbar } from 'react-native-paper';
import { signInWithEmail, verifyOtp } from '../../lib/api/auth';
import { colors, typography, spacing, borderRadius } from '../../utils/theme';

export default function SignInScreen() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  const handleSendOtp = async () => {
    if (!email.trim()) {
      setError('Please enter your email');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      await signInWithEmail(email.trim().toLowerCase());
      setMessage('Check your email for the 6-digit code!');
      setOtpSent(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send code');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp.trim()) {
      setError('Please enter the code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await verifyOtp(email.trim().toLowerCase(), otp.trim());
      setMessage('Successfully signed in!');
    } catch (err: any) {
      setError(err.message || 'Invalid code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
      <View style={styles.content}>
          <Text style={styles.title}>Co-founded</Text>
        <Text style={styles.subtitle}>
          Where ideas find their people.
        </Text>

        {!otpSent && (
          <Text style={styles.helperText}>
            We'll send a secure one time code to your email.
          </Text>
        )}

        <View style={styles.formContainer}>
          <RNTextInput
            placeholder="Email"
            placeholderTextColor={colors.textTertiary}
            selectionColor={colors.primary}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            style={styles.input}
            editable={!loading && !otpSent}
          />

          {!otpSent ? (
            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleSendOtp}
              disabled={loading}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Sending...' : 'Send Code'}
              </Text>
            </TouchableOpacity>
          ) : (
            <>
              <RNTextInput
                placeholder="6-Digit Code"
                placeholderTextColor={colors.textTertiary}
                selectionColor={colors.primary}
                value={otp}
                onChangeText={setOtp}
                keyboardType="number-pad"
                maxLength={6}
                style={styles.input}
                editable={!loading}
              />
              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleVerifyOtp}
                disabled={loading}
                activeOpacity={0.8}
              >
                <Text style={styles.buttonText}>
                  {loading ? 'Verifying...' : 'Verify Code'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setOtpSent(false);
                  setOtp('');
                  setMessage('');
                }}
                disabled={loading}
                style={styles.changeEmailButton}
              >
                <Text style={styles.changeEmailText}>Change Email</Text>
              </TouchableOpacity>
            </>
          )}

          {message && (
            <View style={styles.messageContainer}>
              <Text style={styles.successMessage}>{message}</Text>
            </View>
          )}
        </View>
      </View>
      </KeyboardAvoidingView>

      <Snackbar
        visible={!!error}
        onDismiss={() => setError('')}
        duration={4000}
        style={styles.snackbar}
      >
        {error}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    maxWidth: 600,
    width: '100%',
    alignSelf: 'center',
  },
  title: {
    fontSize: typography.fontSizes.displayLarge,
    fontFamily: typography.fontFamilies.ui,
    color: colors.primary,
    textAlign: 'center',
    marginBottom: spacing.sm,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: typography.fontSizes.lg,
    fontFamily: typography.fontFamilies.ui,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: typography.fontSizes.lg * typography.lineHeights.normal,
  },
  helperText: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamilies.ui,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: typography.fontSizes.base * typography.lineHeights.relaxed,
  },
  formContainer: {
    marginTop: spacing.md,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: typography.fontSizes.base,
    color: colors.text,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  button: {
    backgroundColor: colors.accent,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md + 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: colors.text,
    fontSize: typography.fontSizes.lg,
    fontFamily: typography.fontFamilies.ui,
  },
  changeEmailButton: {
    marginTop: spacing.lg,
    alignItems: 'center',
  },
  changeEmailText: {
    color: colors.textSecondary,
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamilies.ui,
  },
  messageContainer: {
    marginTop: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.sm,
    borderLeftWidth: 3,
    borderLeftColor: colors.success,
  },
  successMessage: {
    color: colors.success,
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamilies.ui,
    textAlign: 'center',
  },
  snackbar: {
    backgroundColor: colors.error,
  },
});

