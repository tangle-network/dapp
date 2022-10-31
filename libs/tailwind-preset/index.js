const colors = {
  mono: {
    0: '#fff',
    20: '#F7F8F7',
    40: '#E2E5EB',
    60: '#D3D8E2',
    80: '#C2C8D4',
    100: '#9CA0B0',
    120: '#6C7180',
    140: '#4E5463',
    160: '#3A3E53',
    170: '#2E3244',
    180: '#2B2F40',
    190: '#252836',
    200: '#1F1D2B',
  },
  purple: {
    0: '#F6F4FF',
    10: '#F6F4FF',
    20: '#D5CDFF',
    30: '#E7E2FF',
    40: '#B5A9F2',
    50: '#C6BBFA',
    60: '#9F90EA',
    70: '#624FBE',
    80: '#7968D0',
    90: '#624FBE',
    100: '#4B3AA4',
    110: '#37268D',
    120: '#2E284D',
    DEFAULT: '#9F90EA',
  },
  blue: {
    0: '#ECF4FF',
    10: '#D5E6FF',
    20: '#B8D6FF',
    30: '#9BC5FC',
    40: '#81B3F7',
    50: '#67A0EE',
    60: '#4e8cdf',
    70: '#3D7BCE',
    80: '#2864B5',
    90: '#1C529A',
    100: '#0F4285',
    110: '#153A69',
    120: '#252D39',
    DEFAULT: '#4e8cdf',
  },
  green: {
    0: '#E5FFE7',
    10: '#C7FFCC',
    20: '#ACF1B3',
    30: '#85DC8E',
    40: '#6CCA76',
    50: '#4CB457',
    60: '#3B9E46',
    70: '#288E32',
    80: '#038311',
    90: '#00710C',
    100: '#01550A',
    110: '#0F4214',
    120: '#0F3413',
    DEFAULT: '#038311',
  },
  yellow: {
    0: '#FFF5D8',
    10: '#FFF2CA',
    20: '#FFEAA6',
    30: '#FFE07C',
    40: '#F8D567',
    50: '#F9CE46',
    60: '#F4C328',
    70: '#F4C328',
    80: '#D2A618',
    90: '#AF8C1E',
    100: '#8D721A',
    110: '#634F11',
    120: '#3F3517',
    DEFAULT: '#F4C328',
  },
  red: {
    0: '#FFEDE4',
    10: '#FFCEB7',
    20: '#FFB18B',
    30: '#FF874D',
    40: '#FC6015',
    50: '#EF570D',
    60: '#DD4800',
    70: '#C64A17',
    80: '#B6400F',
    90: '#A0370B',
    100: '#892F0A',
    110: '#622910',
    120: '#422417',
    DEFAULT: '#DD4800',
  },
};

const keyframes = {
  // Dropdown menu
  'scale-in': {
    '0%': { opacity: '0', transform: 'scale(0)' },
    '100%': { opacity: '1', transform: 'scale(1)' },
  },
  'slide-down': {
    '0%': { opacity: '0', transform: 'translateY(-10px)' },
    '100%': { opacity: '1', transform: 'translateY(0)' },
  },
  'slide-up': {
    '0%': { opacity: '0', transform: 'translateY(10px)' },
    '100%': { opacity: '1', transform: 'translateY(0)' },
  },
  // Tooltip
  'slide-up-fade': {
    '0%': { opacity: '0', transform: 'translateY(2px)' },
    '100%': { opacity: '1', transform: 'translateY(0)' },
  },
  'slide-right-fade': {
    '0%': { opacity: '0', transform: 'translateX(-2px)' },
    '100%': { opacity: '1', transform: 'translateX(0)' },
  },
  'slide-down-fade': {
    '0%': { opacity: '0', transform: 'translateY(-2px)' },
    '100%': { opacity: '1', transform: 'translateY(0)' },
  },
  'slide-left-fade': {
    '0%': { opacity: '0', transform: 'translateX(2px)' },
    '100%': { opacity: '1', transform: 'translateX(0)' },
  },
  // Navigation menu
  'enter-from-right': {
    '0%': { transform: 'translateX(200px)', opacity: '0' },
    '100%': { transform: 'translateX(0)', opacity: '1' },
  },
  'enter-from-left': {
    '0%': { transform: 'translateX(-200px)', opacity: '0' },
    '100%': { transform: 'translateX(0)', opacity: '1' },
  },
  'exit-to-right': {
    '0%': { transform: 'translateX(0)', opacity: '1' },
    '100%': { transform: 'translateX(200px)', opacity: '0' },
  },
  'exit-to-left': {
    '0%': { transform: 'translateX(0)', opacity: '1' },
    '100%': { transform: 'translateX(-200px)', opacity: '0' },
  },
  'scale-in-content': {
    '0%': { transform: 'rotateX(-30deg) scale(0.9)', opacity: '0' },
    '100%': { transform: 'rotateX(0deg) scale(1)', opacity: '1' },
  },
  'scale-out-content': {
    '0%': { transform: 'rotateX(0deg) scale(1)', opacity: '1' },
    '100%': { transform: 'rotateX(-10deg) scale(0.95)', opacity: '0' },
  },
  'fade-in': {
    '0%': { opacity: '0' },
    '100%': { opacity: '1' },
  },
  'fade-out': {
    '0%': { opacity: '1' },
    '100%': { opacity: '0' },
  },
  // Toast
  'toast-hide': {
    '0%': { opacity: '1' },
    '100%': { opacity: '0' },
  },
  'toast-slide-in-right': {
    '0%': { transform: `translateX(calc(100% + 1rem))` },
    '100%': { transform: 'translateX(0)' },
  },
  'toast-slide-in-bottom': {
    '0%': { transform: `translateY(calc(100% + 1rem))` },
    '100%': { transform: 'translateY(0)' },
  },
  'toast-swipe-out': {
    '0%': { transform: 'translateX(var(--radix-toast-swipe-end-x))' },
    '100%': {
      transform: `translateX(calc(100% + 1rem))`,
    },
  },
  // Drawer Content
  'drawer-content-right-slide-in': {
    from: { transform: 'translate3d(100%,0,0)' },
    to: { transform: 'translate3d(0,0,0)' },
  },
  'drawer-content-right-slide-out': {
    from: { transform: 'translate3d(0,0,0)' },
    to: { transform: 'translate3d(100%,0,0)' },
  },
};

const animation = {
  // Dropdown menu
  'scale-in': 'scale-in 0.2s ease-in-out',
  'slide-down': 'slide-down 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
  'slide-up': 'slide-up 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
  // Tooltip
  'slide-up-fade': 'slide-up-fade 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
  'slide-right-fade': 'slide-right-fade 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
  'slide-down-fade': 'slide-down-fade 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
  'slide-left-fade': 'slide-left-fade 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
  // Navigation menu
  'enter-from-right': 'enter-from-right 0.25s ease',
  'enter-from-left': 'enter-from-left 0.25s ease',
  'exit-to-right': 'exit-to-right 0.25s ease',
  'exit-to-left': 'exit-to-left 0.25s ease',
  'scale-in-content': 'scale-in-content 0.2s ease',
  'scale-out-content': 'scale-out-content 0.2s ease',
  'fade-in': 'fade-in 0.2s ease',
  'fade-out': 'fade-out 0.2s ease',
  // Toast
  'toast-hide': 'toast-hide 100ms ease-in forwards',
  'toast-slide-in-right':
    'toast-slide-in-right 150ms cubic-bezier(0.16, 1, 0.3, 1)',
  'toast-slide-in-bottom':
    'toast-slide-in-bottom 150ms cubic-bezier(0.16, 1, 0.3, 1)',
  'toast-swipe-out': 'toast-swipe-out 100ms ease-out forwards',
  // Drawer
  'drawer-overlay-open': 'fade-in 150ms cubic-bezier(0.22, 1, 0.36, 1)',
  'drawer-overlay-close': 'fade-out 150ms cubic-bezier(0.22, 1, 0.36, 1)',
  'drawer-content-right-open':
    'drawer-content-right-slide-in 150ms cubic-bezier(0.22, 1, 0.36, 1)',
  'drawer-content-right-close':
    'drawer-content-right-slide-out 150ms cubic-bezier(0.22, 1, 0.36, 1)',
};

module.exports = {
  darkMode: 'class',
  content: [],
  theme: {
    extend: {
      colors,
      keyframes,
      animation,
    },
  },
  variants: {
    extends: {},
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('tailwindcss-radix')(),
    require('tailwind-scrollbar')({ nocompatible: true }),
  ],
};
