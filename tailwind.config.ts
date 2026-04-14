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
        surface: 'var(--surface)',
        'surface-soft': 'var(--surface-soft)',
        'surface-raised': 'var(--surface-raised)',
        ink: 'var(--ink)',
        'ink-soft': 'var(--ink-soft)',
        mute: 'var(--mute)',
        rule: 'var(--rule)',
        'rule-strong': 'var(--rule-strong)',
        accent: 'var(--accent)',
        'accent-soft': 'var(--accent-soft)',
        bull: 'var(--bull)',
        bear: 'var(--bear)',
        warn: 'var(--warn)',
        info: 'var(--info)',
      },
      letterSpacing: {
        kicker: '0.18em',
      },
    },
  },
  plugins: [],
}
