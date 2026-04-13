<script setup lang="ts">
import { computed } from 'vue'

definePageMeta({ layout: false })

const route = useRoute()

const secret = computed(() => (typeof route.query.secret === 'string' ? route.query.secret : ''))
const connected = computed(() => route.query.connected === '1')

// Fetch server-side so the secret never needs to round-trip the browser JS layer.
const { data } = await useFetch<{ ok: boolean; hasToken: boolean; updatedAt?: string }>(
  '/api/setup/status',
  {
    query: { secret },
    server: true,
  },
)

const startHref = computed(() => `/setup/start?secret=${encodeURIComponent(secret.value)}`)
</script>

<template>
  <main class="min-h-screen max-w-2xl mx-auto px-8 py-16">
    <div class="kicker">Administration</div>
    <h1 class="font-display text-5xl leading-none mt-2">Calendar Setup</h1>
    <div class="hairline my-6" />

    <template v-if="!data?.ok">
      <p class="text-accent italic">This page requires a valid <code>?secret=</code> query parameter.</p>
    </template>

    <template v-else>
      <p v-if="connected" class="text-ink italic">
        &#10003; Google Calendar connected successfully.
      </p>

      <div class="mt-6">
        <div class="kicker">Status</div>
        <p class="font-display text-2xl mt-1">
          {{ data.hasToken ? 'Connected' : 'Not connected' }}
        </p>
        <p v-if="data.hasToken && data.updatedAt" class="text-mute text-sm">
          Token stored {{ new Date(data.updatedAt).toLocaleString() }}
        </p>
      </div>

      <a
        :href="startHref"
        class="inline-block mt-10 px-6 py-3 border border-ink font-display text-lg hover:bg-ink hover:text-paper transition"
      >
        {{ data.hasToken ? 'Re-connect Google Calendar' : 'Connect Google Calendar' }}
      </a>

      <div class="mt-10 text-sm text-mute italic">
        Re-running this flow overwrites the stored refresh token. Use it if the dashboard stops
        receiving calendar data or if you revoked access in your Google Account.
      </div>
    </template>
  </main>
</template>
