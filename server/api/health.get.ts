export default defineEventHandler(() => {
  return {
    ok: true,
    service: 'personal-dashboard',
    time: new Date().toISOString(),
  }
})
