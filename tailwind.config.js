module.exports = {
  mode: 'jit',
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      transitionDuration: {
        DEFAULT: '150ms',
      },
      aspectRatio: {
        '5/1': '5 / 1',
      },
      height: {
        small: '45px',
        medium: '54px',
        large: '72px',
      },
    },
  },
  plugins: [],
}
