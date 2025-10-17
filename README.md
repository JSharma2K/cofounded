# Cofounded - Cofounder Matching App

A production-quality React Native (Expo) app for connecting founders, teammates, and mentors. Built with TypeScript, Supabase, and React Query.

## Features

- 🔐 **Magic Link Authentication** - Passwordless email sign-in
- 📝 **Multi-Step Onboarding** - Collect user info, profile, and intent
- 🎯 **Smart Candidate Feed** - Swipe through potential cofounders with domain matching
- 💕 **Match Detection** - Automatic mutual matching via Supabase Edge Functions
- 💬 **Realtime Chat** - Live messaging with Supabase Realtime
- 👤 **Profile Management** - Edit profile and upload avatars
- 🛡️ **Row Level Security** - All queries protected by Supabase RLS

## Tech Stack

- **Frontend**: React Native (Expo SDK 51+), TypeScript
- **Backend**: Supabase (Postgres + Auth + Realtime + Storage + Edge Functions)
- **State Management**: React Query
- **Forms**: React Hook Form + Zod
- **UI**: React Native Paper

## Setup

### Prerequisites

- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)
- Supabase account with project set up

### Installation

1. **Clone and install dependencies:**

```bash
cd cofounded
npm install
```

2. **Configure environment variables:**

Create a `.env` file in the root directory:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
EXPO_PUBLIC_SWIPE_FN_URL=https://your-project.supabase.co/functions/v1/swipe
```

3. **Set up Supabase:**

Run the SQL migrations in your Supabase SQL editor:
- Create tables (users, profiles, intents, swipes, matches, messages, etc.)
- Enable RLS and create policies
- Create the `get_candidates` RPC function
- Deploy Edge Functions (`swipe`, `notify`)
- Create storage buckets (`pf-avatars`, `pf-attachments`)

4. **Start the development server:**

```bash
npx expo start
```

Press `i` for iOS simulator, `a` for Android emulator, or scan QR code with Expo Go.

## Project Structure

```
cofounded/
├── app/
│   ├── (auth)/          # Authentication screens
│   ├── (onboarding)/    # Onboarding wizard
│   ├── (tabs)/          # Main app tabs
│   └── _layout.tsx      # Root layout with auth guard
├── lib/
│   ├── api/             # API wrappers
│   ├── hooks/           # Custom React hooks
│   ├── supabase.ts      # Supabase client
│   └── types.ts         # TypeScript types
├── components/          # Reusable UI components
├── utils/               # Utilities and schemas
└── supabase/
    └── functions/       # Edge Functions
```

## Key Features Explained

### Authentication Flow
1. User enters email on sign-in screen
2. Supabase sends magic link via email
3. User clicks link → auto-logged in
4. Auth guard checks onboarding status
5. Redirects to onboarding or main tabs

### Candidate Recommendation
- Calls `get_candidates` RPC function
- Filters by domain overlap (configurable)
- Excludes already-swiped users
- Returns 50 candidates at a time

### Swipe & Match
- Like/Pass actions call Edge Function
- Edge Function inserts into `swipes` table
- Trigger checks for mutual likes
- Auto-creates `match` record if mutual
- Returns match data to client

### Realtime Chat
- Subscribes to Postgres changes on `messages` table
- Filters by `match_id`
- Real-time message delivery across devices
- Offline-friendly (messages queued)

## Testing

### Acceptance Criteria
- ✅ Sign-in with magic link works
- ✅ Onboarding saves data correctly
- ✅ Feed loads candidates (requires matching domains)
- ✅ Like creates swipe record
- ✅ Mutual like creates match
- ✅ Chat loads history and receives realtime messages
- ✅ RLS prevents unauthorized access
- ✅ Reports can be filed

### Test Users
Create test users with overlapping domains to see matches work.

## Deployment

### Expo Build

```bash
# iOS
eas build --platform ios

# Android
eas build --platform android
```

### Environment Variables
Make sure to set production Supabase URLs in EAS secrets.

## Security Notes

- **Never expose service_role key** - Only use anon key in client
- **RLS is critical** - All tables have RLS policies
- **Edge Functions** - Use for sensitive operations (swipes)
- **Avatar uploads** - Public bucket for avatars, private for attachments

## Support

For issues or questions:
- Check Supabase docs: https://supabase.com/docs
- Expo docs: https://docs.expo.dev
- Open an issue on GitHub

## License

MIT

