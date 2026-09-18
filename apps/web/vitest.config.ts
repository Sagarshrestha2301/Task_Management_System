export default {
  plugins: [],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: [],
    include: ["src/**/*.{test,spec}.{js,ts,jsx,tsx}"],
  },
};
