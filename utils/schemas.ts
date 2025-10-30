import { z } from 'zod';

// Onboarding Step 1: User Info
export const userInfoSchema = z.object({
  display_name: z.string().min(2, 'Name must be at least 2 characters').max(50),
  age: z.number().min(0, 'Age must be at least 0').max(100, 'Age must be at most 100'),
  timezone: z.string().min(1, 'Timezone is required'),
  languages: z.array(z.string()).min(1, 'Select at least one language'),
});

export type UserInfoForm = z.infer<typeof userInfoSchema>;

// Onboarding Step 2: Profile
export const profileSchema = z.object({
  headline: z.string().max(2500, 'Business description too long').optional(),
  bio: z.string().max(500, 'Bio must be under 500 characters').optional(),
  business_domains: z.array(z.string()).optional(),
  domains: z.array(z.string()).min(1, 'Select at least one domain'),
  skills: z.array(z.string()).min(1, 'Select at least one skill'),
  stage: z.enum(['idea', 'prototype', 'launched']).optional(),
  commitment_hours: z.number().min(1).max(168),
  availability_text: z.string().max(200, 'Availability text too long').optional(),
});

export type ProfileForm = z.infer<typeof profileSchema>;

// Onboarding Step 3: Intent
export const intentSchema = z.object({
  seeking: z.enum(['founder', 'cofounder', 'teammate', 'mentor', 'investor']),
  availability_text: z.string().max(200).optional(),
});

export type IntentForm = z.infer<typeof intentSchema>;

// Onboarding Step 4: Mentor/Investor Expertise
export const expertiseSchema = z.object({
  seeking: z.enum(['founder', 'cofounder', 'teammate', 'mentor', 'investor']),
  availability_text: z.string().max(200).optional(),
  expertise_areas: z.array(z.string()).min(1, 'Select at least one expertise area'),
});

export type ExpertiseForm = z.infer<typeof expertiseSchema>;

// Report schema
export const reportSchema = z.object({
  reason: z.string().min(1, 'Reason is required'),
  details: z.string().max(500).optional(),
});

export type ReportForm = z.infer<typeof reportSchema>;

