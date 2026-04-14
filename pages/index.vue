<script setup lang="ts">
import { onMounted } from 'vue'

definePageMeta({ layout: false })

const config = useRuntimeConfig()
const mockMode = String(config.public.mockMode ?? '').toLowerCase()
const isMock = mockMode === '1' || mockMode === 'true' || mockMode === 'yes'

onMounted(() => {
  if (isMock) navigateTo('/dashboard')
})

function signInWithGoogle() {
  window.location.href = '/api/auth/google'
}
</script>

<template>
  <main class="min-h-screen grid place-items-center px-6">
    <div
      v-if="!isMock"
      class="w-full max-w-sm border-y border-rule py-12"
    >
      <div class="text-center">
        <div class="kicker">Welcome</div>
        <h1 class="font-display text-5xl leading-none mt-2">The Daily</h1>
        <p class="text-mute italic mt-3">Sign in to access your calendar.</p>
      </div>

      <button
        type="button"
        class="mt-10 w-full py-3 border border-ink font-display text-lg tracking-wide hover:bg-ink hover:text-paper transition flex items-center justify-center gap-3"
        @click="signInWithGoogle"
      >
        <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 001 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
        Sign in with Google
      </button>
    </div>

    <p v-else class="text-mute italic">Mock mode active — redirecting…</p>
  </main>
</template>
