/** @type {import('tailwindcss').Config} */

const config = require('../../tailwind.config');
const merge = require('lodash.merge');

module.exports = merge(config, {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './.storybook/**/*.{js,jsx,ts,tsx}'], // Manually set the path for performance purpose
});
