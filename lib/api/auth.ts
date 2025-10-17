import { supabase } from '../supabase';
import * as Localization from 'expo-localization';

export async function signInWithEmail(email: string) {
  // Send OTP code via email (no redirect needed)
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true,
    },
  });

  if (error) throw error;
}

export async function verifyOtp(email: string, token: string) {
  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: 'email',
  });

  if (error) throw error;
  
  // Ensure user record exists in database immediately after verification
  if (data.session?.user?.id) {
    await ensureUserRecord(data.session.user.id);
  }
  
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function deleteAccount(userId: string) {
  console.log('[deleteAccount] Deleting account for user:', userId);
  
  try {
    // Call the database function to delete all user data
    // This function runs with elevated privileges to bypass RLS
    const { error: deleteError } = await supabase.rpc('delete_user_account', {
      user_id_to_delete: userId
    });
    
    if (deleteError) {
      console.error('[deleteAccount] Error deleting user data:', deleteError);
      throw deleteError;
    }
    
    console.log('[deleteAccount] Database records deleted successfully');
    
    // Sign out (this will end the session)
    // Note: The auth.users record will remain in Supabase Auth, but all app data is deleted
    // The user would need to go through onboarding again if they sign in with the same email
    await signOut();
    
    console.log('[deleteAccount] Account deleted and signed out successfully');
  } catch (error) {
    console.error('[deleteAccount] Error during account deletion:', error);
    throw error;
  }
}

// Check if user has completed onboarding
export async function checkOnboardingStatus(userId: string) {
  const [userRes, profileRes, intentRes] = await Promise.all([
    supabase.from('users').select('*').eq('id', userId).single(),
    supabase.from('profiles').select('*').eq('user_id', userId).single(),
    supabase.from('intents').select('*').eq('user_id', userId).single(),
  ]);

  return {
    hasUser: !userRes.error && !!userRes.data,
    hasProfile: !profileRes.error && !!profileRes.data,
    hasIntent: !intentRes.error && !!intentRes.data,
    isComplete: !userRes.error && !profileRes.error && !intentRes.error,
  };
}

// Create initial user record on first login
export async function ensureUserRecord(userId: string) {
  console.log('[ensureUserRecord] Creating user record for:', userId);
  const timezone = Localization.getCalendars()[0]?.timeZone || 'UTC';
  
  // @ts-ignore - Supabase type inference issue
  const { error } = await supabase.from('users').insert({
    id: userId,
    display_name: 'User',
    age_band: '19-22',
    timezone,
    languages: ['English'],
    verification_tier: 0,
  });

  if (error) {
    // 23505 = unique violation (user already exists - that's OK)
    if (error.code?.includes('23505')) {
      console.log('[ensureUserRecord] User already exists, skipping');
      return;
    }
    console.error('[ensureUserRecord] Error creating user:', error);
    throw error;
  }
  
  console.log('[ensureUserRecord] User record created successfully');
}

