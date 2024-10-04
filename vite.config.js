import legacy from "@vitejs/plugin-legacy";
import autoprefixer from "autoprefixer";
import vue from "@vitejs/plugin-vue2";
import tailwindcss from "tailwindcss";

// vite.config.js
export default {
  plugins: [
    vue(),
    legacy({
      targets: ["Android 4"],
    }),
  ],
  css: {
    postcss: {
      plugins: [
        autoprefixer({
          overrideBrowserslist: ["Android 4"],
        }),
        tailwindcss,
      ],
    },
  },
};
