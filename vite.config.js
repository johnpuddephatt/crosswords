import legacy from '@vitejs/plugin-legacy'

// vite.config.js
export default {
     plugins: [
    legacy({
      targets: ['Android 4'],
    }),
  ],
 
}