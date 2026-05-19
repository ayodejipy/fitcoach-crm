<script setup lang="ts">
import { useAuthStore } from '~/features/auth/stores/useAuthStore'

const auth = useAuthStore()
await navigateTo(auth.isAuthenticated ? '/dashboard' : '/auth', { replace: true })
</script>
