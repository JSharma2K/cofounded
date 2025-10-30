import { supabase } from '../supabase';
import type { UserInfoForm, ProfileForm, IntentForm, ExpertiseForm } from '../../utils/schemas';

export async function updateUserInfo(userId: string, data: UserInfoForm) {
  console.log('[updateUserInfo] Upserting user info for:', userId);
  const { error } = await supabase
    .from('users')
    .upsert({
      id: userId,
      display_name: data.display_name,
      age: data.age,
      timezone: data.timezone,
      languages: data.languages,
      verification_tier: 0, // Default verification tier
    }, { onConflict: 'id' });

  if (error) {
    console.error('[updateUserInfo] Error:', error);
    throw error;
  }
  console.log('[updateUserInfo] Success');
}

export async function upsertProfile(userId: string, data: ProfileForm) {
  console.log('[upsertProfile] Upserting profile for user:', userId);
  
  // First verify the user exists
  const { data: userData, error: userCheckError } = await supabase
    .from('users')
    .select('id')
    .eq('id', userId)
    .single();
  
  if (userCheckError || !userData) {
    console.error('[upsertProfile] User not found in database:', userId);
    throw new Error('User record must exist before creating profile. Please try signing in again.');
  }
  
  console.log('[upsertProfile] User exists, proceeding with profile upsert');
  
  const { error } = await supabase
    .from('profiles')
    .upsert({
      user_id: userId,
      headline: data.headline,
      bio: data.bio,
      business_domains: data.business_domains || [],
      domains: data.domains,
      skills: data.skills,
      stage: data.stage || null,
      commitment_hours: data.commitment_hours,
      availability_text: data.availability_text,
    }, { onConflict: 'user_id' });

  if (error) {
    console.error('[upsertProfile] Error:', error);
    throw error;
  }
  console.log('[upsertProfile] Success');
}

export async function updateUserRole(userId: string, userRole: string) {
  console.log('[updateUserRole] Updating user role for:', userId, 'to:', userRole);
  const { error } = await supabase
    .from('users')
    .update({ user_role: userRole })
    .eq('id', userId);

  if (error) {
    console.error('[updateUserRole] Error:', error);
    throw error;
  }
  console.log('[updateUserRole] Success');
}

export async function upsertIntent(userId: string, data: IntentForm) {
  const { error } = await supabase
    .from('intents')
    .upsert({
      user_id: userId,
      seeking: data.seeking,
      availability_text: data.availability_text,
    }, { onConflict: 'user_id' });

  if (error) throw error;
}

export async function upsertExpertise(userId: string, data: ExpertiseForm & { 
  experience_level?: string | null;
  investment_type?: string | null;
  portfolio_size?: string | null;
  portfolio_url?: string | null;
}) {
  console.log('[upsertExpertise] Upserting expertise for user:', userId);
  
  // Clear investor-specific fields if not an investor
  const isInvestor = data.seeking === 'investor';
  
  const { error } = await supabase
    .from('intents')
    .upsert({
      user_id: userId,
      seeking: data.seeking,
      availability_text: data.availability_text,
      expertise_areas: data.expertise_areas,
      experience_level: data.experience_level,
      // Only save investor fields if user is an investor, otherwise set to null
      investment_type: isInvestor ? data.investment_type : null,
      portfolio_size: isInvestor ? data.portfolio_size : null,
      portfolio_url: isInvestor ? data.portfolio_url : null,
    }, { onConflict: 'user_id' });

  if (error) {
    console.error('[upsertExpertise] Error:', error);
    throw error;
  }
  
  console.log('[upsertExpertise] Success');
}

