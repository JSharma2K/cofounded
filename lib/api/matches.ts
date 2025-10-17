import { supabase } from '../supabase';
import type { Match, MatchWithUsers, User, Profile } from '../types';

export async function getMatches(userId: string): Promise<MatchWithUsers[]> {
  console.log('[getMatches] Fetching matches for user:', userId);
  
  // Get matches where user is either user_a or user_b
  const { data: matches, error } = await supabase
    .from('matches')
    .select('*')
    .or(`user_a.eq.${userId},user_b.eq.${userId}`)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[getMatches] Error fetching matches:', error);
    throw error;
  }
  
  console.log('[getMatches] Found matches:', matches?.length || 0);
  if (!matches || matches.length === 0) return [];

  // Collect all unique user IDs
  const userIds = new Set<string>();
  matches.forEach((m: Match) => {
    userIds.add(m.user_a);
    userIds.add(m.user_b);
  });

  // Fetch users and profiles
  console.log('[getMatches] Fetching user data for:', Array.from(userIds));
  const [usersRes, profilesRes] = await Promise.all([
    supabase.from('users').select('*').in('id', Array.from(userIds)),
    supabase.from('profiles').select('*').in('user_id', Array.from(userIds)),
  ]);

  if (usersRes.error) {
    console.error('[getMatches] Error fetching users:', usersRes.error);
    throw usersRes.error;
  }
  if (profilesRes.error) {
    console.error('[getMatches] Error fetching profiles:', profilesRes.error);
    throw profilesRes.error;
  }

  console.log('[getMatches] Users fetched:', usersRes.data?.length);
  console.log('[getMatches] Profiles fetched:', profilesRes.data?.length);

  const usersMap = new Map(usersRes.data?.map((u: User) => [u.id, u]) || []);
  const profilesMap = new Map(profilesRes.data?.map((p: Profile) => [p.user_id, p]) || []);
  
  console.log('[getMatches] UsersMap keys:', Array.from(usersMap.keys()));
  console.log('[getMatches] ProfilesMap keys:', Array.from(profilesMap.keys()));

  // Enrich matches with user data
  const enriched: MatchWithUsers[] = matches.map((m: Match) => ({
    ...m,
    user_a_data: usersMap.get(m.user_a) ? {
      ...usersMap.get(m.user_a)!,
      profile: profilesMap.get(m.user_a),
    } : undefined,
    user_b_data: usersMap.get(m.user_b) ? {
      ...usersMap.get(m.user_b)!,
      profile: profilesMap.get(m.user_b),
    } : undefined,
  }));

  return enriched;
}

export async function getOtherUser(match: MatchWithUsers, currentUserId: string) {
  return match.user_a === currentUserId ? match.user_b_data : match.user_a_data;
}

