import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, Text, TextInput as RNTextInput, TouchableOpacity, StatusBar, Animated } from 'react-native';
import { Snackbar } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { signInWithEmail, verifyOtp } from '../../lib/api/auth';
import { colors, typography, spacing, borderRadius } from '../../utils/theme';

export default function SignInScreen() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [otpFocused, setOtpFocused] = useState(false);
  
  // Animation values
  const titleFadeAnim = useRef(new Animated.Value(0)).current;
  const titleTranslateYAnim = useRef(new Animated.Value(-30)).current;
  const subtitleFadeAnim = useRef(new Animated.Value(0)).current;
  const subtitleTranslateYAnim = useRef(new Animated.Value(-20)).current;
  const formFadeAnim = useRef(new Animated.Value(0)).current;
  const formTranslateYAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    // Staggered animation sequence
    const animationSequence = Animated.sequence([
      // First: Title appears and floats up
      Animated.parallel([
        Animated.timing(titleFadeAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(titleTranslateYAnim, {
          toValue: 0,
          duration: 1200,
          useNativeDriver: true,
        }),
      ]),
      // Second: Subtitle appears and floats up (with delay)
      Animated.parallel([
        Animated.timing(subtitleFadeAnim, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(subtitleTranslateYAnim, {
          toValue: 0,
          duration: 900,
          useNativeDriver: true,
        }),
      ]),
      // Third: Title and subtitle float up together
      Animated.parallel([
        Animated.timing(titleTranslateYAnim, {
          toValue: -20,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(subtitleTranslateYAnim, {
          toValue: -15,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
      // Fourth: Form elements fade in from below
      Animated.parallel([
        Animated.timing(formFadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(formTranslateYAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    ]);

    animationSequence.start();
  }, []);

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
        <Animated.Text 
          style={[
            styles.title,
            {
              opacity: titleFadeAnim,
              transform: [{ translateY: titleTranslateYAnim }],
            },
          ]}
        >
          Co-founded
        </Animated.Text>
        <Animated.Text 
          style={[
            styles.subtitle,
            {
              opacity: subtitleFadeAnim,
              transform: [{ translateY: subtitleTranslateYAnim }],
            },
          ]}
        >
          Where ideas find their people.
        </Animated.Text>

        <Animated.View 
          style={[
            styles.formContainer,
            {
              opacity: formFadeAnim,
              transform: [{ translateY: formTranslateYAnim }],
            },
          ]}
        >
          <RNTextInput
            placeholder="Email"
            placeholderTextColor={colors.textTertiary}
            selectionColor={colors.primary}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            style={[styles.input, emailFocused && styles.inputFocused]}
            editable={!loading && !otpSent}
            onFocus={() => setEmailFocused(true)}
            onBlur={() => setEmailFocused(false)}
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
                style={[styles.input, otpFocused && styles.inputFocused]}
                editable={!loading}
                onFocus={() => setOtpFocused(true)}
                onBlur={() => setOtpFocused(false)}
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
              <MaterialCommunityIcons name="check-circle" size={20} color={colors.text} />
              <Text style={styles.successMessage}>{message}</Text>
            </View>
          )}
        </Animated.View>
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
        fontFamily: typography.fontFamilies.title,
        color: colors.primary,
        textAlign: 'center',
        marginBottom: spacing.sm,
        letterSpacing: -0.5,
      },
      subtitle: {
        fontSize: typography.fontSizes.lg,
        fontFamily: typography.fontFamilies.regular,
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
  inputFocused: {
    borderColor: colors.primary,
    backgroundColor: colors.surface,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm,
    alignSelf: 'center',
    minWidth: 120,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: colors.text,
    fontSize: typography.fontSizes.base,
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
    padding: spacing.lg,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  successMessage: {
    color: colors.text,
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamilies.ui,
    textAlign: 'center',
    fontWeight: '500',
  },
  snackbar: {
    backgroundColor: colors.error,
  },
});

