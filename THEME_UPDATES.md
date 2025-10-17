# Theme Updates Summary

This document outlines the dark theme styling applied to all screens in the Cofounded app.

## ✅ Completed Updates

### 1. Core Theme System
- ✅ Created `/utils/theme.ts` with comprehensive design tokens
- ✅ Created `/utils/commonStyles.ts` with reusable styled components
- ✅ Updated `app/_layout.tsx` with dark theme provider
- ✅ Updated `app/(auth)/signin.tsx` with dark theme

### 2. Onboarding Screens
- ✅ Updated `app/(onboarding)/step-1.tsx` - Dark theme applied
- ⚠️ `app/(onboarding)/step-2.tsx` - Styles updated, needs JSX component updates
- 🔄 `app/(onboarding)/step-3.tsx` - Pending full update

## 🎨 Theme Color Palette

```
Primary: #E89B8E (Coral/salmon pink)
Background: #1A1D23 (Dark background)
Surface: #252930 (Card/input background)
Accent: #5B6CC6 (Purple button)
Text: #FFFFFF (Primary text)
Text Secondary: #B4B8C1 (Secondary text)
Border: #3A3F49 (Borders)
Success: #4CAF50
Error: #F44336
```

## 📋 Remaining Updates Needed

### Step 2 & 3 JSX Updates
Replace React Native Paper components with custom themed components:

**TextInput → RNTextInput:**
```tsx
// Before
<TextInput
  label="Headline"
  mode="outlined"
  ...
/>

// After
<RNTextInput
  placeholder="Headline"
  placeholderTextColor={colors.textTertiary}
  style={styles.input}
  ...
/>
```

**Chip → TouchableOpacity:**
```tsx
// Before
<Chip
  selected={value.includes(domain)}
  onPress={...}
>
  {domain}
</Chip>

// After
<TouchableOpacity
  style={[styles.chip, value.includes(domain) && styles.chipSelected]}
  onPress={...}
>
  <Text style={[styles.chipText, value.includes(domain) && styles.chipTextSelected]}>
    {domain}
  </Text>
</TouchableOpacity>
```

**Button → TouchableOpacity:**
```tsx
// Before
<Button
  mode="contained"
  onPress={handleSubmit(onSubmit)}
>
  Continue
</Button>

// After
<TouchableOpacity
  style={[styles.button, loading && styles.buttonDisabled]}
  onPress={handleSubmit(onSubmit)}
  disabled={loading}
>
  <Text style={styles.buttonText}>
    {loading ? 'Saving...' : 'Continue'}
  </Text>
</TouchableOpacity>
```

### Tab Screens Need Full Updates

All tab screens need similar treatment:

1. **feed.tsx** - Update backgrounds, cards, buttons
2. **matches.tsx** - Update list items, empty states
3. **profile.tsx** - Update avatar section, list items
4. **chat/[matchId].tsx** - Update message bubbles, composer

## 🔧 Quick Style Reference

### Common Patterns

**Container:**
```tsx
container: {
  flex: 1,
  backgroundColor: colors.background,
}
```

**Input:**
```tsx
input: {
  backgroundColor: colors.surface,
  borderRadius: borderRadius.md,
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.md,
  fontSize: typography.fontSizes.base,
  color: colors.text,
  borderWidth: 1,
  borderColor: colors.border,
}
```

**Button:**
```tsx
button: {
  backgroundColor: colors.accent,
  borderRadius: borderRadius.md,
  paddingVertical: spacing.md + 2,
  alignItems: 'center',
}
```

**Text:**
```tsx
heading: {
  fontSize: typography.fontSizes.xxl,
  fontFamily: typography.fontFamilies.bold,
  color: colors.text,
}
```

## 🚀 Next Steps

1. Complete JSX updates for step-2.tsx and step-3.tsx
2. Update all tab screens (feed, matches, profile, chat)
3. Update shared components (CandidateCard, MatchListItem, MessageBubble)
4. Test on both iOS and Android
5. Verify all interactive states (pressed, disabled, etc.)

