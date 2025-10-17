# Quick Setup Guide

## 1. Install Dependencies

```bash
npm install
```

## 2. Configure Environment Variables

Create a `.env` file:

```env
EXPO_PUBLIC_SUPABASE_URL=https://lsdqxqdroftatikepbba.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
EXPO_PUBLIC_SWIPE_FN_URL=https://lsdqxqdroftatikepbba.supabase.co/functions/v1/swipe
```

Get your keys from:
- Supabase Dashboard → Settings → API → Project URL & anon/public key

## 3. Verify Supabase Setup

Make sure these are complete in your Supabase project:

### ✅ Database Tables Created
- users, profiles, intents, swipes, matches, messages, verifications, reports, feature_flags

### ✅ RLS Policies Enabled
All tables should have RLS enabled with appropriate policies

### ✅ RPC Function Created
- `get_candidates(limit_count)` function exists

### ✅ Edge Functions Deployed
```bash
cd supabase/functions
supabase functions deploy swipe
supabase functions deploy notify
```

### ✅ Storage Buckets Created
- `pf-avatars` (public)
- `pf-attachments` (private)

## 4. Start Development Server

```bash
npx expo start
```

Then:
- Press `i` for iOS simulator
- Press `a` for Android emulator
- Scan QR code with Expo Go app on physical device

## 5. Test the App

### Create Test Users
1. Sign in with email (use + trick: yourname+test1@gmail.com)
2. Complete onboarding with matching domains
3. Create second user with overlapping domains
4. Swipe on each other to create a match
5. Test realtime chat

### Example Test Scenario
**User 1:**
- Name: Alice
- Domains: ['AI/ML', 'SaaS']
- Seeking: Cofounder

**User 2:**
- Name: Bob  
- Domains: ['SaaS', 'Fintech']
- Seeking: Cofounder

Both will see each other in feed (SaaS overlap)!

## Troubleshooting

### "Cannot connect to Supabase"
- Check `.env` file exists and has correct values
- Verify Supabase project is active
- Check internet connection

### "No candidates in feed"
- Make sure you have other users with matching domains
- Check `get_candidates` RPC function exists
- Verify RLS policies allow reading profiles

### "Chat messages not appearing"
- Check Realtime is enabled in Supabase
- Verify messages table RLS policies
- Check match_id is correct

### "Avatar upload fails"
- Check `pf-avatars` bucket exists and is public
- Verify storage RLS policies allow user uploads
- Check file permissions on device

## Next Steps

1. Customize UI theme in `app/_layout.tsx`
2. Add more onboarding validations
3. Implement search/filters
4. Add push notifications
5. Deploy to TestFlight/Play Store

## Support

- Supabase Docs: https://supabase.com/docs
- Expo Docs: https://docs.expo.dev
- React Native Paper: https://reactnativepaper.com

