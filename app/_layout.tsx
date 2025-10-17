import { Slot, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { PaperProvider, MD3DarkTheme } from 'react-native-paper';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useSession } from '../lib/hooks/useSession';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import * as Linking from 'expo-linking';
import { supabase } from '../lib/supabase';
import { colors } from '../utils/theme';
import { useFonts } from '../lib/hooks/useFonts';

const queryClient = new QueryClient();

const paperTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: colors.primary,
    background: colors.background,
    surface: colors.surface,
    accent: colors.accent,
    text: colors.text,
    onSurface: colors.text,
    placeholder: colors.textTertiary,
    backdrop: 'rgba(0, 0, 0, 0.5)',
  },
};

function AuthGuard() {
  const { session, loading } = useSession();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inOnboarding = segments[0] === '(onboarding)';
    const inTabs = segments[0] === '(tabs)';

    if (!session && !inAuthGroup) {
      // Not signed in, redirect to sign in
      router.replace('/(auth)/signin');
    } else if (session && inAuthGroup) {
      // Signed in but on auth screen, check if profile exists
      checkProfileAndRedirect(session.user.id, router);
    }
  }, [session, loading, segments]);

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <Slot />;
}

// Check if user has completed onboarding
async function checkProfileAndRedirect(userId: string, router: any) {
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('user_id', userId)
      .single();
    
    if (profile) {
      // Profile exists, go to feed
      console.log('[AuthGuard] Profile exists, redirecting to feed');
      router.replace('/(tabs)/feed');
    } else {
      // No profile, go to onboarding
      console.log('[AuthGuard] No profile found, redirecting to onboarding');
      router.replace('/(onboarding)/step-1');
    }
  } catch (error) {
    // If error or no profile, go to onboarding
    console.log('[AuthGuard] Error checking profile, redirecting to onboarding:', error);
    router.replace('/(onboarding)/step-1');
  }
}

export default function RootLayout() {
  const fontsLoaded = useFonts();

  useEffect(() => {
    // Handle deep links for authentication
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        console.log('User signed in via magic link');
      }
    });

    // Set up deep link listener
    const subscription = Linking.addEventListener('url', ({ url }) => {
      console.log('Deep link received:', url);
      // Supabase will automatically handle the auth callback
    });

    // Check for initial URL (when app is opened via link)
    Linking.getInitialURL().then((url) => {
      if (url) {
        console.log('Initial URL:', url);
      }
    });

    return () => {
      subscription.remove();
      authListener.subscription.unsubscribe();
    };
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <PaperProvider theme={paperTheme}>
        <AuthGuard />
      </PaperProvider>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});

