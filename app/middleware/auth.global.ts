import { useAuthStore } from '~/features/auth/stores/useAuthStore'
import { getApiV1Me } from '~/services/sdk.gen'

export default defineNuxtRouteMiddleware(async (to) => {
  const authStore = useAuthStore()

  // 1. Check if route is public or explicitly marked as public (auth: false)
  const isPublicRoute = to.meta.auth === false || to.path.startsWith('/auth')

  // 2. Unauthenticated flow
  if (!authStore.isAuthenticated) {
    if (!isPublicRoute) {
      return navigateTo('/auth')
    }
    return
  }

  // 3. Authenticated flow - Ensure coach profile is loaded
  if (authStore.isAuthenticated && !authStore.coach) {
    try {
      const response = await getApiV1Me()
      authStore.coach = response?.data || null
    } catch (err) {
      console.error('[Middleware] Failed to fetch coach profile:', err)
      // Clear invalid credentials and send to sign in
      authStore.clearAuth()
      if (!isPublicRoute) {
        return navigateTo('/auth')
      }
      return
    }
  }

  // 4. Authenticated flow routing
  if (authStore.isAuthenticated && authStore.coach) {
    const coach = authStore.coach
    const isOnboardingDone = coach.onboarding_done
    const onboardingStep = coach.onboarding_step ?? 1

    // A. Onboarding in progress: Force redirect to their exact current onboarding step
    if (!isOnboardingDone) {
      if (to.path !== '/onboarding') {
        return navigateTo(`/onboarding?step=${onboardingStep}`)
      }
      // If already on /onboarding page, ensure the step query parameter is correct
      const targetStep = parseInt(to.query.step as string)
      if (isNaN(targetStep) || targetStep !== onboardingStep) {
        return navigateTo(`/onboarding?step=${onboardingStep}`, { replace: true })
      }
      return
    }

    // B. Onboarding complete: Prevent accessing /onboarding or /auth pages
    if (isOnboardingDone) {
      if (to.path === '/onboarding' || to.path.startsWith('/auth')) {
        return navigateTo('/dashboard')
      }
    }
  }
})
