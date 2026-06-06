import {
  getApiV1Integrations,
  postApiV1IntegrationsGoogleStart,
  deleteApiV1IntegrationsGoogle,
} from '~/services/sdk.gen'

/*
 * useIntegrationsApi — thin wrapper over the generated SDK for the
 * coach-integrations endpoints. Stage 1 covers Google Calendar; the
 * shape is provider-agnostic so future additions slot in.
 *
 * Lives in app/composables/ (global, Nuxt-auto-imported) because both
 * Settings → Integrations and Onboarding Step 4 consume it. Not feature-
 * scoped — moving it under any single feature would mis-imply ownership.
 *
 * Connect flow:
 *   1. startGoogle() — POST with Bearer, get back the Google consent URL
 *      + state/coach binding cookies set on the backend origin
 *   2. window.location.href = res.authorize_url  — browser navigates,
 *      Google redirects back to /integrations/google/callback (public),
 *      cookies prove the coach identity, tokens get persisted
 *   3. Backend 302s back to {frontend}/settings?connected=google_calendar
 */
export function useIntegrationsApi() {
  const list = () => getApiV1Integrations()

  const startGoogle = () =>
    postApiV1IntegrationsGoogleStart({
      credentials: 'include', // ensures Set-Cookie from start round-trips on the callback
    })

  const disconnectGoogle = () =>
    deleteApiV1IntegrationsGoogle({
      credentials: 'include',
    })

  return { list, startGoogle, disconnectGoogle }
}
