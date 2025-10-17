import { createClient } from '@supabase/supabase-js';

// Test data for candidates
const testCandidates = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    display_name: 'Alex Chen',
    age_band: '23-26' as const,
    timezone: 'America/New_York',
    languages: ['English', 'Mandarin'],
    verification_tier: 0,
    profile: {
      user_id: '11111111-1111-1111-1111-111111111111',
      headline: 'AI Engineer looking for cofounder',
      bio: 'Passionate about building AI products that solve real problems. 5+ years in ML/AI.',
      domains: ['AI/ML', 'SaaS'],
      skills: ['Engineering', 'Data Science', 'Backend Development'],
      stage: 'prototype' as const,
      commitment_hours: 20,
      visibility: {}
    }
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    display_name: 'Sarah Johnson',
    age_band: '27+' as const,
    timezone: 'America/Los_Angeles',
    languages: ['English'],
    verification_tier: 0,
    profile: {
      user_id: '22222222-2222-2222-2222-222222222222',
      headline: 'Product Manager seeking technical cofounder',
      bio: 'Experienced PM with strong business acumen. Looking to build the next big thing.',
      domains: ['SaaS', 'Consumer Apps'],
      skills: ['Product Management', 'Marketing', 'Business Development'],
      stage: 'idea' as const,
      commitment_hours: 15,
      visibility: {}
    }
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    display_name: 'Marcus Williams',
    age_band: '27+' as const,
    timezone: 'Europe/London',
    languages: ['English', 'Spanish'],
    verification_tier: 0,
    profile: {
      user_id: '33333333-3333-3333-3333-333333333333',
      headline: 'Full-stack developer ready to build',
      bio: 'Full-stack engineer with expertise in React, Node.js, and cloud infrastructure.',
      domains: ['Developer Tools', 'B2B Software'],
      skills: ['Engineering', 'Frontend Development', 'Backend Development'],
      stage: 'launched' as const,
      commitment_hours: 25,
      visibility: {}
    }
  },
  {
    id: '44444444-4444-4444-4444-444444444444',
    display_name: 'Priya Patel',
    age_band: '23-26' as const,
    timezone: 'Asia/Kolkata',
    languages: ['English', 'Hindi'],
    verification_tier: 0,
    profile: {
      user_id: '44444444-4444-4444-4444-444444444444',
      headline: 'Designer + Entrepreneur',
      bio: 'UI/UX designer with startup experience. Passionate about creating beautiful, functional products.',
      domains: ['Consumer Apps', 'Social'],
      skills: ['Design', 'Product Management', 'Marketing'],
      stage: 'prototype' as const,
      commitment_hours: 18,
      visibility: {}
    }
  },
  {
    id: '55555555-5555-5555-5555-555555555555',
    display_name: 'David Kim',
    age_band: '27+' as const,
    timezone: 'America/Chicago',
    languages: ['English', 'Korean'],
    verification_tier: 0,
    profile: {
      user_id: '55555555-5555-5555-5555-555555555555',
      headline: 'Data Scientist turned entrepreneur',
      bio: 'PhD in ML, worked at top tech companies. Ready to build something meaningful.',
      domains: ['AI/ML', 'Healthcare'],
      skills: ['Data Science', 'Engineering', 'Product Management'],
      stage: 'idea' as const,
      commitment_hours: 30,
      visibility: {}
    }
  }
];

async function addTestData() {
  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://lsdqxqdroftatikepbba.supabase.co';
  const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzZHF4cWRyb2Z0YXRpa2VwYmJhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzOTE2MDMsImV4cCI6MjA3NDk2NzYwM30.7OR8J_CB14wr5zBm-oLERwOmpyyIqI_a2tnifdI7yO0';
  
  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log('Adding test candidates...');

  for (const candidate of testCandidates) {
    try {
      // Insert user
      const { error: userError } = await supabase
        .from('users')
        .insert({
          id: candidate.id,
          display_name: candidate.display_name,
          age_band: candidate.age_band,
          timezone: candidate.timezone,
          languages: candidate.languages,
          verification_tier: candidate.verification_tier
        });

      if (userError && !userError.message.includes('duplicate key')) {
        console.error(`Error inserting user ${candidate.display_name}:`, userError);
        continue;
      }

      // Insert profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert(candidate.profile);

      if (profileError && !profileError.message.includes('duplicate key')) {
        console.error(`Error inserting profile for ${candidate.display_name}:`, profileError);
        continue;
      }

      console.log(`✅ Added ${candidate.display_name}`);
    } catch (error) {
      console.error(`Error with ${candidate.display_name}:`, error);
    }
  }

  console.log('Test data addition complete!');
}

// Run the script
addTestData().catch(console.error);
