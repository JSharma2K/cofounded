# Cofounded - Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────┐
│          React Native App               │
│  (Expo + TypeScript + React Query)      │
└────────────┬────────────────────────────┘
             │
             │ HTTPS / WebSocket
             ▼
┌─────────────────────────────────────────┐
│           Supabase Backend              │
├─────────────────────────────────────────┤
│ • PostgreSQL Database (RLS enabled)     │
│ • Auth (Magic Link)                     │
│ • Realtime (WebSocket subscriptions)    │
│ • Storage (Avatar & attachments)        │
│ • Edge Functions (Deno)                 │
└─────────────────────────────────────────┘
```

## Data Flow

### 1. Authentication Flow
```
User enters email → Supabase Auth sends magic link
→ User clicks link → App receives session
→ AuthGuard checks onboarding → Redirect to tabs or onboarding
```

### 2. Candidate Discovery Flow
```
User opens Feed → Call get_candidates() RPC
→ Filter by domain overlap & not-yet-swiped
→ Display candidate cards → User swipes
```

### 3. Swipe & Match Flow
```
User swipes → Call Edge Function /swipe
→ Insert into swipes table → Trigger checks for mutual like
→ If mutual: insert into matches → Return match to client
→ Show "It's a match!" toast
```

### 4. Chat Flow
```
User opens chat → Load message history
→ Subscribe to realtime changes (match_id filter)
→ User sends message → Insert into messages
→ Realtime triggers → Other user receives instantly
```

## Database Schema (Simplified)

```
auth.users (Supabase managed)
  └─> public.users (1:1, cascade)
       ├─> public.profiles (1:1)
       ├─> public.intents (1:1)
       ├─> public.swipes (1:many, as swiper)
       ├─> public.matches (many:many via user_a/user_b)
       └─> public.messages (many via sender_id)
```

## Security Model

### Row Level Security Policies

**users**: Users can only read/write their own record
**profiles**: Public read, owner write
**intents**: Owner full access
**swipes**: Owner can insert/read own swipes only
**matches**: Members can read matches they're part of
**messages**: Match members can read/write
**verifications**: Owner full access
**reports**: Reporter can create/read own reports

### Edge Functions Security
- All requests require valid JWT (Authorization: Bearer <token>)
- User ID extracted from JWT, never from request body
- Idempotent operations (duplicate swipes ignored)

## Component Hierarchy

```
App
├── AuthGuard (checks session)
│   ├── (auth)/signin
│   ├── (onboarding)/
│   │   ├── step-1 (User Info)
│   │   ├── step-2 (Profile)
│   │   └── step-3 (Intent)
│   └── (tabs)/
│       ├── feed (Candidate swiping)
│       ├── matches (Match list)
│       ├── chat/[matchId] (Realtime chat)
│       └── profile (User profile & settings)
```

## API Layer Structure

```
lib/api/
├── auth.ts         → signIn, signOut, checkOnboarding
├── onboarding.ts   → updateUserInfo, upsertProfile, upsertIntent
├── candidates.ts   → getCandidates, swipe
├── matches.ts      → getMatches, getOtherUser
├── messages.ts     → getMessages, sendMessage, subscribeToMessages
├── profile.ts      → getCurrentUserProfile, uploadAvatar
└── reports.ts      → submitReport
```

## State Management

- **React Query**: Server state (candidates, matches, messages)
- **Local State**: UI state (loading, errors, forms)
- **Session Hook**: Auth state (useSession)
- **Realtime**: WebSocket subscriptions (Supabase Realtime)

## Performance Optimizations

1. **Candidate Feed**: Only loads 50 at a time
2. **Optimistic Updates**: Remove card before server response
3. **Lazy Loading**: Messages loaded on-demand
4. **Image Optimization**: Avatars compressed to 0.8 quality
5. **RPC Functions**: Heavy filtering done in database

## Error Handling

- All API calls wrapped in try/catch
- User-friendly error messages
- Graceful degradation (empty states)
- Network error retry logic via React Query

## Realtime Architecture

```
Client subscribes to channel 'room-{match_id}'
→ Listens for INSERT on messages table
→ Filter: match_id=eq.{match_id}
→ On new message: update local state
→ Auto-scrolls to bottom
```

## Storage Architecture

**Buckets:**
- `pf-avatars`: Public read, owner write (profile pictures)
- `pf-attachments`: Private, owner access (documents)

**Path structure:**
- Avatars: `{user_id}/avatar.jpg`
- Attachments: `{user_id}/{filename}`

## Edge Functions

### POST /functions/v1/swipe
**Input:**
```json
{
  "target_id": "uuid",
  "direction": "like" | "pass"
}
```

**Output:**
```json
{
  "ok": true,
  "match": { /* match object if mutual like */ }
}
```

**Logic:**
1. Extract user from JWT
2. Insert swipe (idempotent via unique constraint)
3. Trigger auto-checks for mutual like
4. Query and return match if exists

## Scalability Considerations

1. **Database Indexes**: GIN on arrays, B-tree on foreign keys
2. **RLS**: Efficient policies using indexes
3. **Pagination**: Limit queries to prevent large scans
4. **Caching**: React Query caches API responses
5. **CDN**: Supabase Storage uses CDN for avatars

## Testing Strategy

### Unit Tests (Future)
- Utility functions (formatters, validators)
- Zod schemas
- API wrappers (mock Supabase)

### Integration Tests (Future)
- Auth flow
- Onboarding completion
- Swipe → Match flow
- Message sending

### Manual Testing Checklist
- [ ] Sign in with magic link
- [ ] Complete onboarding saves data
- [ ] Feed shows candidates with matching domains
- [ ] Swipe removes card
- [ ] Mutual like creates match
- [ ] Match appears in matches tab
- [ ] Chat loads and sends messages
- [ ] Realtime messages appear instantly
- [ ] Avatar upload works
- [ ] Sign out clears session
- [ ] RLS prevents unauthorized access

## Deployment Checklist

- [ ] Set production Supabase URL & keys
- [ ] Deploy Edge Functions to production
- [ ] Enable RLS on all tables in production
- [ ] Create storage buckets in production
- [ ] Test magic link emails in production
- [ ] Configure custom domain (optional)
- [ ] Set up analytics (PostHog/Amplitude)
- [ ] Enable Sentry error tracking
- [ ] Build iOS/Android with EAS
- [ ] Submit to App Store / Play Store

## Future Enhancements

1. **Search & Filters**: Filter by stage, commitment, location
2. **Verification**: LinkedIn, GitHub integration
3. **Push Notifications**: Match/message alerts
4. **Video Calls**: In-app video meetings
5. **Team Formation**: Multi-person teams
6. **Project Showcase**: Link to GitHub/portfolio
7. **Analytics**: Track engagement metrics
8. **Admin Panel**: Moderation dashboard
9. **Premium Features**: Verified badge, advanced filters
10. **Recommendations**: ML-based matching algorithm

