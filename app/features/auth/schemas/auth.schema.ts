import { z } from 'zod'
import type { HandlersSignupRequest } from '~/services'

export const loginSchema = z.object({
  email: z.email('Please enter a valid email address'),
  password: z.string().min(1, 'Please enter your password'),
})
export type LoginSchema = z.output<typeof loginSchema>

export const signupSchema = z.object({
  first_name: z.string().min(1, 'Required'),
  last_name: z.string().min(1, 'Required'),
  email: z.email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  specialty: z.string().refine(
    (v): v is HandlersSignupRequest['specialty'] => (SPECIALTIES as readonly string[]).includes(v),
    { message: 'Please select a coaching type' }
  ),
  terms: z.boolean().refine(v => v === true, { message: 'You must agree to continue' }),
})
export type SignupSchema = z.output<typeof signupSchema>