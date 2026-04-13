import type { Config } from 'tailwindcss'

export default <Partial<Config>>{
  content: [
    './components/**/*.{vue,js,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './app.vue',
    './plugins/**/*.{js,ts}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Fraunces', 'ui-serif', 'Georgia', 'serif'],
        sans: ['"Inter Tight"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        paper: 'var(--paper)',
        ink: 'var(--ink)',
        mute: 'var(--mute)',
        rule: 'var(--rule)',
        accent: 'var(--accent)',
      },
      letterSpacing: {
        kicker: '0.18em',
      },
    },
  },
  plugins: [],
}
