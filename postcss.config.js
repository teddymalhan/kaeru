// postcss.config.js
module.exports = {
  plugins: {
    "@tailwindcss/postcss": {},  // 👈 use this instead of "tailwindcss"
    autoprefixer: {},
  },
};
