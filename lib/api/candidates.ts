import { supabase } from '../supabase';
import type { User, Candidate } from '../types';
import Constants from 'expo-constants';

const SWIPE_FN_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_SWIPE_FN_URL || 
  process.env.EXPO_PUBLIC_SWIPE_FN_URL;

export async function getCandidates(limit = 50): Promise<Candidate[]> {
  // For testing: Always return mock candidates
  // TODO: In production, uncomment the RPC call below
  console.log('[getCandidates] Returning mock candidates for testing');
  return await getMockCandidates();
  
  /* PRODUCTION CODE - uncomment when you have real users:
  // Call the RPC function
  const { data: users, error } = await supabase
    .rpc('get_candidates', { limit_count: limit } as any);

  if (error) throw error;
  
  // If no real candidates, return mock data for testing
  if (!users || (users as any[]).length === 0) {
    return await getMockCandidates();
  }

  // Fetch profiles for all candidates
  const userIds = (users as any[]).map((u: User) => u.id);
  const { data: profiles, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .in('user_id', userIds);

  if (profileError) throw profileError;

  // Merge users with profiles
  const candidates: Candidate[] = (users as any[]).map((user: User) => ({
    user,
    profile: (profiles as any[])?.find(p => p.user_id === user.id) || {
      user_id: user.id,
      headline: null,
      bio: null,
      location_geo: null,
      domains: [],
      skills: [],
      stage: null,
      commitment_hours: null,
      visibility: {},
    },
  }));

  return candidates;
  */
}

// Mock candidates for testing when no real candidates exist
async function getMockCandidates(): Promise<Candidate[]> {
  // Note: Mock users are created via migration, no need to insert on every load
  // await ensureMockUsers();
  
  return [
    {
      user: {
        id: '11111111-1111-1111-1111-111111111111',
        display_name: 'Alex Chen',
        age_band: '23-26',
        timezone: 'America/New_York',
        languages: ['English', 'Mandarin'],
        verification_tier: 0,
        is_minor: false,
        created_at: new Date().toISOString(),
      },
      profile: {
        user_id: '11111111-1111-1111-1111-111111111111',
        headline: 'AI Engineer looking for cofounder',
        bio: 'Passionate about building AI products that solve real problems. 5+ years in ML/AI with experience at top tech companies.',
        location_geo: null,
        domains: ['AI/ML', 'SaaS'],
        skills: ['Engineering', 'Data Science', 'Backend Development'],
        stage: 'prototype',
        commitment_hours: 20,
        visibility: {},
      },
      intent: {
        user_id: '11111111-1111-1111-1111-111111111111',
        seeking: 'cofounder',
        expertise_areas: ['Technical Architecture', 'Machine Learning', 'Product Strategy'],
        experience_level: '5-10',
        availability_text: 'Available 20-30 hours per week. Looking for someone with strong business acumen to complement my technical skills.',
        investment_type: null,
        portfolio_size: null,
        portfolio_url: null,
      },
    },
    {
      user: {
        id: '22222222-2222-2222-2222-222222222222',
        display_name: 'Sarah Johnson',
        age_band: '27+',
        timezone: 'America/Los_Angeles',
        languages: ['English'],
        verification_tier: 0,
        is_minor: false,
        created_at: new Date().toISOString(),
      },
      profile: {
        user_id: '22222222-2222-2222-2222-222222222222',
        headline: 'Product Manager seeking technical cofounder',
        bio: 'Experienced PM with strong business acumen. Led product at 2 successful startups. Looking to build the next big thing.',
        location_geo: null,
        domains: ['SaaS', 'Consumer Apps'],
        skills: ['Product Management', 'Marketing', 'Business Development'],
        stage: 'idea',
        commitment_hours: 15,
        visibility: {},
      },
      intent: {
        user_id: '22222222-2222-2222-2222-222222222222',
        seeking: 'cofounder',
        expertise_areas: ['Go-to-Market', 'Product Strategy', 'User Research'],
        experience_level: '10-15',
        availability_text: 'Can dedicate 15-20 hours weekly. Seeking a technical cofounder to build an MVP together.',
        investment_type: null,
        portfolio_size: null,
        portfolio_url: null,
      },
    },
    {
      user: {
        id: '33333333-3333-3333-3333-333333333333',
        display_name: 'Marcus Williams',
        age_band: '27+',
        timezone: 'Europe/London',
        languages: ['English', 'Spanish'],
        verification_tier: 0,
        is_minor: false,
        created_at: new Date().toISOString(),
      },
      profile: {
        user_id: '33333333-3333-3333-3333-333333333333',
        headline: 'Full-stack developer ready to build',
        bio: 'Full-stack engineer with expertise in React, Node.js, and cloud infrastructure. Built and scaled multiple web applications.',
        location_geo: null,
        domains: ['Developer Tools', 'B2B Software'],
        skills: ['Engineering', 'Frontend Development', 'Backend Development'],
        stage: 'launched',
        commitment_hours: 25,
        visibility: {},
      },
      intent: {
        user_id: '33333333-3333-3333-3333-333333333333',
        seeking: 'cofounder',
        expertise_areas: ['Full Stack Development', 'DevOps', 'System Architecture'],
        experience_level: '10-15',
        availability_text: 'Currently working on a side project that has traction. Looking for a business-minded cofounder to scale it together.',
        investment_type: null,
        portfolio_size: null,
        portfolio_url: null,
      },
    },
    {
      user: {
        id: '44444444-4444-4444-4444-444444444444',
        display_name: 'Priya Patel',
        age_band: '23-26',
        timezone: 'Asia/Kolkata',
        languages: ['English', 'Hindi'],
        verification_tier: 0,
        is_minor: false,
        created_at: new Date().toISOString(),
      },
      profile: {
        user_id: '44444444-4444-4444-4444-444444444444',
        headline: 'Designer + Entrepreneur',
        bio: 'UI/UX designer with startup experience. Passionate about creating beautiful, functional products that users love.',
        location_geo: null,
        domains: ['Consumer Apps', 'Social'],
        skills: ['Design', 'Product Management', 'Marketing'],
        stage: 'prototype',
        commitment_hours: 18,
        visibility: {},
      },
      intent: {
        user_id: '44444444-4444-4444-4444-444444444444',
        seeking: 'cofounder',
        expertise_areas: ['Product Design', 'User Experience', 'Brand Strategy'],
        experience_level: '5-10',
        availability_text: 'Have a working prototype and early user feedback. Need a technical cofounder to build the full product.',
        investment_type: null,
        portfolio_size: null,
        portfolio_url: null,
      },
    },
    {
      user: {
        id: '55555555-5555-5555-5555-555555555555',
        display_name: 'David Kim',
        age_band: '27+',
        timezone: 'America/Chicago',
        languages: ['English', 'Korean'],
        verification_tier: 0,
        is_minor: false,
        created_at: new Date().toISOString(),
      },
      profile: {
        user_id: '55555555-5555-5555-5555-555555555555',
        headline: 'Data Scientist turned entrepreneur',
        bio: 'PhD in ML, worked at top tech companies. Ready to build something meaningful that makes a real impact.',
        location_geo: null,
        domains: ['AI/ML', 'Healthcare'],
        skills: ['Data Science', 'Engineering', 'Product Management'],
        stage: 'idea',
        commitment_hours: 30,
        visibility: {},
      },
      intent: {
        user_id: '55555555-5555-5555-5555-555555555555',
        seeking: 'cofounder',
        expertise_areas: ['Data Science', 'AI/ML', 'Healthcare Tech'],
        experience_level: '15+',
        availability_text: 'Ready to go full-time on the right opportunity. Ideally looking for a cofounder with healthcare industry experience.',
        investment_type: null,
        portfolio_size: null,
        portfolio_url: null,
      },
    },
    // MENTOR PROFILE
    {
      user: {
        id: '66666666-6666-6666-6666-666666666666',
        display_name: 'Jennifer Martinez',
        age_band: '27+',
        timezone: 'America/San_Francisco',
        languages: ['English', 'Spanish'],
        verification_tier: 0,
        is_minor: false,
        created_at: new Date().toISOString(),
      },
      profile: {
        user_id: '66666666-6666-6666-6666-666666666666',
        headline: 'Serial Entrepreneur & Startup Mentor',
        bio: 'Founded and exited 2 SaaS companies. Now helping early-stage founders navigate the startup journey. Specializing in product-market fit and scaling strategies.',
        location_geo: null,
        domains: ['SaaS', 'B2B Software', 'Enterprise'],
        skills: ['Product Management', 'Business Development', 'Fundraising'],
        stage: null,
        commitment_hours: null,
        visibility: {},
      },
      intent: {
        user_id: '66666666-6666-6666-6666-666666666666',
        seeking: 'mentor',
        expertise_areas: ['Go-to-Market', 'Fundraising', 'Product-Market Fit', 'Scaling'],
        experience_level: '15+',
        availability_text: 'Available for 2-4 mentoring sessions per month. Best fit for B2B SaaS founders in seed to Series A stage.',
        investment_type: null,
        portfolio_size: null,
        portfolio_url: null,
      },
    },
    // INVESTOR PROFILE 1
    {
      user: {
        id: '77777777-7777-7777-7777-777777777777',
        display_name: 'Michael Anderson',
        age_band: '27+',
        timezone: 'America/New_York',
        languages: ['English'],
        verification_tier: 0,
        is_minor: false,
        created_at: new Date().toISOString(),
      },
      profile: {
        user_id: '77777777-7777-7777-7777-777777777777',
        headline: 'Angel Investor | Ex-Google PM',
        bio: 'Investing in AI and developer tools. Former Google PM with 15 years in tech. Provide strategic guidance and network access to my portfolio companies.',
        location_geo: null,
        domains: ['AI/ML', 'Developer Tools', 'SaaS'],
        skills: ['Product Management', 'Business Development', 'Technical Architecture'],
        stage: null,
        commitment_hours: null,
        visibility: {},
      },
      intent: {
        user_id: '77777777-7777-7777-7777-777777777777',
        seeking: 'investor',
        expertise_areas: ['AI/ML', 'Developer Tools', 'Product Strategy'],
        experience_level: 'seed',
        availability_text: 'Typical check size: $50K-$150K. Looking for technical founders building in AI infrastructure or developer productivity.',
        investment_type: 'angel',
        portfolio_size: '23',
        portfolio_url: null,
      },
    },
    // INVESTOR PROFILE 2
    {
      user: {
        id: '88888888-8888-8888-8888-888888888888',
        display_name: 'Rebecca Thompson',
        age_band: '27+',
        timezone: 'America/Los_Angeles',
        languages: ['English', 'French'],
        verification_tier: 0,
        is_minor: false,
        created_at: new Date().toISOString(),
      },
      profile: {
        user_id: '88888888-8888-8888-8888-888888888888',
        headline: 'VC Partner | Consumer Tech Focus',
        bio: 'Partner at Catalyst Ventures. Leading investments in consumer apps, marketplace, and social platforms. Passionate about products that bring people together.',
        location_geo: null,
        domains: ['Consumer Apps', 'Social', 'Marketplace'],
        skills: ['Business Development', 'Marketing', 'Product Management'],
        stage: null,
        commitment_hours: null,
        visibility: {},
      },
      intent: {
        user_id: '88888888-8888-8888-8888-888888888888',
        seeking: 'investor',
        expertise_areas: ['Consumer Growth', 'Social Products', 'Marketplace Dynamics'],
        experience_level: 'series-a',
        availability_text: 'Leading rounds from $2M-$10M. Interested in consumer apps with strong retention and network effects.',
        investment_type: 'vc',
        portfolio_size: '47',
        portfolio_url: null,
      },
    },
    // MENTOR PROFILE 2
    {
      user: {
        id: '99999999-9999-9999-9999-999999999999',
        display_name: 'Dr. Rajesh Kumar',
        age_band: '27+',
        timezone: 'Asia/Singapore',
        languages: ['English', 'Hindi', 'Tamil'],
        verification_tier: 0,
        is_minor: false,
        created_at: new Date().toISOString(),
      },
      profile: {
        user_id: '99999999-9999-9999-9999-999999999999',
        headline: 'Tech CTO & Engineering Mentor',
        bio: 'Built and scaled engineering teams at 3 unicorns. Now mentoring technical founders on system design, hiring, and engineering culture.',
        location_geo: null,
        domains: ['Developer Tools', 'SaaS', 'Enterprise'],
        skills: ['Engineering', 'Technical Architecture', 'Team Building'],
        stage: null,
        commitment_hours: null,
        visibility: {},
      },
      intent: {
        user_id: '99999999-9999-9999-9999-999999999999',
        seeking: 'mentor',
        expertise_areas: ['Engineering Leadership', 'System Design', 'Hiring', 'Technical Architecture'],
        experience_level: '15+',
        availability_text: 'Monthly mentoring sessions focused on technical leadership and scaling engineering teams. Best for CTOs or technical founders.',
        investment_type: null,
        portfolio_size: null,
        portfolio_url: null,
      },
    },
  ];
}

export async function swipe(
  targetId: string,
  direction: 'like' | 'pass'
): Promise<{ ok: boolean; match?: any }> {
  // Handle mock candidates - create real match records for testing
  const mockUserIds = [
    '11111111-1111-1111-1111-111111111111', // Alex Chen - cofounder
    '22222222-2222-2222-2222-222222222222', // Sarah Johnson - cofounder
    '33333333-3333-3333-3333-333333333333', // Marcus Williams - cofounder
    '44444444-4444-4444-4444-444444444444', // Priya Patel - cofounder
    '55555555-5555-5555-5555-555555555555', // David Kim - cofounder
    '66666666-6666-6666-6666-666666666666', // Jennifer Martinez - mentor
    '77777777-7777-7777-7777-777777777777', // Michael Anderson - investor
    '88888888-8888-8888-8888-888888888888', // Rebecca Thompson - investor
    '99999999-9999-9999-9999-999999999999', // Dr. Rajesh Kumar - mentor
  ];
  
  if (mockUserIds.includes(targetId)) {
    console.log(`Mock swipe: ${direction} on ${targetId}`);
    
    // Get current user
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) {
      throw new Error('Not authenticated');
    }
    
    // NOTE: We don't create swipe records for mock candidates so they always come back on refresh
    
    // Simulate a match for testing
    // Priya (44444444-4444-4444-4444-444444444444) and Alex (11111111-1111-1111-1111-111111111111) always match, others have 20% chance
    if (direction === 'like') {
      const shouldMatch = 
        targetId === '44444444-4444-4444-4444-444444444444' || // Priya
        targetId === '11111111-1111-1111-1111-111111111111' || // Alex
        Math.random() < 0.2;
      
      if (shouldMatch) {
        // Check if match already exists to avoid duplicates
        const { data: existingMatch } = await supabase
          .from('matches')
          .select('id')
          .or(`and(user_a.eq.${session.user.id},user_b.eq.${targetId}),and(user_a.eq.${targetId},user_b.eq.${session.user.id})`)
          .maybeSingle();
        
        if (existingMatch) {
          console.log('Match already exists, returning existing match');
          return { ok: true, match: existingMatch };
        }
        
        // Create a real match record in the database
        const { data: match, error } = await supabase
          .from('matches')
          .insert({
            user_a: session.user.id,
            user_b: targetId,
          } as any)
          .select()
          .single();
        
        if (error) {
          console.error('Error creating mock match:', error);
          return { ok: true, match: { id: 'mock-match', created_at: new Date().toISOString() } };
        }
        
        console.log(`🎉 Match created with ${targetId === '44444444-4444-4444-4444-444444444444' ? 'Priya' : targetId === '11111111-1111-1111-1111-111111111111' ? 'Alex' : 'candidate'}!`);
        return { ok: true, match };
      }
    }
    
    return { ok: true };
  }

  if (!SWIPE_FN_URL) {
    throw new Error('SWIPE_FN_URL not configured');
  }

  const session = await supabase.auth.getSession();
  if (!session.data.session?.access_token) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(SWIPE_FN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.data.session.access_token}`,
    },
    body: JSON.stringify({ target_id: targetId, direction }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Network error' }));
    throw new Error(error.error || 'Swipe failed');
  }

  return response.json();
}

// Ensure mock users exist in the database for testing
async function ensureMockUsers() {
  const mockUsers = [
    {
      id: '11111111-1111-1111-1111-111111111111',
      display_name: 'Alex Chen',
      age_band: '23-26',
      timezone: 'America/New_York',
      languages: ['English', 'Mandarin'],
      verification_tier: 0,
    },
    {
      id: '22222222-2222-2222-2222-222222222222',
      display_name: 'Sarah Johnson',
      age_band: '27+',
      timezone: 'America/Los_Angeles',
      languages: ['English'],
      verification_tier: 0,
    },
    {
      id: '33333333-3333-3333-3333-333333333333',
      display_name: 'Marcus Williams',
      age_band: '27+',
      timezone: 'Europe/London',
      languages: ['English', 'Spanish'],
      verification_tier: 0,
    },
    {
      id: '44444444-4444-4444-4444-444444444444',
      display_name: 'Priya Patel',
      age_band: '23-26',
      timezone: 'Asia/Kolkata',
      languages: ['English', 'Hindi'],
      verification_tier: 0,
    },
    {
      id: '55555555-5555-5555-5555-555555555555',
      display_name: 'David Kim',
      age_band: '27+',
      timezone: 'America/Chicago',
      languages: ['English', 'Korean'],
      verification_tier: 0,
    },
  ];

  for (const user of mockUsers) {
    try {
      // Try to insert user (ignore if already exists)
      await supabase.from('users').insert(user as any).select().single();
    } catch (error: any) {
      // Ignore duplicate key errors
      if (!error.message?.includes('duplicate key')) {
        console.error('Error creating mock user:', error);
      }
    }

    // Try to insert profile (ignore if already exists)
    const profile = {
      user_id: user.id,
      headline: user.id === '11111111-1111-1111-1111-111111111111' ? 'AI Engineer looking for cofounder' :
               user.id === '22222222-2222-2222-2222-222222222222' ? 'Product Manager seeking technical cofounder' :
               user.id === '33333333-3333-3333-3333-333333333333' ? 'Full-stack developer ready to build' :
               user.id === '44444444-4444-4444-4444-444444444444' ? 'Designer + Entrepreneur' :
               'Data Scientist turned entrepreneur',
      bio: user.id === '11111111-1111-1111-1111-111111111111' ? 'Passionate about building AI products that solve real problems. 5+ years in ML/AI with experience at top tech companies.' :
           user.id === '22222222-2222-2222-2222-222222222222' ? 'Experienced PM with strong business acumen. Led product at 2 successful startups. Looking to build the next big thing.' :
           user.id === '33333333-3333-3333-3333-333333333333' ? 'Full-stack engineer with expertise in React, Node.js, and cloud infrastructure. Built and scaled multiple web applications.' :
           user.id === '44444444-4444-4444-4444-444444444444' ? 'UI/UX designer with startup experience. Passionate about creating beautiful, functional products that users love.' :
           'PhD in ML, worked at top tech companies. Ready to build something meaningful that makes a real impact.',
      domains: user.id === '11111111-1111-1111-1111-111111111111' ? ['AI/ML', 'SaaS'] :
               user.id === '22222222-2222-2222-2222-222222222222' ? ['SaaS', 'Consumer Apps'] :
               user.id === '33333333-3333-3333-3333-333333333333' ? ['Developer Tools', 'B2B Software'] :
               user.id === '44444444-4444-4444-4444-444444444444' ? ['Consumer Apps', 'Social'] :
               ['AI/ML', 'Healthcare'],
      skills: user.id === '11111111-1111-1111-1111-111111111111' ? ['Engineering', 'Data Science', 'Backend Development'] :
              user.id === '22222222-2222-2222-2222-222222222222' ? ['Product Management', 'Marketing', 'Business Development'] :
              user.id === '33333333-3333-3333-3333-333333333333' ? ['Engineering', 'Frontend Development', 'Backend Development'] :
              user.id === '44444444-4444-4444-4444-444444444444' ? ['Design', 'Product Management', 'Marketing'] :
              ['Data Science', 'Engineering', 'Product Management'],
      stage: user.id === '11111111-1111-1111-1111-111111111111' ? 'prototype' :
             user.id === '22222222-2222-2222-2222-222222222222' ? 'idea' :
             user.id === '33333333-3333-3333-3333-333333333333' ? 'launched' :
             user.id === '44444444-4444-4444-4444-444444444444' ? 'prototype' :
             'idea',
      commitment_hours: user.id === '11111111-1111-1111-1111-111111111111' ? 20 :
                       user.id === '22222222-2222-2222-2222-222222222222' ? 15 :
                       user.id === '33333333-3333-3333-3333-333333333333' ? 25 :
                       user.id === '44444444-4444-4444-4444-444444444444' ? 18 :
                       30,
      visibility: {},
    };

    try {
      await supabase.from('profiles').insert(profile as any).select().single();
    } catch (error: any) {
      // Ignore duplicate key errors
      if (!error.message?.includes('duplicate key')) {
        console.error('Error creating mock profile:', error);
      }
    }
  }
}

