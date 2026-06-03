import { z } from 'zod'

export const loginSchema = z.object({
  email: z.email('Please enter a valid email address'),
  password: z.string().min(1, 'Please enter your password'),
})
export type LoginSchema = z.output<typeof loginSchema>

// Specialty is collected during onboarding Step 1 (not at signup) — locked
// design decision. Backend currently requires specialty at signup, so the
// signup form sends a default value and the user picks the real one later.
export const signupSchema = z.object({
  first_name: z.string().min(1, 'Required'),
  last_name: z.string().min(1, 'Required'),
  email: z.email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  terms: z.boolean().refine(v => v === true, { message: 'You must agree to continue' }),
})
export type SignupSchema = z.output<typeof signupSchema>