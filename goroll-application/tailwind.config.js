/** @type {import('tailwindcss').Config} */

module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./App.tsx", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        inter: ["inter"],
        "inter-light": ["inter-light"],
        "inter-medium": ["inter-medium"],
        "inter-semibold": ["inter-semibold"],
        "inter-bold": ["inter-bold"],
        noto: ["noto"],
        "noto-light": ["noto-light"],
        "noto-medium": ["noto-medium"],
        "noto-semibold": ["noto-semibold"],
        "noto-bold": ["noto-bold"],
      },
    },
  },
  plugins: [],
};
